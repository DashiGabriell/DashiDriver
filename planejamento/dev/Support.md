# Plano de Backend: Support.tsx

## 🎯 Objetivo
Gerenciamento de tickets e chamados de suporte.

## 🗄️ Estrutura de Dados
- **Tabela:** `support_tickets` (id, user_id, subject, message, status, priority).

## 🔧 Implementação
- **Hook:** `useSupportTickets()` com filtros por status.
- **UI:** Lista de tickets e visualização de detalhe.

## 🔐 Segurança
- RLS política: Usuários apenas seus tickets; Admins todos.
