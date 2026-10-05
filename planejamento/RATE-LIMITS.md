# Rate Limits — Edge Functions

Fonte de verdade: `supabase/functions/_shared/rate-limit.ts` (`RATE_LIMITS`).

| Endpoint | Key pattern | Max | Window |
|----------|-------------|-----|--------|
| `process-payment` | `payment:{userId}` | 5 | 60s |
| `check-payment-status` | `pstatus:{userId}` | 10 | 60s |
| `marketplace-create-listing` | `listing:{userId}` | 3 | 60s |
| `chatbot-query` | `chatbot:{userId}` | 15 | 60s |
| `impersonate-user` | `impersonate:{userId}` | 5 | 60s |
| `asaas-webhook` | `asaas:{ip}` | 60 | 60s |
| `admin-*` | `billing:` / `coupon:` / `admin:{userId}` | 30 | 60s |
| `trigger-security-scan` | `scan:{userId}` | 3 | 300s |
| `check-plan-expiry` | `plan:cron` | 5 | 60s |

## Comportamento

- RPC Postgres: `public.check_rate_limit(p_key, p_max_requests, p_window_seconds)`
- Migration: `supabase/migrations/20260723000001_ensure_rate_limits.sql`
- Resposta `429` com `Retry-After` e body `{ error, retry_after }`
- Se a RPC falhar, o helper **fail-open** (permite a request) e loga o erro — evita derrubar billing/webhook

## Validação Zod

Schemas em `supabase/functions/_shared/schemas.ts`, parse em `_shared/validate.ts`.
Aplicado em: payment, payment-status, listing, webhook Asaas, impersonate, chatbot.
