# Plano de Backend: System.tsx

## 🎯 Objetivo
Monitorar saúde do servidor, CPU, memória.

## 🗄️ Estrutura de Dados
- **RPC:** `get_system_health()`.

## 🔧 Implementação
- **Hook:** `useSystemHealth()` chamando RPC.
- **UI:** Gráficos de monitoramento.

## 🔐 Segurança
- RLS política: Acesso restrito a Super Admins.
