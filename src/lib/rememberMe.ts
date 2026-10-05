import { supabase } from "@/integrations/supabase/client";

const NO_REMEMBER_KEY = "dashidrive_no_remember";
// Cookie sem Max-Age: é compartilhado entre abas e o navegador o apaga ao ser fechado
const ALIVE_COOKIE = "dashidrive_session_alive";

function hasAliveCookie() {
  return document.cookie.split("; ").some((cookie) => cookie === `${ALIVE_COOKIE}=1`);
}

export function setRememberMe(remember: boolean) {
  try {
    if (remember) {
      localStorage.removeItem(NO_REMEMBER_KEY);
    } else {
      localStorage.setItem(NO_REMEMBER_KEY, "1");
      document.cookie = `${ALIVE_COOKIE}=1; path=/; SameSite=Lax`;
    }
  } catch {
    // modo privado / storage bloqueado: mantém a sessão padrão
  }
}

/** Encerra a sessão se o usuário desmarcou "Lembrar-me" e o navegador foi fechado desde o login. */
export async function enforceRememberMe() {
  try {
    if (localStorage.getItem(NO_REMEMBER_KEY) !== "1" || hasAliveCookie()) return;
    localStorage.removeItem(NO_REMEMBER_KEY);
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // nunca bloquear a inicialização do app
  }
}

supabase.auth.onAuthStateChange((event) => {
  if (event !== "SIGNED_OUT") return;
  try {
    localStorage.removeItem(NO_REMEMBER_KEY);
  } catch {
    // ignore
  }
});
