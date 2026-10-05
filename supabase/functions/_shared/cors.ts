/** Shared CORS for admin edge functions. */

const STATIC_ORIGINS = [
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

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (STATIC_ORIGINS.includes(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(origin)) return true;
  return false;
}

export function corsHeaders(
  origin: string | null,
  methods = "GET, POST, OPTIONS",
): Record<string, string> {
  const allowed = isAllowedOrigin(origin) ? origin! : STATIC_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": methods,
    Vary: "Origin",
  };
}

export function getSecretKey(): string {
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (serviceKey) return serviceKey;

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
      // not valid JSON
    }
  }
  return Deno.env.get("SUPABASE_ANON_KEY") ?? "";
}
