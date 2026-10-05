import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "../_shared/rate-limit.ts";
import { marketplaceCreateListingSchema } from "../_shared/schemas.ts";
import { readAndParseJsonBody } from "../_shared/validate.ts";

const ALLOWED_ORIGINS = [
  "https://dashidrive.com",
  "https://dashidrive.com.br",
  "http://localhost:8080",
];
const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req.headers.get("origin")) });

  try {
    const _secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "[]");
    const _secretKey = _secretKeys[0] ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      _secretKey,
      {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { apikey: _secretKey } },
      }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Token de autenticacao ausente");

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userError || !user) throw new Error("Usuario nao autenticado");

    const { allowed, retryAfter } = await checkRateLimit(
      supabase,
      `listing:${user.id}`,
      RATE_LIMITS.listing.max,
      RATE_LIMITS.listing.windowSeconds,
    );
    if (!allowed) return rateLimitResponse(req.headers.get("origin"), retryAfter);

    const headers = corsHeaders(req.headers.get("origin"));
    const parsed = await readAndParseJsonBody(req, marketplaceCreateListingSchema, headers);
    if (!parsed.ok) return parsed.response;

    const { companyId, ...listingData } = parsed.data;

    const { data: profile } = await supabase
      .from("carcontrol_profiles")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.company_id !== companyId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
      });
    }

    // TODO(marketplace): o schema é passthrough e não há checagem do limite do plano aqui.
    // Ver planejamento/MARKETPLACE-ESTADO-ATUAL.md, itens 3.3 e 3.9.
    const { data, error } = await supabase
      .from("marketplace_listings")
      .insert({
        ...listingData,
        company_id: companyId,
        seller_user_id: user.id,
        listing_type: "rental",
        status: "active",
      })
      .select("id, company_id")
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
    });
  }
});
