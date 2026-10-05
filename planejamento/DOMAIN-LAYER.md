# Camada de domínio (services)

**Epic 11** — páginas e hooks não falam SQL/Supabase solto para regras de negócio.

## Convenção

```
Page / Component
  → hook fino (React Query / estado UI)
    → service tipado (`src/integrations/supabase/services/<dominio>.ts`)
      → Supabase client / RPC / Edge Function
```

| Domínio | Service | Produto |
|---------|---------|---------|
| Checklists | `checklistService.ts` | Core |
| Vehicles | `vehicleService.ts` | Core |
| Drivers | `driverService.ts` | Core |
| Payments | `paymentService.ts` | Core (gestão) / Platform (Asaas) |
| Maintenances | `maintenanceService.ts` | Core |
| Profile / company | `profileService.ts` | Platform / Core |
| Alerts | `alertService.ts` | Core |
| Notifications | `notificationService.ts` | Core |
| Marketplace | `marketplaceService.ts` | Satélite |
| … | outros em `services/` | ver PRODUCT-BOUNDARIES.md |

## Regras

1. **Novo código em `src/pages/**`**: não adicionar `supabase.from(...)` para CRUD de domínio. Use o service (ou um hook que chama o service).
2. **Storage / auth session** podem continuar no client onde o service ainda não cobre (upload de arquivo, `signOut`).
3. **Erros**: use `toServiceError` / `getErrorMessage` de `services/errors.ts` antes do toast.
4. **Tipagem**: preferir `Tables` / `TablesInsert` de `types.ts`; campos fora do dump tipado usam extensão local no service (ex.: `km_atual` em manutenções).
5. **RLS**: services não filtram `company_id` no client quando a coluna não existe no tipo/schema tipado — o tenant é garantido pela RLS.

## Hooks compartilhados (Epic 10)

| Hook | Uso |
|------|-----|
| `useChecklistsList` | Desktop + mobile lista de checklists |
| `useDriversList` / `useMobileMotoristas` | Motoristas |
| `usePaymentsList` / `useMobilePagamentos` | Pagamentos enriquecidos |
| `useMaintenancesList` / `useMobileManutencao` | Manutenções |
| `useVehiclesList` | Veículos |
| `useNotifications` | Alertas desktop + mobile |

Layouts desktop e mobile permanecem separados; a regra de negócio fica no service/hook.

## Produtos (Epic 14 — Opção B)

| Camada | Domínios |
|--------|----------|
| **Core** | Vehicles, drivers, payments (locação), checklists, maintenances, alerts, notifications, profile/company (gestão) |
| **Satélite** | Marketplace listings / inspections; lojista portal |
| **Platform** | Auth, checkout shell, webhook billing, `/dev` |

Boundaries e ownership: `planejamento/PRODUCT-BOUNDARIES.md`.  
Rotas compostas via `src/products/{core,satellite,platform}`.  
Core **não** importa páginas/componentes de marketplace ou lojista.

## ESLint

Em `src/pages/**/*.{ts,tsx}` há `no-restricted-imports` avisando import direto de `@/integrations/supabase/client` (exceto casos legados já existentes — warn). Novas queries devem ir para services.

**Epic 14 — boundary de produto:** em pages/components/hooks de **core** (gestão flat + `mobile/`), é **erro** importar módulos de marketplace/lojista. Ver `planejamento/PRODUCT-BOUNDARIES.md` e `src/products/`.

Em arquivos **core** (pages flat + `pages/mobile` + `components/mobile` + `hooks/mobile`) há `no-restricted-imports` **error** contra satélite (`marketplace` / `lojista`). Ver `PRODUCT-BOUNDARIES.md`.
