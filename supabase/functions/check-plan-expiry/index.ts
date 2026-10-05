import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "../_shared/rate-limit.ts";

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
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders(req.headers.get("origin")) });
  }

  const _secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "[]");
  const _secretKey = _secretKeys[0] ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    _secretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: { headers: { apikey: _secretKey } },
    },
  );

  const { allowed, retryAfter } = await checkRateLimit(
    supabaseAdmin,
    "plan:cron",
    RATE_LIMITS.planExpiry.max,
    RATE_LIMITS.planExpiry.windowSeconds,
  );
  if (!allowed) return rateLimitResponse(req.headers.get("origin"), retryAfter);

  // Validar cron secret
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret !== Deno.env.get("CRON_SECRET")) {
    return new Response(
      JSON.stringify({ error: "Não autorizado" }),
      { status: 401, headers: { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" } },
    );
  }

  try {
    const { data, error } = await supabaseAdmin.rpc("check_plan_expiry");

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, notifications_created: data }),
      { headers: { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message ?? "Erro" }),
      { status: 400, headers: { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" } },
    );
  }
});
