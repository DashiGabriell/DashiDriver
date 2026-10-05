# Plano: Sistema de Destaques / Boost — Marketplace

## Premissa

**Destaque é um recurso pago avulso.** Não está incluso em nenhum plano. O lojista compra um boost de N dias para um anúncio específico.

---

## O que já existe (aproveitável)

| Componente | Status |
|---|---|
| Coluna `is_featured` em `marketplace_listings` (`BOOLEAN DEFAULT false`) | ✅ Existe |
| Seção "Destaques para Locação" na Home | ✅ Exibe itens com `isFeatured === true` |
| Badge "Destaque" (ícone Zap) no `ProductCard` | ✅ Já renderiza |
| Ordenação padrão (`is_featured DESC, created_at DESC`) | ✅ Implementada |
| Index `idx_marketplace_listings_active` incluindo `is_featured` | ✅ Existe |
| Sistema de pagamentos Asaas | ✅ Integração existente |

## O que precisa ser criado

| Peça | Detalhe |
|---|---|
| Coluna `featured_until` para expiração automática | `TIMESTAMPTZ` |
| Tabela `marketplace_boost_purchases` para histórico | Com status, valor, vigência |
| Serviço `purchaseBoost(listingId, days)` | Validação + criação da compra |
| UI de compra no `MarketplaceMyAds` | Modal com opções de dias + redirecionamento ao checkout |
| Expiração automática via filtro na query | `WHERE (featured_until IS NULL OR featured_until > now())` |
| Integração Asaas para boost | Cobrança avulsa avulsa (one-time payment) |

---

## Estrutura de dados

### Migration 1 — Coluna de expiração

```sql
ALTER TABLE marketplace_listings
  ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;
```

### Migration 2 — Histórico de compras

```sql
CREATE TABLE IF NOT EXISTS marketplace_boost_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES carcontrol_companies(id) ON DELETE CASCADE,
  days INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  asaas_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_boost_purchases_active
  ON marketplace_boost_purchases(expires_at)
  WHERE status = 'paid';
```

---

## Regras de negócio

```
is_featured = true  ← SOMENTE quando há um boost_purchase com status = 'paid' e expires_at > now()

is_featured = false ← featured_until < now() (expirado)
                    ← nenhuma compra ativa para este anúncio
```

- Um anúncio só pode estar em destaque se houver uma compra de boost com pagamento confirmado e dentro da validade.
- Não há limite de boosts simultâneos (o lojista pode impulsionar quantos anúncios quiser).
- O destaque expira automaticamente quando `featured_until` passa.

---

## Fluxo de compra

```
MarketplaceMyAds → botão "Impulsionar Anúncio" → modal com opções de dias (ex.: 7, 14, 30)
  → exibe valor (ex.: R$ 19,90 / 7 dias)
  → lojista confirma → cria checkout Asaas (one-time)
  → redireciona para pagamento
  → webhook Asaas confirma pagamento →
    1. INSERT marketplace_boost_purchases (status = 'paid')
    2. UPDATE marketplace_listings SET is_featured = true, featured_until = now() + N dias
```

## Expiração automática

Filtro na query principal (não depende de cron):

```sql
AND (featured_until IS NULL OR featured_until > now())
```

Complementar com trigger opcional:

```sql
CREATE OR REPLACE FUNCTION expire_featured_listings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.featured_until IS NOT NULL AND NEW.featured_until <= now() THEN
    NEW.is_featured := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_expire_featured
  BEFORE UPDATE ON marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION expire_featured_listings();
```

---

## Arquivos envolvidos

| Arquivo | O que fazer |
|---|---|
| `supabase/migrations/...add_featured_until.sql` | Coluna `featured_until` |
| `supabase/migrations/...create_boost_purchases.sql` | Tabela + índices + trigger |
| `src/integrations/supabase/services/marketplaceService.ts` | Adicionar `purchaseBoost`, `getActiveBoosts` |
| `src/pages/marketplace/MarketplaceMyAds.tsx` | Botão "Impulsionar" + modal de opções |
| `src/pages/marketplace/MarketplaceHome.tsx` | Limitar seção "Destaques" a 10 itens |
| `src/integrations/supabase/types.ts` | Tipar `featured_until` e `marketplace_boost_purchases` |
| `supabase/functions/asaas-webhook/index.ts` | Tratar pagamento de boost (além de assinatura) |
