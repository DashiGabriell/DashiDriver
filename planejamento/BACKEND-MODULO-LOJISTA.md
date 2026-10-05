# Backend Ideal para o Módulo Lojista

## Contexto Atual

O módulo lojista tem **8 páginas**, mas apenas a página de **Perfil** está conectada ao Supabase. As outras 7 usam dados hardcoded/fake. O backend atual já tem 7 tabelas para o marketplace, mas falta algo importante: o conceito de **"Oportunidades"** (demandas de locadoras).

---

## O que será criado no Backend

### 1. Tabela `marketplace_demands` (Oportunidades)

Locadoras publicam demandas do que precisam comprar. O lojista vê e responde "Tenho Interesse".

```sql
CREATE TABLE public.marketplace_demands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.carcontrol_companies(id) ON DELETE CASCADE,
  buyer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  modelo TEXT NOT NULL,
  marca TEXT,
  quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  orcamento_min NUMERIC(12,2),
  orcamento_max NUMERIC(12,2) NOT NULL,
  cidade TEXT,
  estado TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','fulfilled','cancelled','expired')),
  validade TIMESTAMPTZ,
  views_count INTEGER NOT NULL DEFAULT 0,
  responses_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Identificador único |
| `company_id` | UUID FK | Empresa que publicou a demanda |
| `buyer_user_id` | UUID FK | Usuário que publicou |
| `title` | TEXT | Título da demanda |
| `modelo` | TEXT | Modelo do veículo procurado (ex: "Fiat Pulse") |
| `marca` | TEXT | Marca (opcional) |
| `quantidade` | INTEGER | Quantos veículos quer |
| `orcamento_min/max` | NUMERIC | Faixa de orçamento |
| `cidade/estado` | TEXT | Localização |
| `status` | TEXT | active/fulfilled/cancelled/expired |
| `validade` | TIMESTAMPTZ | Data de expiração |

---

### 2. Tabela `marketplace_demand_responses` (Respostas dos Lojistas)

Quando o lojista clica "Tenho Interesse", cria-se um registro aqui.

```sql
CREATE TABLE public.marketplace_demand_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_id UUID NOT NULL REFERENCES public.marketplace_demands(id) ON DELETE CASCADE,
  responder_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  responder_company_id UUID NOT NULL REFERENCES public.carcontrol_companies(id) ON DELETE CASCADE,
  message TEXT,
  proposed_price NUMERIC(12,2),
  proposed_quantity INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Coluna | Tipo | Descrição |
|---|---|---|
| `demand_id` | UUID FK | Qual demanda está respondendo |
| `responder_user_id` | UUID FK | O lojista |
| `responder_company_id` | UUID FK | Empresa do lojista |
| `message` | TEXT | Mensagem opcional |
| `proposed_price` | NUMERIC | Preço proposto |
| `status` | TEXT | pending/accepted/rejected/cancelled |

---

### 3. Tabela `lojista_analytics_events` (Métricas)

Eventos de tracking para alimentar os gráficos do Analytics.

```sql
CREATE TABLE public.lojista_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.carcontrol_companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'listing_viewed', 'proposal_sent', 'proposal_received',
    'proposal_accepted', 'proposal_rejected', 'whatsapp_click',
    'demand_viewed', 'demand_responded', 'sale_confirmed'
  )),
  listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
  demand_id UUID REFERENCES public.marketplace_demands(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Tipos de evento: `listing_viewed`, `proposal_sent`, `proposal_received`, `proposal_accepted`, `whatsapp_click`, `demand_viewed`, `demand_responded`, `sale_confirmed`

Cada evento registra: empresa, usuário, tipo, listing_id (opcional), demand_id (opcional), timestamp.

---

### 4. Tabela `lojista_settings` (Configurações)

Preferências do lojista (notificações, privacidade, auto-reply).

```sql
CREATE TABLE public.lojista_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  company_id UUID NOT NULL REFERENCES public.carcontrol_companies(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  whatsapp_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  profile_public BOOLEAN NOT NULL DEFAULT true,
  show_whatsapp BOOLEAN NOT NULL DEFAULT true,
  show_phone BOOLEAN NOT NULL DEFAULT false,
  auto_reply_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_reply_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 5. Funções SQL para KPIs e Analytics

#### `get_lojista_kpis(company_id)` — KPIs do Hub

```sql
CREATE OR REPLACE FUNCTION public.get_lojista_kpis(p_company_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result JSONB;
  v_demandas INT;
  v_interacoes INT;
  v_leads INT;
  v_vendas INT;
  v_whatsapp_clicks INT;
BEGIN
  SELECT COUNT(*) INTO v_demandas
  FROM marketplace_demands WHERE status = 'active' AND company_id != p_company_id;

  SELECT COUNT(*) INTO v_interacoes
  FROM marketplace_proposals WHERE seller_user_id = auth.uid()
  UNION ALL
  SELECT COUNT(*) FROM marketplace_demand_responses WHERE responder_user_id = auth.uid();

  SELECT COUNT(*) INTO v_leads
  FROM marketplace_proposals
  WHERE seller_user_id = auth.uid() AND status IN ('reviewing','accepted','rejected');

  SELECT COUNT(*) INTO v_vendas
  FROM marketplace_proposals WHERE seller_user_id = auth.uid() AND status = 'accepted';

  SELECT COUNT(*) INTO v_whatsapp_clicks
  FROM marketplace_whatsapp_clicks WHERE company_id = p_company_id;

  result := jsonb_build_object(
    'oportunidades', COALESCE(v_demandas, 0),
    'interacoes', COALESCE(v_interacoes, 0),
    'leads', COALESCE(v_leads, 0),
    'vendas', COALESCE(v_vendas, 0),
    'whatsapp_clicks', COALESCE(v_whatsapp_clicks, 0),
    'taxa_conversao', CASE WHEN v_interacoes > 0 THEN ROUND(v_vendas::numeric / v_interacoes * 100, 1) ELSE 0 END
  );
  RETURN result;
END;
$$;
```

Retorna JSON com: oportunidades, interações, leads, vendas, cliques WhatsApp, taxa de conversão.

#### `get_lojista_analytics(company_id, days)` — Métricas de Analytics

```sql
CREATE OR REPLACE FUNCTION public.get_lojista_analytics(p_company_id UUID, p_days INTEGER DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result JSONB;
  v_views INT;
  v_proposals INT;
  v_conversions INT;
  v_sales INT;
BEGIN
  SELECT COUNT(*) INTO v_views
  FROM lojista_analytics_events
  WHERE company_id = p_company_id AND event_type = 'listing_viewed'
    AND created_at >= now() - (p_days || ' days')::INTERVAL;

  SELECT COUNT(*) INTO v_proposals
  FROM lojista_analytics_events
  WHERE company_id = p_company_id AND event_type IN ('proposal_sent','proposal_received')
    AND created_at >= now() - (p_days || ' days')::INTERVAL;

  SELECT COUNT(*) INTO v_conversions
  FROM lojista_analytics_events
  WHERE company_id = p_company_id AND event_type = 'proposal_accepted'
    AND created_at >= now() - (p_days || ' days')::INTERVAL;

  SELECT COUNT(*) INTO v_sales
  FROM lojista_analytics_events
  WHERE company_id = p_company_id AND event_type = 'sale_confirmed'
    AND created_at >= now() - (p_days || ' days')::INTERVAL;

  result := jsonb_build_object(
    'visualizacoes', COALESCE(v_views, 0),
    'interacoes', COALESCE(v_proposals, 0),
    'conversoes', COALESCE(v_conversions, 0),
    'vendas', COALESCE(v_sales, 0),
    'taxa_conversao', CASE WHEN v_views > 0 THEN ROUND(v_conversions::numeric / v_views * 100, 1) ELSE 0 END
  );
  RETURN result;
END;
$$;
```

Retorna: visualizações, interações, conversões, vendas, taxa de conversão.

#### `get_lojista_monthly_interactions(company_id, months)` — Gráfico de Linha

```sql
CREATE OR REPLACE FUNCTION public.get_lojista_monthly_interactions(p_company_id UUID, p_months INTEGER DEFAULT 6)
RETURNS TABLE(mes TEXT, interacoes BIGINT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(d.month, 'Mon') AS mes,
    COALESCE(cnt.cnt, 0) AS interacoes
  FROM generate_series(
    date_trunc('month', now()) - ((p_months - 1) || ' months')::INTERVAL,
    date_trunc('month', now()),
    '1 month'
  ) AS d(month)
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS cnt
    FROM lojista_analytics_events e
    WHERE e.company_id = p_company_id
      AND e.created_at >= d.month
      AND e.created_at < d.month + INTERVAL '1 month'
      AND e.event_type IN ('proposal_sent','proposal_received','whatsapp_click','demand_responded')
  ) cnt ON true
  ORDER BY d.month;
END;
$$;
```

Retorna séries temporais para o gráfico de linha "Interações por mês".

#### `get_lojista_demand_by_state(company_id)` — Gráfico de Barras

```sql
CREATE OR REPLACE FUNCTION public.get_lojista_demand_by_state(p_company_id UUID)
RETURNS TABLE(estado TEXT, demanda BIGINT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT d.estado, COUNT(*) AS demanda
  FROM marketplace_demands d
  WHERE d.status = 'active' AND d.company_id != p_company_id
  GROUP BY d.estado
  ORDER BY demanda DESC
  LIMIT 10;
END;
$$;
```

Retorna top 10 estados com mais demandas ativas.

#### `get_lojista_popular_models(company_id)` — Gráfico de Pizza

```sql
CREATE OR REPLACE FUNCTION public.get_lojista_popular_models(p_company_id UUID)
RETURNS TABLE(name TEXT, value BIGINT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT d.modelo AS name, COUNT(*) AS value
  FROM marketplace_demands d
  WHERE d.status = 'active' AND d.company_id != p_company_id
  GROUP BY d.modelo
  ORDER BY value DESC
  LIMIT 10;
END;
$$;
```

Retorna top 10 modelos mais procurados.

#### `get_lojista_recent_conversions(company_id)` — Tabela de Conversões

```sql
CREATE OR REPLACE FUNCTION public.get_lojista_recent_conversions(p_company_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(data TEXT, veiculo TEXT, valor NUMERIC)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(p.updated_at, 'DD/MM/YYYY') AS data,
    l.title AS veiculo,
    l.price AS valor
  FROM marketplace_proposals p
  JOIN marketplace_listings l ON l.id = p.listing_id
  WHERE p.seller_user_id = auth.uid() AND p.status = 'accepted'
  ORDER BY p.updated_at DESC
  LIMIT p_limit;
END;
$$;
```

Retorna últimas vendas confirmadas para exibir na tabela.

---

### 6. RLS Policies para as Novas Tabelas

```sql
-- marketplace_demands
ALTER TABLE public.marketplace_demands ENABLE ROW LEVEL SECURITY;

CREATE POLICY marketplace_demands_read_active ON public.marketplace_demands
  FOR SELECT TO authenticated USING (status = 'active' OR buyer_user_id = auth.uid());

CREATE POLICY marketplace_demands_manage_own ON public.marketplace_demands
  FOR ALL TO authenticated
  USING (buyer_user_id = auth.uid())
  WITH CHECK (buyer_user_id = auth.uid());

-- marketplace_demand_responses
ALTER TABLE public.marketplace_demand_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY marketplace_demand_responses_read ON public.marketplace_demand_responses
  FOR SELECT TO authenticated
  USING (responder_user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM marketplace_demands d WHERE d.id = demand_id AND d.buyer_user_id = auth.uid()
  ));

CREATE POLICY marketplace_demand_responses_insert_own ON public.marketplace_demand_responses
  FOR INSERT TO authenticated
  WITH CHECK (responder_user_id = auth.uid());

CREATE POLICY marketplace_demand_responses_update_participant ON public.marketplace_demand_responses
  FOR UPDATE TO authenticated
  USING (responder_user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM marketplace_demands d WHERE d.id = demand_id AND d.buyer_user_id = auth.uid()
  ));

-- lojista_analytics_events
ALTER TABLE public.lojista_analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY lojista_analytics_events_insert_own ON public.lojista_analytics_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY lojista_analytics_events_read_own ON public.lojista_analytics_events
  FOR SELECT TO authenticated
  USING (company_id = public.marketplace_current_company_id());

-- lojista_settings
ALTER TABLE public.lojista_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY lojista_settings_manage_own ON public.lojista_settings
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

---

### 7. Grants

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_demands TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.marketplace_demand_responses TO authenticated;
GRANT INSERT ON public.lojista_analytics_events TO authenticated;
GRANT SELECT ON public.lojista_analytics_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lojista_settings TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lojista_kpis(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lojista_analytics(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lojista_monthly_interactions(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lojista_demand_by_state(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lojista_popular_models(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lojista_recent_conversions(UUID, INTEGER) TO authenticated;
```

---

## O que será criado no Frontend

### 1. Novo Service: `src/integrations/supabase/services/lojistaService.ts`

Funções:

| Função | Chamada SQL | Descrição |
|---|---|---|
| `getLojistaKPIs(companyId)` | `get_lojista_kpis` | KPIs do Hub |
| `getLojistaAnalytics(companyId)` | `get_lojista_analytics` | Métricas de Analytics |
| `getMonthlyInteractions(companyId)` | `get_lojista_monthly_interactions` | Dados gráfico de linha |
| `getDemandByState(companyId)` | `get_lojista_demand_by_state` | Dados gráfico de barras |
| `getPopularModels(companyId)` | `get_lojista_popular_models` | Dados gráfico de pizza |
| `getRecentConversions(companyId)` | `get_lojista_recent_conversions` | Últimas conversões |
| `listDemands(filters)` | SELECT em `marketplace_demands` | Lista demandas ativas |
| `respondToDemand(demandId, data)` | INSERT em `marketplace_demand_responses` | Responder demanda |
| `getLojistaSettings(userId)` | SELECT em `lojista_settings` | Buscar configurações |
| `upsertLojistaSettings(userId, settings)` | UPSERT em `lojista_settings` | Atualizar configurações |
| `trackEvent(eventType, metadata)` | INSERT em `lojista_analytics_events` | Registrar evento |

### 2. Novo Arquivo: `src/types/lojista.ts`

Interfaces:

```typescript
interface LojistaKPIs {
  oportunidades: number;
  interacoes: number;
  leads: number;
  vendas: number;
  whatsapp_clicks: number;
  taxa_conversao: number;
}

interface LojistaAnalytics {
  visualizacoes: number;
  interacoes: number;
  conversoes: number;
  vendas: number;
  taxa_conversao: number;
}

interface MarketplaceDemand {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  modelo: string;
  marca: string | null;
  quantidade: number;
  orcamento_min: number | null;
  orcamento_max: number;
  cidade: string | null;
  estado: string | null;
  status: string;
  validade: string | null;
  views_count: number;
  responses_count: number;
  created_at: string;
}

interface DemandResponse {
  id: string;
  demand_id: string;
  message: string | null;
  proposed_price: number | null;
  proposed_quantity: number | null;
  status: string;
  created_at: string;
}

interface LojistaSettings {
  id: string;
  user_id: string;
  company_id: string;
  email_notifications: boolean;
  whatsapp_notifications: boolean;
  push_notifications: boolean;
  profile_public: boolean;
  show_whatsapp: boolean;
  show_phone: boolean;
  auto_reply_enabled: boolean;
  auto_reply_message: string | null;
}

interface MonthlyInteraction {
  mes: string;
  interacoes: number;
}

interface DemandByState {
  estado: string;
  demanda: number;
}

interface PopularModel {
  name: string;
  value: number;
}

interface RecentConversion {
  data: string;
  veiculo: string;
  valor: number;
}
```

---

## Páginas a Integrar

| Página | O que muda |
|---|---|
| **PortaldoLojista** | KPIs reais via `getLojistaKPIs`, tabela com últimas oportunidades reais, gráfico de interações via `getMonthlyInteractions` |
| **Oportunidades** | Lista demandas reais via `listDemands`, filtros funcionais (estado, cidade, modelo), botão "Tenho Interesse" cria resposta via `respondToDemand` |
| **MeuEstoque** | Usa `listMyMarketplaceAds` existente, botões Editar/Arquivar/Duplicar funcionam com `updateListingStatus` |
| **NovoVeiculo** | Formulário conecta ao `createMarketplaceListing` existente, upload de fotos via Storage |
| **Analytics** | KPIs reais via `getLojistaAnalytics`, gráficos Recharts com dados reais, tabela de conversões via `getRecentConversions` |
| **Assinatura** | Lê plano real da empresa (`mkt_plan`), mostra limites corretos (1/10/25) |
| **Configuracoes** | CRUD em `lojista_settings`, toggles reais para notificações, privacidade e auto-reply |

---

## Fluxo de Dados

```
Lojista clica "Tenho Interesse"
  → lojistaService.respondToDemand()
    → INSERT em marketplace_demand_responses
      → RLS valida que user_id = auth.uid()

Lojista abre Hub
  → lojistaService.getLojistaKPIs()
    → SELECT SQL get_lojista_kpis(company_id)
      → Retorna JSON com métricas

Lojista abre Analytics
  → lojistaService.getLojistaAnalytics()
    → SELECT SQL get_lojista_analytics(company_id)
      → Retorna métricas
  → lojistaService.getMonthlyInteractions()
    → SELECT SQL get_lojista_monthly_interactions()
      → Dados para gráfico de linha
```

---

## Ordem de Execução

| Passo | Arquivo | Ação |
|---|---|---|
| 1 | `supabase/migrations/XXXXXX_create_lojista_backend.sql` | Migration SQL completa (tabelas, funções, RLS, grants) |
| 2 | `src/types/lojista.ts` | Criar interfaces TypeScript |
| 3 | `src/integrations/supabase/services/lojistaService.ts` | Criar service com todas as chamadas |
| 4 | `src/pages/lojista/PortaldoLojista.tsx` | Integrar Hub com dados reais |
| 5 | `src/pages/lojista/Oportunidades.tsx` | Integrar demandas reais |
| 6 | `src/pages/lojista/MeuEstoque.tsx` | Trocar mock por listMyMarketplaceAds |
| 7 | `src/pages/lojista/NovoVeiculo.tsx` | Conectar formulário |
| 8 | `src/pages/lojista/Analytics.tsx` | Integrar métricas reais |
| 9 | `src/pages/lojista/Assinatura.tsx` | Ler plano real |
| 10 | `src/pages/lojista/Configuracoes.tsx` | CRUD de settings |

---

## Verificação

1. Rodar migration no Supabase
2. Criar dados de teste (demanda + seller profile)
3. Testar cada página no browser
4. Verificar KPIs, gráficos e tabelas com dados reais
5. Testar fluxo completo: ver demanda → responder → ver na tabela
6. Rodar `npm run lint` + `npm run build` para garantir sem erros

---

## Resumo

| Componente | Qtd |
|---|---|
| Tabelas novas | 4 |
| Funções SQL novas | 6 |
| RLS Policies novas | 8 |
| Service Functions | 11 |
| Interfaces TypeScript | 8 |
| Páginas a integrar | 7 |
