# Testes sagrados — DashiDrive (Epic 12)

**Objetivo:** cobrir o que quebra o negócio (auth + dinheiro + RLS), não UI cosmética.  
**CI:** `.github/workflows/test.yml` roda `npm test` em todo PR / push em `main`.

## Pirâmide

| Camada | Onde | Quando |
|--------|------|--------|
| Unit | Vitest (`src/**/*.test.ts`) | CI em todo PR |
| Smoke SQL (RLS) | `supabase/tests/rls_cross_tenant_smoke.sql` | Staging após migration / release |
| Staging e2e webhook | Replay Asaas com secret de staging | Manual / release de billing |

## Os 8 testes sagrados

| # | Nome | Arquivo / script | O que protege |
|---|------|------------------|---------------|
| 1 | Checkout Zod (free + inválido) | `src/test/validators/critical-forms.test.ts` | Payload de cobrança inválido não passa no form |
| 2 | Checklist form Zod | `src/test/validators/critical-forms.test.ts` + `src/test/checklist/validators.test.ts` | Checklist sem veículo / campos críticos |
| 3 | Access control (trial/plano) | `src/test/access/evaluateAccessControl.test.ts` | Authz: trial 7d, paid, company, onboarding, payment_pending |
| 4 | ProtectedRoute redirects | `src/components/layout/ProtectedRoute.test.tsx` | Usuário sem acesso não entra no dashboard |
| 5 | Asaas webhook schema | `src/test/billing/asaasWebhook.test.ts` | Webhook sem subscription / amount inválido |
| 6 | Asaas idempotência (decisão) | `src/test/billing/asaasWebhook.test.ts` | Replay do mesmo event → mesma action/patch |
| 7 | Checklist service (happy path mock) | `src/test/checklist/checklist.integration.test.ts` | Fluxo checklist não regressa no service |
| 8 | RLS cross-tenant smoke | `supabase/tests/rls_cross_tenant_smoke.sql` | Empresa A não lê dados da B (staging) |

## Staging — fixtures seguros

Ver `supabase/tests/fixtures/README.md`.

**Webhook Asaas (manual staging):**

1. Criar payment de teste com `asaas_subscription_id` conhecido.  
2. POST 2× o mesmo `PAYMENT_RECEIVED` com `x-asaas-webhook-secret`.  
3. Esperado: HTTP 200 em ambos; perfil `status=ativo` / payment `APPROVED` (estado final idêntico).

## Como rodar local

```bash
npm test
npm run test:watch
```

## Regra de ouro

Se um teste sagrado falhar no CI, o PR **não** deve mergear até corrigir ou justificar com issue de follow-up (e skip só com aprovação explícita).
