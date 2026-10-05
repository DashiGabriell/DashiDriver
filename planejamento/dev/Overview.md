# Plano de Backend: Overview.tsx

## 🎯 Objetivo
Dashboard de monitoramento geral da plataforma.

## 🗄️ Estrutura de Dados
- **RPC:** `get_dashboard_stats(p_user_id UUID)` (já existente, ajustar para visão global).

## 🔧 Implementação
- **Hook:** `useGlobalStats()` usando RPC.
- **UI:** Cards de estatísticas (Total Empresas, Total Usuários, Receita Total).

## 🔐 Segurança
- RLS política: Acesso apenas para roles 'admin'.
