# Matriz de acesso RLS — DashiDrive (Epic 9)

**Data:** 23/07/2026  
**Migration:** `supabase/migrations/20260723000002_rls_consolidation.sql`  
**Helpers:** `is_dev_user()`, `current_profile_company_id()`, `is_same_company(uuid)`

## Legenda

| Símbolo | Significado |
|---------|-------------|
| Own | Apenas o próprio `auth.uid()` |
| Tenant | Mesmo `company_id` do perfil |
| Dev | `role = 'dev'` |
| Edge/SR | Service role / Edge Function (bypassa RLS) |
| — | Sem acesso via client |

## Tabelas críticas

| Tabela | SELECT | INSERT | UPDATE | DELETE | Notas |
|--------|--------|--------|--------|--------|-------|
| `carcontrol_profiles` | Own \| Dev | Own | Own | — | Sem promoção de role via client |
| `carcontrol_companies` | Tenant \| Dev | Edge/onboarding | Tenant | — / Dev | |
| `carcontrol_vehicles` | Tenant \| Dev | Tenant \| Dev | Tenant \| Dev | Tenant \| Dev | |
| `carcontrol_drivers` | Tenant \| Dev | Tenant \| Dev | Tenant \| Dev | Tenant \| Dev | Se existir |
| `payments` | Own \| Dev | Edge | Edge | — | Checkout via Edge |
| `coupons` | Active \| Dev | Edge/Dev | Edge/Dev | — | |
| `notifications` | Own \| Dev | Own \| sistema | Own | Own | |
| `checklists` | Tenant \| Dev | Tenant \| Dev | Tenant \| Dev | Tenant \| Dev | |
| `checklist_images` | Via checklist tenant | Tenant | Tenant | Tenant | Preferir policies ligadas ao checklist |
| `marketplace_listings` | Active público + seller/tenant | Seller/tenant | Seller/tenant | Seller | Ver `supabase/marketplace/*` |
| `impersonate_tokens` | Dev | Edge (service) | — | — | |
| `access_logs` | admin/dev | Own | — | — | |
| `rate_limits` | — | RPC SECURITY DEFINER | — | — | Client bloqueado |

## Policies removidas automaticamente

Por nome ou `USING/WITH CHECK (true)` em tabelas tenant:

- `*dev_select_all*`, `*dev_all*`, `*select_all_authenticated*`, `*allow_all*`, `*bypass*`

## Smoke cross-tenant (manual / SQL Editor)

Script: `supabase/tests/rls_cross_tenant_smoke.sql`

1. Criar (ou usar) dois users A e B em empresas distintas  
2. Autenticar como A → `SELECT` em vehicles/checklists de B deve retornar 0 linhas  
3. Autenticar como Dev → pode ler (helpers)  
4. `SELECT * FROM rate_limits` como authenticated → 0 / denied  

## Auditoria contínua

```sql
-- Como service_role / SQL editor
SELECT * FROM public.rls_policy_snapshot
WHERE tablename IN ('carcontrol_vehicles','payments','checklists','coupons');
```
