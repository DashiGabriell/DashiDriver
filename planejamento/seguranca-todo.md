# Plano de Correções de Segurança — TODO

## Migrations

### M1 — Rate Limiting (Item 5)
- [ ] Criar tabela `public.rate_limits` (key TEXT, window_start TIMESTAMPTZ, count INTEGER)
  - UNIQUE (key, window_start)
- [ ] Criar função `public.check_rate_limit(p_key TEXT, p_max_requests INT, p_window_seconds INT DEFAULT 60)`
  - INSERT ... ON CONFLICT incrementa count
  - Retorna `{ allowed BOOLEAN, remaining INT }`

### M2 — RLS marketplace_search_logs (Item 7)
- [ ] `ALTER TABLE marketplace_search_logs ADD COLUMN user_id UUID REFERENCES auth.users(id)`
- [ ] Alterar policy `authenticated_select`: `USING (true)` → `USING (user_id = auth.uid())`
- [ ] Alterar policy `authenticated_insert`: `WITH CHECK (true)` → `WITH CHECK (user_id = auth.uid())`
- [ ] (Opcional) Trigger `BEFORE INSERT` para setar `user_id = auth.uid()` automaticamente

### M3 — Auto-elevação de role (Item 8)
- [ ] Alterar policy `profiles_insert_own`:
  - Antes: `WITH CHECK (id = auth.uid())`
  - Depois: `WITH CHECK (id = auth.uid() AND role = 'user')`

---

## Código — Edge Functions

### C1 — Helper compartilhado de rate limiting
- [ ] Criar `supabase/functions/_shared/rate-limit.ts`
  - Função `checkRateLimit(supabase, key, maxRequests, windowSeconds)`
  - Chama RPC `check_rate_limit`
  - Retorna Response 429 se excedido

### C2 — Aplicar rate limiting nas 9 Edge Functions
- [ ] `trigger-security-scan` — chave `scan:<user_id>`, max 10, 60s
- [ ] `process-payment` — chave `payment:<user_id>`, max 5, 60s
- [ ] `marketplace-create-listing` — chave `listing:<user_id>`, max 3, 60s
- [ ] `check-plan-expiry` — chave `plan:<ip>`, max 30, 60s
- [ ] `check-payment-status` — chave `pstatus:<user_id>`, max 10, 60s
- [ ] `asaas-webhook` — chave `asaas:<ip>`, max 60, 60s
- [ ] `admin-events` — chave `admin:<user_id>`, max 20, 60s
- [ ] `admin-coupon-usage` — chave `coupon:<user_id>`, max 20, 60s
- [ ] `admin-billing-overview` — chave `billing:<user_id>`, max 20, 60s

### C6 — Shared secret em check-plan-expiry (Item 9)
- [ ] Validar cabeçalho `x-cron-secret` contra `Deno.env.get("CRON_SECRET")`
- [ ] Retornar 401 se não autorizado
- [ ] Configurar env var `CRON_SECRET` no Supabase Dashboard

---

## Código — Frontend (Zod Validation — Item 6)

### C3 — Schemas Zod compartilhados
- [ ] Criar `src/lib/validators/login.ts` — email, password, name
- [ ] Criar `src/lib/validators/veiculo.ts` — marca, modelo, placa (regex Mercosul), vencimentos
- [ ] Criar `src/lib/validators/motorista.ts` — nome, cpf (11 dígitos), cnh, telefone, inicio
- [ ] Criar `src/lib/validators/manutencao.ts` — vehicle_id (uuid), servico, oficina, data
- [ ] Criar `src/lib/validators/marketplace-sell.ts` — title, marca, modelo, price > 0, categoryId, cidade, estado
- [ ] Criar `src/lib/validators/mobile-manutencao.ts` — vehicle_id, servico, data

### C4 — Refatorar formulários com react-hook-form + zodResolver
- [ ] `src/pages/Login.tsx`
- [ ] `src/pages/Veiculos.tsx`
- [ ] `src/pages/Motoristas.tsx`
- [ ] `src/pages/Manutencao.tsx`
- [ ] `src/pages/marketplace/MarketplaceSell.tsx`
- [ ] `src/pages/mobile/MobileManutencaoNew.tsx`

### C5 — Adicionar user_id nos search logs (frontend)
- [ ] Atualizar chamadas de INSERT em `marketplace_search_logs` para incluir `user_id` do usuário logado
