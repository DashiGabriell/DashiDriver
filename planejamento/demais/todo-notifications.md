# 📋 TODO — Implementação do Sistema de Notificações DashiDrive

> **Escopo**: Implementar arquitetura de notificações em 2 níveis (Críticas + Operacionais)
> **Objetivo**: Entregar valor sem ruído, educando o usuário sobre eventos realmente importantes
> **Data Início**: 16 de maio de 2026
> **Status**: 🟡 Planejado

---

## 📊 Visão Geral

Este documento estrutura a implementação do sistema de notificações em **4 fases** seguindo a arquitetura proposta em `notifications-plan.md`.

### Notificações a Implementar

#### 🔴 Críticas (Push + Badge + Destaque)
- Pagamentos atrasados
- Seguro vencendo
- Manutenção vencida
- Checklist com dano registrado

#### 🟡 Operacionais (Central de Notificações)
- Pagamento confirmado
- Veículo devolvido

---

## 🗂️ Estrutura do Projeto

```
src/
├── components/
│   ├── notifications/
│   │   ├── NotificationCenter.tsx      (novo)
│   │   ├── NotificationBell.tsx        (novo)
│   │   ├── NotificationItem.tsx        (novo)
│   │   ├── CriticalAlert.tsx           (novo)
│   │   └── NotificationBadge.tsx       (novo)
├── hooks/
│   └── useNotifications.ts             (novo)
├── lib/
│   ├── notifications/
│   │   ├── triggers.ts                 (novo)
│   │   ├── validators.ts               (novo)
│   │   └── constants.ts                (novo)
└── pages/
    └── Notifications.tsx               (novo)

supabase/
└── migrations/
    └── [timestamp]_create_notifications_schema.sql  (nova)
```

---

# 🎯 FASE 1: Infraestrutura de Banco de Dados

## Objetivo
Criar estrutura persistente para notificações com políticas RLS seguras.

### ✅ Tarefas

#### 1.1 Criar Migration SQL
- [ ] Gerar arquivo migration em `supabase/migrations/`
- [ ] Criar tabela `notifications`
- [ ] Criar tabela `notification_preferences` (futura)
- [ ] Adicionar índices para performance
- [ ] Implementar triggers para `updated_at`

**Arquivos a criar:**
- `supabase/migrations/[timestamp]_create_notifications_schema.sql`

**Estrutura de Dados:**

```sql
-- Tabela notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Classificação
  type TEXT NOT NULL CHECK (type IN ('critical', 'operational')),
  category TEXT NOT NULL CHECK (category IN (
    'payment_overdue',
    'insurance_expiring',
    'maintenance_overdue',
    'damage_registered',
    'payment_confirmed',
    'vehicle_returned'
  )),
  
  -- Conteúdo
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  
  -- Metadados
  related_entity_type TEXT CHECK (related_entity_type IN (
    'veiculo', 'pagamento', 'manutencao', 'motorista'
  )),
  related_entity_id UUID,
  
  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_notifications_user_id_read 
  ON notifications(user_id, read, created_at DESC);
CREATE INDEX idx_notifications_type_category 
  ON notifications(user_id, type, category);
CREATE INDEX idx_notifications_created_at 
  ON notifications(created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON notifications
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

#### 1.2 Configurar Row Level Security (RLS)
- [ ] Habilitar RLS na tabela `notifications`
- [ ] Criar política: Usuário vê apenas suas notificações
- [ ] Criar política: Sistema (anon) pode inserir notificações
- [ ] Criar política: Usuário pode marcar como lido

**Políticas RLS:**

```sql
-- Política: SELECT apenas próprias notificações
CREATE POLICY "usuarios_leem_proprias_notificacoes"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Política: Sistema insere notificações
CREATE POLICY "sistema_insere_notificacoes"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Política: Usuário marca como lido
CREATE POLICY "usuario_marca_lido"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

#### 1.3 Criar Functions PostgreSQL
- [ ] Função para gerar notificação de pagamento atrasado
- [ ] Função para gerar notificação de seguro vencendo
- [ ] Função para gerar notificação de manutenção vencida
- [ ] Função para gerar notificação de dano registrado
- [ ] Função para gerar notificação de pagamento confirmado
- [ ] Função para gerar notificação de veículo devolvido

**Exemplo de Function:**

```sql
CREATE OR REPLACE FUNCTION criar_notificacao_pagamento_atrasado()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_dias_atraso INT;
BEGIN
  -- Lógica para detectar pagamento atrasado
  -- Inserir notificação com type='critical'
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### 1.4 Criar Triggers nas Tabelas Relacionadas
- [ ] Trigger em `pagamentos` para detectar atraso
- [ ] Trigger em `manutencoes` para detectar vencimento
- [ ] Trigger em `veiculos` para detectar seguro vencendo
- [ ] Trigger em `checklists` para detectar dano

---

# 🎨 FASE 2: Componentes e UI

## Objetivo
Criar componentes React para exibição e interação com notificações.

### ✅ Tarefas

#### 2.1 Criar Hook `useNotifications`
- [ ] Implementar `src/hooks/useNotifications.ts`
- [ ] Configurar React Query para fetch
- [ ] Implementar Realtime subscription com Supabase
- [ ] Implementar mutação para marcar como lido
- [ ] Implementar mutação para deletar
- [ ] Implementar computação de badges (críticas/operacionais)

**Arquivo:** `src/hooks/useNotifications.ts`

```typescript
export function useNotifications() {
  // Fetch initial notifications
  // Subscribe to realtime updates
  // Return: { 
  //   critical, 
  //   operational, 
  //   markAsRead, 
  //   delete, 
  //   unreadCriticalCount,
  //   unreadOperationalCount
  // }
}
```

#### 2.2 Criar Componente `NotificationCenter`
- [ ] Componente modal/drawer para listar notificações
- [ ] Separação visual por tipo (crítica/operacional)
- [ ] Ordenação por data (mais recentes primeiro)
- [ ] Ação para marcar como lido
- [ ] Ação para deletar notificação
- [ ] Link para ação associada (action_url)

**Arquivo:** `src/components/notifications/NotificationCenter.tsx`

#### 2.3 Criar Componente `NotificationBell`
- [ ] Badge com número de notificações críticas
- [ ] Indicador visual diferente para críticas vs operacionais
- [ ] Abertura/fechamento do NotificationCenter
- [ ] Pulsação ou animação para críticas

**Arquivo:** `src/components/notifications/NotificationBell.tsx`

#### 2.4 Criar Componente `NotificationItem`
- [ ] Card individual de notificação
- [ ] Ícone baseado em categoria
- [ ] Cores diferenciadas (crítica vs operacional)
- [ ] Timestamp relativo (ex: "há 5 minutos")
- [ ] Botão para marcar como lido
- [ ] Botão para abrir ação (se houver action_url)

**Arquivo:** `src/components/notifications/NotificationItem.tsx`

#### 2.5 Criar Componente `CriticalAlert`
- [ ] Componente para notificações críticas na tela principal
- [ ] Toast ou banner destacado
- [ ] Som/vibração (opcional, respeitar preferências)
- [ ] Ação primária (ex: "Cobrar agora")
- [ ] Fechar/postergar

**Arquivo:** `src/components/notifications/CriticalAlert.tsx`


---

# ⚙️ FASE 3: Lógica de Negócio

## Objetivo
Implementar gatilhos que geram notificações de acordo com as regras de negócio.

### ✅ Tarefas

#### 3.1 Sistema de Detectores (Triggers)
- [ ] Criar `src/lib/notifications/triggers.ts`
- [ ] Implementar detector: Pagamento atrasado
- [ ] Implementar detector: Seguro vencendo (24-48h antes)
- [ ] Implementar detector: Manutenção vencida
- [ ] Implementar detector: Checklist com dano

**Arquivo:** `src/lib/notifications/triggers.ts`

```typescript
export const NotificationTriggers = {
  // Executado quando pagamento ultrapassa data de vencimento
  checkPaymentOverdue: async (pagamentoId: UUID) => {},
  
  // Executado diariamente para verificar seguros vencendo
  checkInsuranceExpiring: async () => {},
  
  // Executado quando manutenção é criada/atualizada
  checkMaintenanceOverdue: async (manutencaoId: UUID) => {},
  
  // Executado quando checklist é finalizado com dano
  checkDamageRegistered: async (checklistId: UUID) => {},
};
```

#### 3.2 Sistema de Confirmação (Operacionais)
- [ ] Criar listeners para pagamento confirmado
- [ ] Criar listeners para veículo devolvido
- [ ] Estrutura de listeners reutilizável

**Padrão:**

```typescript
export const NotificationConfirmations = {
  onPaymentConfirmed: async (pagamentoId: UUID) => {},
  onVehicleReturned: async (locacaoId: UUID) => {},
};
```

#### 3.3 Constantes e Enums
- [ ] Criar `src/lib/notifications/constants.ts`
- [ ] Enums para tipos, categorias, prioridades
- [ ] Mensagens templates
- [ ] Configurações de timings (ex: seguro vence em 48h)

**Arquivo:** `src/lib/notifications/constants.ts`

```typescript
export const NotificationTypes = {
  CRITICAL: 'critical',
  OPERATIONAL: 'operational',
} as const;

export const NotificationCategories = {
  PAYMENT_OVERDUE: 'payment_overdue',
  INSURANCE_EXPIRING: 'insurance_expiring',
  MAINTENANCE_OVERDUE: 'maintenance_overdue',
  DAMAGE_REGISTERED: 'damage_registered',
  PAYMENT_CONFIRMED: 'payment_confirmed',
  VEHICLE_RETURNED: 'vehicle_returned',
} as const;

export const NotificationMessages = {
  PAYMENT_OVERDUE: (motorista: string, diasAtraso: number) =>
    `${motorista} está com pagamento atrasado há ${diasAtraso} dias`,
  // ... mais templates
} as const;
```

#### 3.4 Validadores
- [ ] Criar `src/lib/notifications/validators.ts`
- [ ] Função para validar se notificação deve ser criada
- [ ] Evitar duplicação (ex: não criar 2 alertas para mesmo pagamento)
- [ ] Respeitar preferências do usuário (v2)

**Arquivo:** `src/lib/notifications/validators.ts`

```typescript
export async function shouldCreateNotification(
  category: NotificationCategory,
  relatedEntityId: UUID
): Promise<boolean> {
  // Verificar se já existe notificação recente para esta entidade
  // Retornar boolean
}
```

#### 3.5 Service de Notificações
- [ ] Criar `src/integrations/supabase/services/notificationService.ts`
- [ ] Função `createNotification()`
- [ ] Função `markAsRead()`
- [ ] Função `deleteNotification()`
- [ ] Função `getUnreadCount()`

**Arquivo:** `src/integrations/supabase/services/notificationService.ts`

```typescript
export async function createNotification(
  userId: UUID,
  type: 'critical' | 'operational',
  category: string,
  title: string,
  message: string,
  actionUrl?: string,
  relatedEntity?: { type: string; id: UUID }
): Promise<Notification> {
  // Validar se deve criar
  // Inserir em database
  // Retornar notificação criada
}
```

---

# 🧪 FASE 4: Integração e Testes

## Objetivo
Integrar notificações no fluxo da aplicação e validar funcionamento.

### ✅ Tarefas

#### 4.1 Integração com Layout Principal
- [ ] Adicionar NotificationBell no header/navbar
- [ ] Importar e usar `useNotifications` hook
- [ ] Exibir NotificationCenter quando clicado
- [ ] Mostrar CriticalAlert para notificações críticas não lidas
- [ ] Responsividade mobile

**Arquivo a modificar:** `src/layouts/MainLayout.tsx`

#### 4.2 Integração com Fluxos Existentes
- [ ] Hook em criação de pagamento (confirmar pagamento)
- [ ] Hook em devolução de veículo
- [ ] Hook em atualização de seguro
- [ ] Hook em criação de checklist
- [ ] Hook em atualização de manutenção

**Padrão de integração:**

```typescript
// Exemplo em submitForm()
const handlePaymentConfirm = async (pagamentoDados) => {
  const resultado = await confirmarPagamento(pagamentoDados);
  if (resultado.success) {
    await NotificationConfirmations.onPaymentConfirmed(resultado.id);
  }
};
```

#### 4.3 Testes Unitários
- [ ] Teste para Hook `useNotifications`
- [ ] Teste para componente `NotificationItem`
- [ ] Teste para componente `NotificationBell`
- [ ] Teste para serviço de notificações

**Localização:** `src/test/notifications/`

#### 4.4 Testes de Integração
- [ ] Cenário: Pagamento atrasado gera notificação crítica
- [ ] Cenário: Seguro vence em 48h gera notificação crítica
- [ ] Cenário: Manutenção vencida gera notificação crítica
- [ ] Cenário: Dano registrado gera notificação crítica
- [ ] Cenário: Pagamento confirmado gera notificação operacional
- [ ] Cenário: Veículo devolvido gera notificação operacional

**Arquivo SQL para testes:**

```sql
-- Teste de pagamento atrasado
INSERT INTO pagamentos (user_id, veiculo_id, valor, data_vencimento, status)
VALUES (uuid_v4(), uuid_v4(), 500, NOW() - INTERVAL '3 days', 'pendente');

-- Verificar se notificação foi criada
SELECT * FROM notifications 
WHERE category = 'payment_overdue' 
AND created_at > NOW() - INTERVAL '1 minute';
```

#### 4.5 Teste Manual (Checklist)
- [ ] Testar No. crítica: Visualizar pagamento atrasado
- [ ] Testar No. crítica: Clicar em ação (ir para pagamento)
- [ ] Testar No. crítica: Marcar como lido
- [ ] Testar No. operacional: Listar pagamentos confirmados
- [ ] Testar No. operacional: Deletar notificação
- [ ] Testar badge: Contador atualiza em realtime
- [ ] Testar responsividade: Mobile, tablet, desktop
- [ ] Testar performance: 100+ notificações não travando

#### 4.6 Deploy
- [ ] Verificar variáveis de ambiente
- [ ] Rodar migrations no Supabase (você aplica)
- [ ] Testar em staging
- [ ] Deploy em produção

---

## 📈 Métricas de Sucesso

Ao final da implementação:

- ✅ 100% das notificações críticas geradas corretamente
- ✅ 100% das notificações operacionais geradas corretamente
- ✅ Sem notificações duplicadas
- ✅ Badge atualiza em tempo real (Realtime)
- ✅ Componentes responsivos em mobile
- ✅ Performance: load < 200ms
- ✅ Zero erros em console
- ✅ Tests: > 80% coverage

---

## 🔗 Referências

- [notifications-plan.md](./notifications-plan.md) — Filosofia e arquitetura
- [squaddashi.md](./.agent/squaddashi.md) — Padrões de código (Supabase, React Query, RLS)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação React Query](https://tanstack.com/query/latest)

---

## 📝 Notas Importantes

1. **Ordem de implementação**: Seguir de FASE 1 → FASE 2 → FASE 3 → FASE 4
2. **Migrations**: Você aplicará as migrations no Supabase manualmente
3. **Sem decorações**: Notificações são acionáveis, não informativas
4. **Educação do usuário**: Apenas 2 níveis (crítica + operacional) nesta v1
5. **Realtime**: Usar `supabase.from('notifications').on('*')` para updates
6. **Performance**: Índices são críticos, verificar em `FASE 1`

---

## 🎯 Status Geral

| Fase | Status | Progresso |
|------|--------|-----------|
| 1 - Infraestrutura BD | 🟡 Pendente | 0% |
| 2 - Componentes UI | 🟡 Pendente | 0% |
| 3 - Lógica Negócio | 🟡 Pendente | 0% |
| 4 - Integração & Testes | 🟡 Pendente | 0% |

---

**Criado em**: 16 de maio de 2026  
**Responsável**: Arquitetura Squad DashiDrive  
**Última atualização**: 16 de maio de 2026

