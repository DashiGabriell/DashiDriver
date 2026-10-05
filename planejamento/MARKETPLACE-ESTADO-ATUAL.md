# Marketplace — Estado Atual (pausado)

> Status: **em pausa**. O módulo foi mantido no código para ser retomado depois.
> Este documento registra o que existe, o que funciona, o que está quebrado/incompleto
> e por onde recomeçar. Atualizado em 05/10/2026.

---

## 1. Mapa do código

| Camada | Arquivos |
|---|---|
| Rotas | `src/routes/marketplace.tsx` (tudo sob `/marketplace/*`, protegido por login) |
| Layout | `src/layouts/marketplace/MarketplaceLayout.tsx` |
| Páginas | `src/pages/marketplace/` — `MarketplaceHome`, `MarketplaceSearch`, `MarketplaceDetail`, `MarketplaceSell`, `MarketplaceOrders` (rota `/wishlist`), `MarketplaceProfile`, `MarketplaceMyAds`, `MarketplaceProposals`, `Inspection`, `InspectionsList` |
| Componentes | `src/components/marketplace/*` |
| Serviços | `src/integrations/supabase/services/marketplaceService.ts`, `marketplaceInspectionService.ts` |
| Edge function | `supabase/functions/marketplace-create-listing` (schema em `_shared/schemas.ts`) |
| Planos/limites | `src/lib/billing/plans.ts` (`MKT_PLAN_LIMITS`: FREE 1 / PRO 10 / ELITE 25), reexportado em `src/data/planLimits.ts` |
| Cobrança | `supabase/functions/process-payment` (slugs `marketplace-free/pro/elite`, preços 0/119/299) e checkouts `src/pages/checkout/CheckoutMarketplace*` |
| Marketing | `src/pages/MarketplaceLanding.tsx` (`/lp-marketplace`) |
| Ajuda | `src/pages/ajuda/marketplace/*` |

### Rotas

| Rota | Página | Situação |
|---|---|---|
| `/marketplace/home` | Vitrine | Funciona (lista anúncios ativos, destaque por `is_featured`) |
| `/marketplace/search` | Busca com filtros | Funciona; filtros `garagem`/`tempo_plataforma` nunca casam (ver 3.4) |
| `/marketplace/detail/:id` | Detalhe do anúncio | Funciona; contato via WhatsApp |
| `/marketplace/sell` | Criar anúncio | Funciona parcialmente (campos perdidos, ver 3.4) |
| `/marketplace/my-ads` | Meus anúncios | Funciona (editar/pausar), mostra limite do plano |
| `/marketplace/wishlist` | Favoritos | Funciona |
| `/marketplace/proposals` | Propostas | Tela existe, mas não recebe propostas reais (ver 3.1) |
| `/marketplace/profile` | Perfil do vendedor | Funciona; link "Meus Favoritos" quebrado (ver 3.5) |
| `/marketplace/inspection/:listingId` | Vistoria | Funciona, só para logados (ver 3.6) |
| `/marketplace/inspections/:listingId` | Histórico de vistorias | Funciona |

---

## 2. O que já funciona

- Publicação de anúncio com fotos (via edge function, com rate limit e checagem de `company_id`).
- Vitrine, busca, detalhe, favoritos e "meus anúncios".
- Vistoria com checklist e histórico por anúncio.
- Planos `FREE/PRO/ELITE` vendáveis pelo checkout (preço agora validado no servidor).

---

## 3. Lacunas conhecidas

### 3.1 Propostas não são criadas
`createProposal()` existe em `marketplaceService.ts`, mas **nenhuma tela chama**. O botão de contato
do detalhe abre o WhatsApp direto (só incrementa `whatsappClicks`). A página de Propostas, na prática,
mostra cliques no WhatsApp, e o contador "Contatos Enviados" do perfil (`listSentProposals`) fica sempre em zero.
**Retomar:** chamar `createProposal` no CTA do `MarketplaceDetail` (antes ou junto do WhatsApp).

### 3.2 Destaque e selo não ligados ao plano
`is_featured` (anúncio) e `is_verified` (vendedor) são lidos e ordenam a vitrine, mas nada os grava.
A landing promete "destaque" no PRO/ELITE.
**Retomar:** ao ativar plano no `asaas-webhook`/`process-payment`, marcar anúncios/perfil conforme o plano.

### 3.3 Limite de anúncios só no cliente
`checkPlanLimit()` roda no navegador antes de chamar `marketplace-create-listing`.
A edge function **não** revalida, então dá para burlar chamando a função direto.
**Retomar:** contar anúncios ativos da `company_id` dentro da edge function e comparar com `mkt_plan`.

### 3.4 Campos do anúncio descartados
`MarketplaceSell` coleta `marca`, `modelo`, `ano`, `cambio`, `ar_condicionado`, `direcao`,
`combustivel`, `valor_caucao`, `garagem`, `tempo_plataforma`, mas `createMarketplaceListing()`
só envia título/descrição/preço/categoria/condição/cidade/UF. Resultado: filtros da busca por esses campos nunca retornam nada.
**Retomar:** incluir os campos no body e declará-los explicitamente no schema Zod (ver 3.9).

### 3.9 Edge function aceita colunas arbitrárias (segurança)
`marketplaceCreateListingSchema` usa `.passthrough()` e a função faz `insert({ ...listingData })`.
Chamando a função direto, dá para gravar qualquer coluna de `marketplace_listings` (ex.: `is_featured: true`).
Hoje só `status`, `listing_type`, `company_id` e `seller_user_id` são sobrescritos.
**Retomar:** trocar `.passthrough()` por `.strict()` com a lista de campos permitidos.

### 3.5 Link quebrado
`MarketplaceProfile` aponta "Meus Favoritos" para `/marketplace/favorites`; a rota real é `/marketplace/wishlist`.

### 3.6 Vistoria exige login
Todo `/marketplace/*` fica sob `ProtectedRoute`. Se a ideia é o comprador ver a vistoria por link,
é preciso uma rota pública somente leitura.

### 3.7 Sem porta de entrada
Nenhum menu da gestão (`Sidebar`) leva ao marketplace; só se chega por URL direta ou pela landing.

### 3.8 Landing promete mais do que existe
`/lp-marketplace` cita recursos (propostas, destaque, verificação) que dependem dos itens 3.1–3.3.

---

## 4. Ordem sugerida para retomar

1. Corrigir 3.5 (link) e 3.4 + 3.9 juntos (campos explícitos no schema) — baixo esforço, destrava busca e fecha a brecha.
2. 3.3 — limite no servidor (segurança/receita).
3. 3.1 — propostas reais.
4. 3.2 — benefícios do plano (destaque/verificado).
5. 3.7 e 3.8 — entrada pela gestão e revisão da landing.
6. 3.6 — vistoria pública, se fizer sentido para o produto.

---

## 5. Relacionados

- `planejamento/BACKEND-MODULO-LOJISTA.md` — portal lojista (outro satélite, também não ligado).
- `planejamento/PRODUCT-BOUNDARIES.md` — fronteiras entre core/satellite/platform.
