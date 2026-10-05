import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://igchaidmowxpyjapjybe.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_R-cPYlHjXGMiiRaMDg159g_yGE4pql7";

function readViteEnv(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().replace(/^['\"]|['\"]$/g, "");
  return normalized || fallback;
}

const SUPABASE_URL = readViteEnv(
  import.meta.env.VITE_SUPABASE_URL,
  DEFAULT_SUPABASE_URL,
);
const SUPABASE_KEY = readViteEnv(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  DEFAULT_SUPABASE_PUBLISHABLE_KEY,
);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "Supabase credentials not found. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in .env",
  );
}

const isSecureContext =
  typeof window !== "undefined" && window.location.protocol === "https:";

/**
 * Auth session storage:
 * - Cookies with Secure + SameSite=Lax (preferred over localStorage)
 * - NOT HttpOnly: @supabase/ssr requires JS-readable cookies for client
 *   session restore (official Supabase guidance). XSS mitigation relies on
 *   hardened CSP + short-lived JWTs. See planejamento/AUTH-COOKIES.md.
 */
export const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  cookieOptions: {
    path: "/",
    sameSite: "lax",
    secure: isSecureContext,
    maxAge: 60 * 60 * 24 * 7,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      "x-client-info": "dashidrive-web",
    },
  },
});

/** One-time migration: drop legacy localStorage auth keys if cookies are used. */
export function clearLegacyAuthLocalStorage() {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (
        key.startsWith("sb-") &&
        (key.includes("-auth-token") || key.includes("supabase.auth"))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore quota / private mode
  }
}

export const SUPABASE_PROJECT = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_KEY,
};
