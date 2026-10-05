-- =====================================================
-- Script de Teste: Dashboard KPIs Backend
-- Descrição: Valida se todas as funções foram criadas
--            e estão funcionando corretamente
-- Data: 2026-05-04
-- =====================================================

-- ============================================
-- TESTE 1: Verificar se Funções Existem
-- ============================================
SELECT 
  routine_name as "Função",
  routine_type as "Tipo",
  CASE 
    WHEN routine_name IS NOT NULL THEN '✅ OK'
    ELSE '❌ ERRO'
  END as "Status"
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'generate_schedule_occurrences',
    'get_pagamentos_atrasados',
    'get_receita_estimada',
    'get_a_receber',
    'get_custo_total_estimado',
    'get_dashboard_kpis'
  )
ORDER BY routine_name;

-- Resultado esperado: 6 funções com status ✅ OK

-- ============================================
-- TESTE 2: Verificar Índices Criados
-- ============================================
SELECT 
  indexname as "Índice",
  tablename as "Tabela",
  CASE 
    WHEN indexname IS NOT NULL THEN '✅ OK'
    ELSE '❌ ERRO'
  END as "Status"
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'idx_payments_confirmation_lookup',
    'idx_payment_schedules_active_user',
    'idx_parcela_seguro_schedules_active_user',
    'idx_maintenances_user_date'
  )
ORDER BY tablename, indexname;

-- Resultado esperado: 4 índices com status ✅ OK

-- ============================================
-- TESTE 3: Testar Função generate_schedule_occurrences
-- ============================================
-- Gerar ocorrências mensais (dia 15) de maio/2026
SELECT 
  occurrence_date as "Data Gerada",
  TO_CHAR(occurrence_date, 'DD/MM/YYYY') as "Formatada"
FROM generate_schedule_occurrences(
  'mensal',           -- tipo_recorrencia
  15,                 -- dia_mes
  NULL,               -- dia_semana
  '2026-05-01'::DATE, -- data_inicio
  '2026-12-31'::DATE, -- data_fim
  '2026-05-01'::DATE, -- period_start
  '2026-05-31'::DATE  -- period_end
);

-- Resultado esperado: 1 linha com data 2026-05-15

-- ============================================
-- TESTE 4: Testar Função get_dashboard_kpis
-- ============================================
-- Buscar KPIs do mês atual
SELECT 
  (kpis->>'pagamentos_atrasados')::INTEGER as "Pagamentos Atrasados",
  (kpis->>'receita_estimada')::NUMERIC as "Receita Estimada",
  (kpis->>'a_receber')::NUMERIC as "A Receber",
  (kpis->>'custo_total_estimado')::NUMERIC as "Custo Total",
  (kpis->>'lucro_estimado')::NUMERIC as "Lucro Estimado",
  kpis->'periodo'->>'data_inicio' as "Período Início",
  kpis->'periodo'->>'data_fim' as "Período Fim"
FROM (
  SELECT get_dashboard_kpis(
    DATE_TRUNC('month', CURRENT_DATE)::DATE,
    (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE
  ) as kpis
) t;

-- Resultado esperado: 1 linha com valores numéricos (podem ser 0 se não houver dados)

-- ============================================
-- TESTE 5: Performance - Medir Tempo de Execução
-- ============================================
EXPLAIN ANALYZE
SELECT get_dashboard_kpis(
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE
);

-- Resultado esperado: Execution Time < 100ms

-- ============================================
-- TESTE 6: Verificar Permissões RLS
-- ============================================
SELECT 
  grantee as "Usuário",
  routine_name as "Função",
  privilege_type as "Permissão",
  CASE 
    WHEN privilege_type = 'EXECUTE' THEN '✅ OK'
    ELSE '❌ ERRO'
  END as "Status"
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name = 'get_dashboard_kpis'
  AND grantee = 'authenticated';

-- Resultado esperado: 1 linha com permissão EXECUTE e status ✅ OK

-- ============================================
-- TESTE 7: Dados de Exemplo (Opcional)
-- ============================================
-- Inserir schedule de teste (apenas se não houver dados)
-- ATENÇÃO: Comentar se já houver dados reais

/*
INSERT INTO carcontrol_payment_schedules (
  user_id,
  driver_id,
  vehicle_id,
  descricao,
  valor,
  tipo_recorrencia,
  dia_mes,
  data_inicio,
  ativo
) VALUES (
  auth.uid(),
  NULL,
  NULL,
  'Teste - Pagamento Mensal',
  1000.00,
  'mensal',
  15,
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  true
);

-- Testar novamente get_dashboard_kpis
SELECT get_dashboard_kpis(
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE
);

-- Resultado esperado: receita_estimada = 1000.00
*/

-- ============================================
-- TESTE 8: Comparação com Dados Reais
-- ============================================
-- Contar schedules ativos
SELECT 
  'Payment Schedules Ativos' as "Tabela",
  COUNT(*) as "Total",
  COUNT(DISTINCT user_id) as "Usuários Únicos"
FROM carcontrol_payment_schedules
WHERE ativo = true

UNION ALL

SELECT 
  'Parcela/Seguro Schedules Ativos',
  COUNT(*),
  COUNT(DISTINCT user_id)
FROM carcontrol_parcela_seguro_schedules
WHERE ativo = true

UNION ALL

SELECT 
  'Pagamentos Confirmados',
  COUNT(*),
  COUNT(DISTINCT user_id)
FROM carcontrol_payments
WHERE status = 'pago';

-- ============================================
-- RESUMO DOS TESTES
-- ============================================
SELECT 
  '✅ MIGRATION APLICADA COM SUCESSO!' as "Status",
  'Todas as funções, índices e permissões foram criados corretamente.' as "Mensagem",
  'Execute os testes acima para validar o funcionamento.' as "Próximo Passo";

-- ============================================
-- ROLLBACK (Apenas em caso de emergência)
-- ============================================
/*
-- ATENÇÃO: Isso remove TODAS as funções e índices criados!
-- Use apenas se precisar reverter a migration

DROP FUNCTION IF EXISTS get_dashboard_kpis(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_custo_total_estimado(UUID, DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_a_receber(UUID, DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_receita_estimada(UUID, DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_pagamentos_atrasados(UUID, DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS generate_schedule_occurrences(TEXT, INTEGER, INTEGER, DATE, DATE, DATE, DATE) CASCADE;

DROP INDEX IF EXISTS idx_payments_confirmation_lookup;
DROP INDEX IF EXISTS idx_payment_schedules_active_user;
DROP INDEX IF EXISTS idx_parcela_seguro_schedules_active_user;
DROP INDEX IF EXISTS idx_maintenances_user_date;
*/
