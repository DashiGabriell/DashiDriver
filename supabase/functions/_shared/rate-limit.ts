import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/** Documented per-endpoint limits (requests / windowSeconds) */
export const RATE_LIMITS = {
  payment: { max: 5, windowSeconds: 60 },
  paymentStatus: { max: 10, windowSeconds: 60 },
  listing: { max: 3, windowSeconds: 60 },
  chatbot: { max: 15, windowSeconds: 60 },
  impersonate: { max: 5, windowSeconds: 60 },
  asaasWebhook: { max: 60, windowSeconds: 60 },
  admin: { max: 30, windowSeconds: 60 },
  securityScan: { max: 3, windowSeconds: 300 },
  planExpiry: { max: 5, windowSeconds: 60 },
} as const;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
};

export async function checkRateLimit(
  supabase: SupabaseClient,
  key: string,
  maxRequests: number = 10,
  windowSeconds: number = 60,
): Promise<RateLimitResult> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_max_requests: maxRequests,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    // Fail open so billing/webhooks are not hard-down if RPC is missing;
    // still log for ops visibility (no PII in key beyond opaque ids).
    console.error("Rate limit check failed:", error.message ?? error);
    return { allowed: true, remaining: maxRequests, retryAfter: 0 };
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    allowed: row?.allowed ?? true,
    remaining: row?.remaining ?? maxRequests,
    retryAfter: row?.retry_after ?? windowSeconds,
  };
}

const RATE_LIMIT_ALLOWED_ORIGINS = [
  "https://dashidrive.com",
  "https://www.dashidrive.com",
  "https://dashidrive.com.br",
  "https://www.dashidrive.com.br",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:8081",
  "http://127.0.0.1:5173",
];

export function rateLimitResponse(
  origin?: string | null,
  retryAfterSeconds: number = 60,
): Response {
  const matched =
    origin &&
    (RATE_LIMIT_ALLOWED_ORIGINS.includes(origin) ||
      /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(origin));
  const acao = matched ? origin! : RATE_LIMIT_ALLOWED_ORIGINS[0];
  const retry = Math.max(1, Math.floor(retryAfterSeconds || 60));

  return new Response(
    JSON.stringify({
      error: "Muitas requisicoes. Tente novamente em instantes.",
      retry_after: retry,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": acao,
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
        "Retry-After": String(retry),
        Vary: "Origin",
      },
    },
  );
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
