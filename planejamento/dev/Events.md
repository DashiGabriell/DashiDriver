# Plano de Backend: Events.tsx

## 🎯 Objetivo
Visualizar eventos do sistema em tempo real.

## 🗄️ Estrutura de Dados
- **Tabela:** `audit_logs` ou `system_events`.
- **Realtime:** Habilitar Realtime na tabela para updates instantâneos.

## 🔧 Implementação
- **Hook:** `useSystemEvents()` utilizando `supabase.channel()` para escutar novos eventos.
- **UI:** Timeline component.

## 🔐 Segurança
- RLS política: Apenas Admins podem ler logs.
