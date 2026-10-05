# Auth cookies — trade-off HttpOnly (Epic 8)

**Data:** 23/07/2026  
**Stack:** Vite SPA + `@supabase/ssr` (`createBrowserClient`) + Vercel

## Decisão

**Não usamos cookies `HttpOnly` para a sessão Supabase no browser.**

Motivo (orientação oficial Supabase / `@supabase/ssr`):

- O cliente precisa ler o refresh/access token via `document.cookie` para restaurar a sessão sem round-trip a cada navegação.
- Forçar `HttpOnly` quebra `getSession` / `onAuthStateChange` no SPA e gera loops de redirect.

Documentação: [Advanced Auth SSR guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide) — *"How do I make the cookies HttpOnly? This is not necessary..."*

## O que foi implementado

| Controle | Status |
|----------|--------|
| Sessão em cookies (não localStorage) | ✅ `createBrowserClient` + `cookieOptions` |
| `Secure` em HTTPS | ✅ |
| `SameSite=Lax` | ✅ |
| PKCE (`flowType: 'pkce'`) | ✅ |
| Limpeza de tokens legados no `localStorage` | ✅ `clearLegacyAuthLocalStorage()` |
| CSP sem `script-src 'unsafe-inline'` | ✅ `vercel.json` |
| `HttpOnly` | ❌ consciente (trade-off) |

## Mitigações de XSS (em vez de HttpOnly)

1. CSP restritiva (`script-src 'self'` apenas; styles ainda com `'unsafe-inline'` por Tailwind/Radix)
2. `frame-ancestors 'none'`, `object-src 'none'`, COOP/CORP
3. Tokens JWT de vida curta + refresh automático
4. Sem `service_role` no frontend

## Caminho futuro (se auditoria exigir HttpOnly absoluto)

Exigiria BFF (Next.js middleware / Vercel Edge + session em memória no client), fora do escopo desta SPA Vite. Ver Epic 14 / migração SSR.
