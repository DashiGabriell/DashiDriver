import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "../_shared/rate-limit.ts";
import { impersonateUserSchema } from "../_shared/schemas.ts";
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

  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);

  try {
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Nao autenticado" }), {
        status: 401,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const tokenStr = authHeader.replace("Bearer ", "");

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(tokenStr);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Nao autenticado" }), {
        status: 401,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const { allowed, retryAfter } = await checkRateLimit(
      supabaseAdmin,
      `impersonate:${user.id}`,
      RATE_LIMITS.impersonate.max,
      RATE_LIMITS.impersonate.windowSeconds,
    );
    if (!allowed) return rateLimitResponse(origin, retryAfter);

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("carcontrol_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Perfil nao encontrado" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }
    if (profile.role !== "dev") {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const parsed = await readAndParseJsonBody(req, impersonateUserSchema, headers);
    if (!parsed.ok) return parsed.response;

    const { target_user_id } = parsed.data;

    const { data: targetProfile, error: targetError } = await supabaseAdmin
      .from("carcontrol_profiles")
      .select("id, email, full_name")
      .eq("id", target_user_id)
      .maybeSingle();

    if (targetError || !targetProfile) {
      return new Response(JSON.stringify({ error: "Usuario alvo nao encontrado" }), {
        status: 404,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }
    if (!targetProfile.email) {
      return new Response(JSON.stringify({ error: "Usuario alvo sem email" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const impersonateToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();

    const { error: insertError } = await supabaseAdmin
      .from("impersonate_tokens")
      .insert({
        email: targetProfile.email,
        token: impersonateToken,
        expires_at: expiresAt,
        created_by: user.id,
      });

    if (insertError) {
      return new Response(JSON.stringify({ error: "Falha ao gerar token" }), {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      email: targetProfile.email,
      nome: targetProfile.full_name,
      token: impersonateToken,
    }), {
      headers: { ...headers, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }
});
