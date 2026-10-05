# Plano de Backend: Logs.tsx

## 🎯 Objetivo
Auditoria detalhada de ações do sistema.

## 🗄️ Estrutura de Dados
- **Tabela:** `audit_logs` (id, user_id, action, target_table, target_id, timestamp).

## 🔧 Implementação
- **Hook:** `useAuditLogs()` com filtros por usuário e ação.
- **UI:** Tabela de alta performance com filtros avançados.

## 🔐 Segurança
- RLS política: Apenas Super Admins podem ler logs.
