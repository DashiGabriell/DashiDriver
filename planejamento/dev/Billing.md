# Plano de Backend: Billing.tsx

## 🎯 Objetivo
Gerenciar assinaturas, inadimplência e integrações de pagamento (Asaas).

## 🗄️ Estrutura de Dados
- **Tabela:** `subscriptions` (user_id, asaas_sub_id, status, next_payment).
- **Edge Function:** `handle_asaas_webhook` (processar eventos do Asaas).

## 🔧 Implementação
- **Hook:** `useSubscription()` para buscar status atual.
- **Integração:** Webhook endpoint no Supabase para atualizar status em tempo real.

## 🔐 Segurança
- RLS política: Apenas Admin pode atualizar status de assinatura; usuários podem apenas ler sua própria assinatura.
