import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "../_shared/rate-limit.ts";
import { corsHeaders, getSecretKey } from "../_shared/cors.ts";

serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin, "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const secretKey = getSecretKey();
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    if (!secretKey) throw new Error("Secret key nao disponivel");

    const supabase = createClient(supabaseUrl, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { apikey: secretKey } },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Token ausente");

    const jwt = authHeader.replace("Bearer ", "");
    const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
        apikey: secretKey,
      },
    });
    if (!userResp.ok) throw new Error("Nao autenticado");

    const userData: { id: string } = await userResp.json();

    const { allowed, retryAfter } = await checkRateLimit(
      supabase,
      `admin-events:${userData.id}`,
      RATE_LIMITS.admin.max,
      RATE_LIMITS.admin.windowSeconds,
    );
    if (!allowed) return rateLimitResponse(origin, retryAfter);

    const { data: profile } = await supabase
      .from("carcontrol_profiles")
      .select("role")
      .eq("id", userData.id)
      .maybeSingle();

    if (profile?.role !== "dev") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const tipo = url.searchParams.get("tipo");
    const severidade = url.searchParams.get("severidade");
    const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);

    // Schema real: id, tipo, titulo, descricao, severidade, data, user_id, created_at, updated_at, company_id
    // (sem lido/resolvido/vehicle_id/motorista_id)
    let query = supabase
      .from("carcontrol_alerts")
      .select("id, tipo, titulo, descricao, severidade, data, created_at, company_id, user_id")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (tipo && tipo !== "all") query = query.eq("tipo", tipo);
    if (severidade && severidade !== "all") query = query.eq("severidade", severidade);

    const { data, error } = await query;
    if (error) throw error;

    return new Response(JSON.stringify(data ?? []), {
      headers: { ...headers, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }
});
