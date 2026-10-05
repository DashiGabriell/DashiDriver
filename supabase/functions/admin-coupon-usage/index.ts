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

function getSecretKey(): string {
  const keysEnv = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (keysEnv) {
    try {
      const parsed = JSON.parse(keysEnv);
      if (typeof parsed === "string") return parsed;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      if (parsed.default) return parsed.default;
      const values = Object.values(parsed);
      if (values.length > 0) return String(values[0]);
    } catch {
      // not valid JSON, try raw string
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("SUPABASE_ANON_KEY") ?? "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req.headers.get("origin")) });

  try {
    const _secretKey = getSecretKey();
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";

    if (!_secretKey) throw new Error("Secret key nao disponivel");

    const supabase = createClient(supabaseUrl, _secretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { apikey: _secretKey } },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Token ausente");

    const jwt = authHeader.replace("Bearer ", "");

    const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${jwt}`,
        "apikey": _secretKey,
      },
    });

    if (!userResp.ok) throw new Error("Nao autenticado");

    const userData: { id: string } = await userResp.json();

    const { allowed, retryAfter } = await checkRateLimit(
      supabase,
      `coupon:${userData.id}`,
      RATE_LIMITS.admin.max,
      RATE_LIMITS.admin.windowSeconds,
    );
    if (!allowed) return rateLimitResponse(req.headers.get("origin"), retryAfter);

    const { data: profile } = await supabase
      .from("carcontrol_profiles")
      .select("role")
      .eq("id", userData.id)
      .maybeSingle();

    if (profile?.role !== "dev") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { couponCode } = body;

    if (couponCode) {
      const { data: payments, error } = await supabase
        .from("payments")
        .select("id, user_id, plan, amount, discount_amount, status, paid_at, created_at")
        .eq("coupon_code", couponCode)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = [...new Set((payments ?? []).map((p: Record<string, unknown>) => p.user_id as string))];

      const { data: profiles } = await supabase
        .from("carcontrol_profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      const profileMap = new Map((profiles ?? []).map((p: Record<string, unknown>) => [p.id, p]));

      return new Response(JSON.stringify((payments ?? []).map((p: Record<string, unknown>) => ({
        id: p.id,
        user_id: p.user_id,
        plan: p.plan,
        amount: Number(p.amount),
        discount_amount: Number(p.discount_amount),
        status: p.status,
        paid_at: p.paid_at,
        created_at: p.created_at,
        profile_name: (profileMap.get(p.user_id as string) as Record<string, string | null> | undefined)?.full_name ?? null,
        profile_email: (profileMap.get(p.user_id as string) as Record<string, string | null> | undefined)?.email ?? null,
      }))), {
        headers: { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
      });
    }

    const { data: allPayments, error: allError } = await supabase
      .from("payments")
      .select("coupon_code, user_id")
      .not("coupon_code", "is", null);

    if (allError) throw allError;

    const allUserIds = [...new Set((allPayments ?? []).map((p: Record<string, unknown>) => p.user_id as string))];

    const { data: allProfiles } = await supabase
      .from("carcontrol_profiles")
      .select("id, full_name, email")
      .in("id", allUserIds);

    const allProfileMap = new Map((allProfiles ?? []).map((p: Record<string, unknown>) => [p.id, p]));

    const usageMap = new Map<string, { totalUses: number; uniqueUsers: number; users: Array<{ name: string | null; email: string | null }> }>();

    for (const p of allPayments ?? []) {
      const code = (p as Record<string, string | null>).coupon_code;
      if (!code) continue;
      if (!usageMap.has(code)) {
        usageMap.set(code, { totalUses: 0, uniqueUsers: 0, users: [] });
      }
      const summary = usageMap.get(code)!;
      summary.totalUses++;

      const profile = allProfileMap.get((p as Record<string, string>).user_id) as Record<string, string | null> | undefined;
      const entry = { name: profile?.full_name ?? null, email: profile?.email ?? null };

      if (!summary.users.some((u) => u.email === entry.email && u.name === entry.name)) {
        summary.users.push(entry);
      }
    }

    for (const summary of usageMap.values()) {
      summary.uniqueUsers = summary.users.length;
    }

    return new Response(JSON.stringify(Object.fromEntries(usageMap)), {
      headers: { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
    });
  }
});
