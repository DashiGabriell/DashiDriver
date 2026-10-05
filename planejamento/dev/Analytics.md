# Plano de Backend: Analytics.tsx

## 🎯 Objetivo
Exibir métricas de uso, retenção e conversão da plataforma.

## 🗄️ Estrutura de Dados
- **RPC:** `get_analytics_stats(p_interval TEXT)`
- **RLS:** Acesso apenas para usuários com role 'admin'.

## 🔧 Implementação
- **Hook:** `useAnalytics()` utilizando `supabase.rpc()`.
- **UI:** Integrar Recharts com os dados retornados pela RPC.

## 🔐 Segurança
- RLS política: `CREATE POLICY "admin_only" ON analytics FOR SELECT TO authenticated USING (auth.jwt()->>'role' = 'admin');`
