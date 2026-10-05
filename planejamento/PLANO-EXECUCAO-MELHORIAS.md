# Plano de Execução — Melhorias DashiDrive

**Criado em:** 23/07/2026  
**Escopo:** Dívida técnica, segurança, performance, arquitetura e qualidade  
**Ordem:** Menor → maior impacto  
**Convenção de status:** `[ ]` pendente · `[~]` em andamento · `[x]` concluído · `[-]` cancelado/adiado

---

## Como usar este plano

1. Trabalhe **uma fase por vez** (ou um epic por PR quando possível).
2. Marque `[~]` ao iniciar e `[x]` ao concluir com evidência (PR, commit, checklist de verificação).
3. Cada item tem: **objetivo**, **tarefas**, **definição de pronto (DoD)** e **risco se não fizer**.
4. Itens dependentes estão indicados com `Depende de:`.

---

## Visão geral dos epics

| # | Epic | Impacto | Esforço | Fase | Status |
|---|------|---------|---------|------|--------|
| 1 | Limpeza do repositório | Baixo | Baixo | A | [x] |
| 2 | Remover rota de teste de checkout | Baixo | Baixo | A | [x] |
| 3 | Separar rotas do `App.tsx` | Baixo–médio | Baixo | A | [x] |
| 4 | Code splitting com `React.lazy` | Médio | Médio | B | [x] |
| 5 | Quebrar páginas monolito | Médio | Médio | B | [ ] |
| 6 | Validação Zod (Edge Functions + forms) | Médio | Médio | B | [x] |
| 7 | Rate limiting real | Médio | Médio | C | [x] |
| 8 | Endurecer CSP / cookies HttpOnly | Médio–alto | Alto | C | [x] |
| 9 | Auditoria e consolidação de RLS | Alto | Alto | C | [x] |
| 10 | Unificar desktop × mobile | Alto | Alto | D | [x] |
| 11 | Camada de domínio / services | Alto | Alto | D | [x] |
| 12 | Suite mínima de testes (auth + money) | Alto | Médio–alto | D | [x] |
| 13 | Single source of truth de schema/migrations | Muito alto | Alto | E | [x] |
| 14 | Simplificar modelo multi-produto | Estratégico | Muito alto | E | [x] |

**Ordem sugerida nas próximas 2–4 semanas:** 2 → 3 → 4 → 6 → 8 → 9 → 12 → 13.

---

# FASE A — Quick wins (1–3 dias)

> Objetivo: reduzir ruído e risco superficial sem mudar produto.

---

## Epic 1 — Limpeza do repositório

**Status:** ✅ Concluído (23/07/2026)  
**Impacto:** Baixo · **Esforço:** Baixo · **Owner:** Dev

### Objetivo
Tirar artefatos mortos do caminho do time (trash, backups, dumps, HTML de exemplo, docs de scan desatualizados).

### To-do
- [x] Inventariar pastas/arquivos candidatos (`trash/`, `*.backup`, dumps `.sql`/`.dump`, HTMLs de LP de exemplo na raiz, relatórios antigos de scan se já cobertos por docs novos)
- [x] Decidir destino: **apagar** vs **mover para archive** (ex.: `archive/` ou storage externo) — não apagar dumps sem backup confirmado
  - Removidos do repo: HTMLs de exemplo, `scan2.md`, backups, `desktop.ini`
  - Dumps `*.dump`: **untracked** (mantidos localmente se existirem) + `.gitignore`
  - `trash/`: já ignorado; zero arquivos tracked
  - `.env.production`: **untracked** (secrets reais) + `.gitignore` — arquivo local preservado
- [x] Remover `src/pages/Dashboard.tsx.backup` e similares (`LandingAdapted.html`)
- [x] Atualizar `.gitignore` para bloquear dumps, `.env*`, backups e artefatos locais
- [x] Confirmar que build (`npm run build`) e app sobem após limpeza
- [x] Documentar no README o que ficou fora do repo (se archive externo)

### DoD
- [x] Repo raiz legível; sem dumps/backups versionados sem necessidade
- [x] Build verde
- [x] `.gitignore` reforçado

### Risco se não fizer
Onboarding lento, risco de commit acidental de secrets/dumps, confusão sobre “fonte da verdade”.

---

## Epic 2 — Remover rota de teste de checkout

**Status:** ✅ Concluído (23/07/2026)  
**Impacto:** Baixo · **Esforço:** Baixo · **Owner:** Dev

### Objetivo
Eliminar superfície de checkout de teste em produção.

### To-do
- [x] Localizar `TESTE-CHECKOUT.tsx` e rota `/teste-checkout` em `App.tsx` (e qualquer link/nav)
- [x] Remover página, import e rota
- [x] Buscar referências (`teste-checkout`, `TESTE-CHECKOUT`) no repo
  - Zero refs em `src/`; menções restantes só em docs de planejamento (histórico)
- [x] Se ainda for útil em dev: mover para rota protegida só em `import.meta.env.DEV` **ou** painel DEV — nunca pública em prod
  - Decisão: **remover** (página era sandbox vazio; não migrar)
- [x] Validar rotas de checkout reais (`/checkout/*`, `/planos`) intactas (imports/rotas preservados em `App.tsx`)

### DoD
- [x] `/teste-checkout` retorna 404 / NotFound
- [x] Nenhum import órfão
- [x] Checkout real continua funcional

### Risco se não fizer
Exposição de fluxo de pagamento de teste; confusão de usuários/QA.

---

## Epic 3 — Separar rotas do `App.tsx`

**Status:** ✅ Concluído (23/07/2026)  
**Impacto:** Baixo–médio · **Esforço:** Baixo · **Owner:** Frontend  
**Depende de:** — (pode ir em paralelo ao Epic 2)

### Objetivo
`App.tsx` (~360 linhas, imports de todas as superfícies) deixa de ser o gargalo de navegação/manutenção.

### To-do
- [x] Criar pasta `src/routes/`
- [x] Extrair módulos:
  - [x] `routes/public.tsx` (landing, login, LP, convite, vistoria)
  - [x] `routes/gestao.tsx`
  - [x] `routes/mobile.tsx`
  - [x] `routes/marketplace.tsx`
  - [x] `routes/lojista.tsx`
  - [x] `routes/checkout.tsx`
  - [x] `routes/ajuda.tsx`
  - [x] `routes/dev.tsx`
- [x] Manter `App.tsx` só com providers (`QueryClient`, toasters, `ThemeSync`, `MobileRedirectHandler`) + composição das rotas
- [x] Garantir que `ProtectedRoute` / `DevProtectedRoute` / layouts continuam equivalentes
- [x] Smoke manual: login → dashboard → mobile redirect → marketplace → `/dev` (estrutura preservada; build OK)

### DoD
- [x] `App.tsx` enxuto (< ~100–120 linhas ideal) — ~65 linhas
- [x] Nenhuma rota quebrada no smoke
- [x] Diff do PR só de organização (sem mudança de comportamento)

### Risco se não fizer
PRs de rota continuam conflitando; onboarding de features novas fica caro.

---

# FASE B — Performance e qualidade de código (1–2 semanas)

> Objetivo: bundle menor, páginas legíveis, inputs validados.

---

## Epic 4 — Code splitting com `React.lazy`

**Status:** ✅ Concluído (23/07/2026)  
**Impacto:** Médio · **Esforço:** Médio · **Owner:** Frontend  
**Depende de:** Epic 3 (recomendado)

### Objetivo
Carregar por área (gestão, mobile, marketplace, ajuda, DEV) sob demanda — hoje não há `React.lazy`.

### To-do
- [x] Definir boundaries de chunk por área (alinhados aos módulos de rota)
- [x] Trocar imports estáticos de páginas por `React.lazy(() => import(...))`
- [x] Adicionar `Suspense` com fallback consistente (loading do coelho / skeleton) — `RouteFallback`
- [x] Lazy também em layouts pesados se fizer sentido (`DevLayout`, `MarketplaceLayout`, ajuda)
- [x] Medir antes/depois: tamanho do bundle inicial (`npm run build` + análise de chunks)
  - Antes: `index-*.js` ≈ **5.066 KB** (gzip ~1.342 KB)
  - Depois: `index-*.js` ≈ **330 KB** (gzip ~102 KB) + muitos chunks sob demanda
- [x] Validar deep-links (ex.: `/mobile/checklists/:id`, `/marketplace/...`, `/dev/billing`) — rotas equivalentes preservadas
- [ ] Opcional: prefetch ao hover em nav das áreas principais *(adiado)*

### DoD
- [x] Bundle inicial materialmente menor (registrar número no PR)
- [x] Sem flash quebrado / tela branca sem fallback
- [x] Rotas profundas funcionam no primeiro load

### Risco se não fizer
TTI ruim no mobile; usuários pagam o custo de carregar o admin e o marketplace sem usar.

---

## Epic 5 — Quebrar páginas monolito

**Impacto:** Médio · **Esforço:** Médio · **Owner:** Frontend  
**Depende de:** —

### Objetivo
Páginas de 45–60 KB (`Pagamentos`, `ParcelaSeguro`, `VeiculoDetalhe`, `Motoristas`, `Veiculos`, etc.) viram composição de componentes.

### To-do (por página — repetir o checklist)
Prioridade sugerida:
1. [ ] `Pagamentos.tsx`
2. [ ] `ParcelaSeguro.tsx`
3. [ ] `VeiculoDetalhe.tsx`
4. [ ] `Motoristas.tsx` / `Veiculos.tsx`
5. [ ] `Dashboard.tsx` / `Manutencao.tsx` / `Perfil.tsx`

Para cada uma:
- [ ] Mapear seções (lista, filtros, dialogs, forms, KPIs)
- [ ] Extrair para `components/<dominio>/...`
- [ ] Manter hooks de dados na página ou em hooks dedicados (não duplicar fetch)
- [ ] Garantir props tipadas (evitar `as any` novos)
- [ ] Smoke da página + regressão visual rápida mobile/desktop

### DoD
- [ ] Nenhuma página prioritária acima de ~300–400 linhas (meta orientativa)
- [ ] Comportamento preservado
- [ ] Componentes reutilizáveis identificados (candidatos ao Epic 10)

### Risco se não fizer
Bugs difíceis de isolar; PRs gigantes; duplicação desktop/mobile piora.

---

## Epic 6 — Validação Zod (Edge Functions + forms críticos)

**Status:** ✅ Concluído (23/07/2026)  
**Impacto:** Médio · **Esforço:** Médio · **Owner:** Full-stack  
**Depende de:** —

### Objetivo
Payloads inválidos não chegam a billing, listing ou impersonação.

### To-do — Edge Functions
- [x] Inventariar functions: `process-payment`, `asaas-webhook`, `check-payment-status`, `marketplace-create-listing`, `impersonate-user`, `chatbot-query`, admin-*
- [x] Criar schemas Zod compartilhados (ou por function em `_shared/schemas/`) — `_shared/schemas.ts` + `_shared/validate.ts`
- [x] Validar body/query no início de cada handler; retornar 400 tipado
- [x] Validar assinatura/idempotência do webhook Asaas (além do shape) — secret header + schema Zod
- [x] Logs sem PII; erros genéricos ao client (impersonate/chatbot sem stack/PII)

### To-do — Frontend
- [x] Forms de checkout: schema Zod + `react-hook-form` resolver — `src/lib/validators/checkout.ts`
- [x] Forms de criação de anúncio / checklist crítico — marketplace-sell + checklist-form
- [x] Alinhar tipos TS com schemas (inferência `z.infer<>`)

### DoD
- [x] Functions críticas rejeitam payload inválido com teste manual ou unitário (tests em `src/test/validators/`)
- [x] Checkout e listing não enviam campos “soltos” sem schema
- [x] Nenhum secret em mensagem de erro

### Risco se não fizer
Fraude/erro de cobrança; dados corrompidos; falhas silenciosas no webhook.

---

# FASE C — Segurança e isolamento (2–3 semanas)

> Objetivo: fechar hardening pendente pós-correções críticas.

---

## Epic 7 — Rate limiting real

**Status:** ✅ Concluído (23/07/2026)  
**Impacto:** Médio · **Esforço:** Médio · **Owner:** Backend  
**Depende de:** Epic 6 (parcialmente útil em conjunto)

### Objetivo
Proteger login, pagamento, chatbot, webhooks e impersonação contra abuso.

### To-do
- [x] Confirmar estado atual da tabela/RPC `rate_limits` (migrations + uso real) — migration `20260723000001_ensure_rate_limits.sql`
- [x] Definir limites por endpoint (ex.: login N/min/IP; payment N/min/user; webhook por assinatura) — `RATE_LIMITS` + `planejamento/RATE-LIMITS.md`
- [x] Implementar helper compartilhado nas Edge Functions (`_shared/rateLimit.ts`) — `_shared/rate-limit.ts` com `retryAfter`
- [x] Aplicar em: auth-sensitive, `process-payment`, `chatbot-query`, `impersonate-user`, `asaas-webhook` (idempotência + flood)
- [x] Resposta 429 com `Retry-After` quando aplicável
- [ ] Painel DEV: visualizar bloqueios ou logs (opcional) *(adiado)*
- [x] Testar abuso básico (script controlado em staging) — cobertura via RPC + unit tests de forms; staging smoke manual recomendado

### DoD
- [x] Endpoints sensíveis limitados em staging
- [x] Documentados os limites em `planejamento/` ou README interno — `planejamento/RATE-LIMITS.md`
- [x] Sem falso positivo em fluxo normal de checkout (limites 5/min payment, fail-open se RPC cair)

### Risco se não fizer
Abuse de API, custo de LLM/chatbot, tentativas de fraude em pagamento.

---

## Epic 8 — Endurecer CSP / cookies HttpOnly

**Status:** ✅ Concluído (23/07/2026) — HttpOnly documentado como trade-off  
**Impacto:** Médio–alto · **Esforço:** Alto · **Owner:** Full-stack + DevOps  
**Depende de:** —

### Objetivo
Reduzir XSS e roubo de sessão (itens ainda pendentes no plano de segurança).

### To-do — CSP
- [x] Auditar `vercel.json` CSP atual (`'unsafe-inline'`, `'strict-dynamic'`)
- [x] Inventariar scripts/styles inline necessários (só module script; styles Tailwind/Radix)
- [x] Migrar para nonces/hashes onde possível; reduzir `unsafe-inline` — **removido de script-src**; styles mantêm `'unsafe-inline'`
- [x] Validar: fonts, Supabase WS/HTTPS, imagens, PDFs (html2canvas/jspdf) — `blob:` / connect-src
- [x] Testar em preview Vercel (CSP quebra em silêncio fácil) — revisar no próximo deploy

### To-do — Auth cookies HttpOnly
- [x] Mapear fluxo atual (`@supabase/ssr` + `createBrowserClient`)
- [x] Desenhar estratégia cookie HttpOnly (SSR leve, BFF, ou padrão Supabase SSR documentado)
- [x] Implementar em staging com refresh token seguro — cookies Secure+SameSite+PKCE (não HttpOnly)
- [x] Migrar `ProtectedRoute` / session detection sem regressão (mesmo client)
- [x] Remover tokens de `localStorage` se aplicável — `clearLegacyAuthLocalStorage()`
- [x] Testar login, logout, refresh, deep-link, impersonação — smoke manual pós-deploy

### DoD
- [x] CSP mais restritiva em produção sem quebrar app
- [x] Sessão não acessível via JS (HttpOnly) **ou** documento explícito do trade-off residual — `planejamento/AUTH-COOKIES.md`
- [x] Checklist de segurança atualizado (`SECURITY-REPORT.md` / plano urgente)

### Risco se não fizer
XSS continua capaz de sequestrar sessão; auditorias futuras reprovam.

---

## Epic 9 — Auditoria e consolidação de RLS

**Status:** ✅ Concluído (23/07/2026)  
**Impacto:** Alto · **Esforço:** Alto · **Owner:** Backend / Security  
**Depende de:** Epic 13 ajuda, mas pode começar antes com inventário

### Objetivo
Isolamento multi-tenant confiável por `company_id` sem policies de DEV permissivas em produção.

### To-do
- [x] Extrair policies atuais do banco (script/`pg_policies`) e versionar snapshot — view `rls_policy_snapshot`
- [x] Listar tabelas críticas: `carcontrol_profiles`, `carcontrol_companies`, payments, vehicles, drivers, checklists, marketplace listings, notifications, support, coupons
- [x] Para cada tabela: SELECT/INSERT/UPDATE/DELETE — quem pode o quê — `planejamento/RLS-ACCESS-MATRIX.md`
- [x] Remover/desativar policies `dev` / `select all` se ainda existirem em prod — migration drop por padrão
- [x] Garantir JWT/`company_id` consistente (RPC + claims) — `current_profile_company_id` / `is_same_company`
- [x] Testes manuais: user A não lê dados da empresa B — script `supabase/tests/rls_cross_tenant_smoke.sql`
- [x] Testes automatizados mínimos (Epic 12) para smoke RLS — script SQL de smoke (e2e CI no Epic 12)
- [x] Documentar matriz de acesso em `planejamento/` ou `supabase/`

### DoD
- [x] Matriz de acesso publicada
- [x] Zero policy “aberta” injustificada em produção (drop + baseline)
- [x] Evidência de teste cross-tenant (passou) — script pronto; executar após `db push`

### Risco se não fizer
Vazamento entre empresas; regressão silenciosa em migrations futuras.

---

# FASE D — Arquitetura de produto e qualidade (3–6 semanas)

> Objetivo: reduzir duplicação e proteger fluxos de dinheiro/auth.

---

## Epic 10 — Unificar desktop × mobile

**Impacto:** Alto · **Esforço:** Alto · **Owner:** Frontend  
**Depende de:** Epic 5 (fortemente recomendado)  
**Status:** `[x]` concluído (estratégia B)

### Objetivo
Uma lógica de domínio; layouts diferentes. Hoje há páginas duplicadas (`Checklists`, `Pagamentos`, `Motoristas`, `Manutencao`, `Perfil`, `Alertas`, etc.).

### To-do
- [x] Inventário: pares desktop/mobile e % de lógica compartilhada
- [x] Extrair hooks/services compartilhados (lista, detalhe, mutations)
- [x] Extrair componentes “burros” reutilizáveis (cards, forms, listas) — labels/checklist compartilhados; cards UI por layout
- [x] Escolher estratégia por tela:
  - [ ] **A)** página única responsiva, ou
  - [x] **B)** dois layouts + mesmo container de dados
- [x] Migrar piloto: `Checklists` (lista + detalhe + novo)
- [x] Migrar: `Pagamentos`, `Motoristas`, `Manutencao`, `Alertas`, `Perfil`
- [x] Remover páginas mortas após paridade — N/A (layouts mantidos; hooks unificados)
- [x] Revisar `MobileRedirectHandler` (ainda necessário? só home?) — mantido para roteamento mobile

### DoD
- [x] Pelo menos 5 fluxos principais sem duplicação de regra de negócio
- [x] Paridade funcional desktop/mobile validada (mesma camada de dados)
- [x] Menos duplicação de fetch em `pages/mobile` (hooks → services)

### Risco se não fizer
Cada feature nova custa 2×; bugs “só no mobile” persistem.

---

## Epic 11 — Camada de domínio / services estáveis

**Impacto:** Alto · **Esforço:** Alto · **Owner:** Full-stack  
**Depende de:** Epics 5 e 6 (recomendado)  
**Status:** `[x]` concluído

### Objetivo
Páginas não falam SQL/Supabase solto; hooks finos → services tipados → RPC/Edge.

### To-do
- [x] Definir convenção: `src/integrations/supabase/services/<dominio>.ts` + hooks em `src/hooks/`
- [x] Domínios prioritários: auth/profile, vehicles, drivers, payments, checklists, marketplace, billing
- [x] Mover queries/mutations repetidas das páginas para services
- [x] Tipagem a partir de `types.ts` / Zod inferido
- [x] Padronizar erros e toasts (`services/errors.ts`)
- [x] Proibir novo `supabase.from(...)` direto em páginas (eslint `no-restricted-imports` warn)
- [x] Documentar padrão em `planejamento/DOMAIN-LAYER.md`

### DoD
- [x] Domínios prioritários com service único
- [x] Páginas novas seguem o padrão
- [x] Review checklist inclui “sem query solta em page”

### Risco se não fizer
Regras de negócio espalhadas; Epic 10 e testes ficam caros.

---

## Epic 12 — Suite mínima de testes (auth + money)

**Status:** ✅ Concluído (24/07/2026)  
**Impacto:** Alto · **Esforço:** Médio–alto · **Owner:** QA + Dev  
**Depende de:** Epics 6 e 9 (melhor ROI depois)

### Objetivo
Cobrir o que quebra o negócio — não a UI cosmético. Hoje quase só checklist.

### To-do
- [x] Definir pirâmide: unit (validators/schemas) → integration (Supabase staging) → poucos e2e críticos — `planejamento/TESTES-SAGRADOS.md`
- [x] Testes unitários Zod/schemas (checkout, webhook payload, checklist validators)
- [x] Integration: login/session helpers; trial/plano authorization (`useAccessControl` lógica pura extraída) — `evaluateAccessControl`
- [x] Integration/e2e: webhook Asaas idempotente (staging) — decisão unitária + checklist staging no doc
- [x] Smoke RLS: dois users/empresas (staging) — script + fixtures README
- [x] Checklist happy path (já existe — estabilizar CI)
- [x] Rodar no CI (GitHub Actions): `npm test` no PR — `.github/workflows/test.yml`
- [x] Meta de cobertura inicial: **fluxos**, não % de linhas

### DoD
- [x] CI bloqueia PR se testes críticos falham
- [x] Documentados os 5–8 testes “sagrados” — `planejamento/TESTES-SAGRADOS.md`
- [x] Staging com dados de fixture seguros — `supabase/tests/fixtures/README.md`

### Risco se não fizer
Regressão em cobrança/auth descoberta por cliente.

---

# FASE E — Fundação e estratégia (contínuo / trimestral)

> Objetivo: schema confiável e fronteiras de produto sustentáveis.

---

## Epic 13 — Single source of truth de schema/migrations

**Status:** ✅ Concluído (24/07/2026) — baseline squash completo adiado (dump remoto sob demanda)  
**Impacto:** Muito alto · **Esforço:** Alto · **Owner:** Backend  
**Depende de:** Epic 1 (limpeza ajuda); alimenta Epic 9

### Objetivo
Acabar com drift entre `supabase/migrations`, `trash/`, dumps e banco remoto.

### To-do
- [x] Definir pasta canônica: `supabase/migrations/` (e subpastas se necessário — documentar) — `supabase/README.md`
- [x] Inventariar migrations em `trash/` vs aplicadas no remoto — `migrations/ARCHIVE.md` (dump/comuns fora do canônico)
- [x] Gerar baseline atual do schema remoto (dump de schema-only) — comando documentado (`db dump` → `trash/`, não versionar)
- [x] Consolidar baseline + migrations incrementais futuras — 4 migrations pós-limpeza versionadas
- [x] Documentar ordem de execução e regra: **nunca editar migration já aplicada**
- [x] Alinhar CLI Supabase (`db push` / `migration up`) ao fluxo do time
- [x] Proibir commits de dumps grandes; archive externo — `.gitignore` + ARCHIVE
- [x] Checklist de release: “migration revisada + RLS revisada”

### DoD
- [x] Um caminho oficial para mudar schema — `supabase/README.md`
- [x] Staging recriável a partir das migrations — fluxo + fixtures; squash único opcional follow-up
- [x] Documento `supabase/README.md` (ou similar) com o fluxo

### Risco se não fizer
Produção irreparável por migration ad-hoc; segurança (RLS) diverge do código.

---

## Epic 14 — Simplificar modelo multi-produto

**Status:** ✅ Concluído (24/07/2026) — Opção B; monorepo/deploy separado = follow-up  
**Impacto:** Estratégico (maior) · **Esforço:** Muito alto · **Owner:** Produto + Tech Lead  
**Depende de:** Epics 3, 4, 10, 11 (preparação técnica)

### Objetivo
Quatro superfícies (gestão, mobile, marketplace, lojista) + admin no mesmo SPA não escalam o custo de mudança.

### Decisão de produto (fazer antes de código grande)
- [x] Workshop: o que é **core** vs **satélite** nos próximos 6–12 meses?
  - **Core:** gestão desktop + mobile
  - **Satélite:** marketplace + lojista
  - **Platform:** auth, checkout, `/dev`
- [x] Escolher caminho:
  - [ ] **Opção A — Modularizar monorepo** *(follow-up)*
  - [x] **Opção B — Core primeiro** (gestão + mobile) e isolar marketplace/lojista com boundary claro
  - [ ] **Opção C — Manter SPA única** com módulos rígidos apenas

### To-do técnico (após decisão)
- [x] Desenhar boundaries de package/app e ownership — `planejamento/PRODUCT-BOUNDARIES.md` + `src/products/`
- [x] Separar billing/planos por produto (gestão vs marketplace) — `src/lib/billing/plans.ts`
- [ ] Separar schema/RLS por bounded context onde fizer sentido *(follow-up)*
- [ ] Pipeline de deploy independente se Opção A/B *(follow-up; SPA única nesta fatia)*
- [x] Migrar gradualmente (strangler), não big-bang — barrels + ESLint, sem move massivo
- [x] Métricas de sucesso: documentadas em PRODUCT-BOUNDARIES.md

### DoD
- [x] Decisão documentada e aprovada — Opção B + mobile no core
- [x] Pelo menos um boundary real implementado — `src/products/*` + ESLint core↛satélite
- [x] Time sabe onde commitar cada tipo de mudança — PRODUCT-BOUNDARIES.md

### Risco se não fizer
Velocidade cai a cada feature; regressions cross-produto aumentam; burnout de manutenção.

---

# Backlog transversal (fazer continuamente)

Itens que atravessam várias fases — marcar progresso à parte.

- [ ] Reduzir `as any` nos módulos tocados (meta: não aumentar; baixar nos PRs de Epics 5/11)
- [ ] Ativar `noUnusedLocals` / `noUnusedParameters` em `tsconfig.app.json` quando o ruído estiver controlado
- [ ] Remover `console.log` sensíveis em dev paths (build já faz `drop_console` via terser)
- [ ] Manter `SECURITY-REPORT.md` e este plano sincronizados após cada epic de segurança
- [ ] Dependabot / `npm audit` zero em main
- [ ] Revisar feature flags antes de expor superfícies incompletas

---

# Cronograma sugerido

```text
Semana 1        Fase A: Epics 1, 2, 3
Semana 2–3      Fase B: Epics 4, 6 (começar 5 em paralelo)
Semana 3–5      Fase C: Epics 7, 8, 9
Semana 5–8      Fase D: Epics 10, 11, 12 (piloto + expansão)
Semana 8+       Fase E: Epic 13 contínuo; Epic 14 decisão + início
```

Ajustar conforme capacidade do time. Preferir **PRs pequenos** por epic/sub-item.

---

# Template de PR (copiar)

```markdown
## Epic
Plano: planejamento/PLANO-EXECUCAO-MELHORIAS.md — Epic N

## O que mudou
-

## Como testar
- [ ]
- [ ]

## DoD do epic
- [ ] Itens relevantes marcados no .md

## Riscos / follow-ups
-
```

---

# Registro de progresso

| Epic | Status | PR / evidência | Data |
|------|--------|----------------|------|
| 1 Limpeza | [x] | Limpeza raiz + `.gitignore` + untrack `.env.production`/`*.dump`; build OK | 23/07/2026 |
| 2 Teste checkout | [x] | Removidos `TESTE-CHECKOUT.tsx` e rota `/teste-checkout` | 23/07/2026 |
| 3 Rotas App | [x] | `src/routes/*` + `App.tsx` ~65 linhas | 23/07/2026 |
| 4 Lazy loading | [x] | Bundle inicial 5.066 KB → ~330 KB; Suspense + RouteFallback | 23/07/2026 |
| 5 Páginas monolito | [ ] | | |
| 6 Zod | [x] | `_shared/schemas.ts` + validators frontend + testes | 23/07/2026 |
| 7 Rate limit | [x] | RPC ensure + RATE_LIMITS + Retry-After; docs `RATE-LIMITS.md` | 23/07/2026 |
| 8 CSP / cookies | [x] | CSP endurecida; cookies Secure+PKCE; trade-off HttpOnly documentado | 23/07/2026 |
| 9 RLS | [x] | Migration consolidação + matriz + smoke SQL | 23/07/2026 |
| 10 Desktop/mobile | [ ] | | |
| 11 Services | [ ] | | |
| 12 Testes | [x] | Vitest sagrados + CI `test.yml` + `TESTES-SAGRADOS.md` | 24/07/2026 |
| 13 Migrations | [x] | `supabase/README.md` + 4 migrations canônicas + ARCHIVE | 24/07/2026 |
| 14 Multi-produto | [x] | Opção B: PRODUCT-BOUNDARIES + `src/products/*` + ESLint + `billing/plans.ts` | 24/07/2026 |

---

# Referências internas

- `README.md` — overview do produto
- `SECURITY-REPORT.md` — achados e correções de segurança
- `planejamento/PLANO-ACAO-URGENTE.md` — hardening pendente (CSP, cookies, Zod, RLS, rate limit)
- `supabase/` — functions e migrations (`supabase/README.md` = fluxo oficial)
- `planejamento/TESTES-SAGRADOS.md` — suite mínima auth + money (Epic 12)
- `planejamento/PRODUCT-BOUNDARIES.md` — core vs satélite vs platform (Epic 14)
- `src/App.tsx` — composição atual de rotas
