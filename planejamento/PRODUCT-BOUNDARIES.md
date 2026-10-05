# Product boundaries — DashiDrive (Epic 14)

**Decisão:** Opção B — Core primeiro  
**Data:** 24/07/2026  
**Core:** módulo de **gestão** (desktop + mobile)

## Camadas

| Camada | Escopo | Onde no código |
|--------|--------|----------------|
| **Core** | Gestão desktop + mobile (mesma regra; layouts diferentes) | `src/routes/gestao.tsx`, `src/routes/mobile.tsx`, `src/pages/*.tsx` (gestão), `src/pages/mobile/`, `src/components/mobile/`, `src/hooks/mobile/`, `src/products/core/` |
| **Satélite** | Marketplace + lojista (+ ajuda dessas áreas) | `src/routes/marketplace.tsx`, `src/routes/lojista.tsx`, `src/pages/marketplace/`, `src/pages/lojista/`, `src/components/marketplace/`, `src/components/lojista/`, `src/layouts/marketplace/`, `src/products/satellite/` |
| **Platform** | Auth, checkout shell, `/dev`, providers, rotas públicas/ajuda compartilhadas | `src/App.tsx`, `src/routes/public.tsx`, `checkout.tsx`, `dev.tsx`, `ajuda.tsx`, `src/products/platform/` |

SPA única. Sem monorepo `apps/` e sem deploy separado nesta fatia.

```text
platform ──► core
platform ──► satellite
core     ─X─► satellite   (proibido import direto)
satellite ──► shared (ui, auth, company, access, services de domínio core)
```

## Onde commitar

| Tipo de mudança | Commit em |
|-----------------|-----------|
| Frota, motoristas, pagamentos gestão, checklist, KM, manutenção, alertas, mobile app | **Core** |
| Vitrine, anúncios, inspeção marketplace, portal lojista | **Satélite** |
| Login, checkout Asaas, webhook, `/dev`, CSP, auth cookies | **Platform** |
| Schema/RLS multi-tenant comum | Platform + revisar matriz RLS |
| Limites `saas_plan` | Core billing (`src/lib/billing/plans.ts`) |
| Limites `mkt_plan` | Satélite billing (mesmo arquivo, seção MARKETPLACE) |

Barrels de rota: `src/products/{core,satellite,platform}` — `AppRoutes` compõe via esses entrypoints.

## Regra de imports

- **Core não importa** `@/pages/marketplace|lojista`, `@/components/marketplace|lojista`, `@/layouts/marketplace`.
- Preferir **URL string** para pontes (ex.: WhatsApp de checklist → `/marketplace/inspection/...`).
- Satélite **pode** usar shared: `@/components/ui`, auth, `useCompany`, `evaluateAccessControl`, services de domínio.
- Enforcement: ESLint `no-restricted-imports` nos paths de core (ver `eslint.config.js`).

## Billing

- Gestão: `saas_plan` + `SAAS_PLAN_LIMITS` (core).
- Marketplace: `mkt_plan` + `MKT_PLAN_LIMITS` (satélite).
- Fonte única: [`src/lib/billing/plans.ts`](../src/lib/billing/plans.ts).
- Webhook Asaas permanece **platform** (um handler, `planDef` dual).

## Métricas leves

- PRs tagueados ou paths tocados: `% core` vs `% satellite` vs `% platform`.
- Incidentes cross-produto (ex.: change de marketplace quebra dashboard).
- Bundle: chunks já separados por área (Epic 4); monitorar regressão no chunk inicial.

## Follow-ups (fora desta fatia)

- Monorepo Opção A (`apps/gestao`, `apps/marketplace`)
- Deploy independente por produto
- Epic 10 — unificar páginas desktop × mobile
- Mover pages flat de gestão para `pages/gestao/`
- Feature flags marketplace/lojista
- Schema/RLS por bounded context mais agressivo

## Docs relacionados

- [`PLANO-EXECUCAO-MELHORIAS.md`](./PLANO-EXECUCAO-MELHORIAS.md) — Epic 14
- [`DOMAIN-LAYER.md`](./DOMAIN-LAYER.md) — services + coluna de produto
- [`src/products/README.md`](../src/products/README.md)
