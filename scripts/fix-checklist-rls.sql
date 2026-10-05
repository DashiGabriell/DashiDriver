-- =====================================================
-- Script: Fix Checklist RLS Issues
-- Descrição: Script para corrigir problemas de RLS no checklist
-- Data: 2026-05-18
-- Autor: Gemini CLI
-- =====================================================

-- 1. Verificar se as tabelas existem
SELECT 'Verificando tabelas...' as status;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('carcontrol_checklists', 'carcontrol_checklist_images', 'carcontrol_user');

-- 2. Verificar se as colunas company_id existem
SELECT 'Verificando colunas company_id...' as status;

SELECT column_name, table_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'company_id'
AND table_name IN ('carcontrol_user', 'carcontrol_checklists', 'carcontrol_checklist_images');

-- 3. Verificar políticas de segurança existentes
SELECT 'Verificando políticas de segurança...' as status;

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('carcontrol_checklists', 'carcontrol_checklist_images', 'carcontrol_user');

-- 4. Verificar se RLS está habilitado
SELECT 'Verificando RLS...' as status;

SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('carcontrol_checklists', 'carcontrol_checklist_images', 'carcontrol_user');

-- 5. Testar a criação de um checklist (simulação)
SELECT 'Testando criação de checklist...' as status;

-- Esta query deve falhar se as políticas não estiverem corretas
-- SELECT * FROM create_test_checklist();

-- 6. Verificar JWT do usuário atual
SELECT 'Verificando JWT...' as status;

SELECT auth.jwt() as current_jwt;

-- 7. Verificar se o usuário tem company_id no JWT
SELECT 'Verificando company_id no JWT...' as status;

SELECT auth.jwt() ->> 'company_id' as company_id_from_jwt;

-- 8. Listar usuários existentes
SELECT 'Listando usuários...' as status;

SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 9. Listar perfis de usuários
SELECT 'Listando perfis...' as status;

SELECT id, email, company_id, created_at 
FROM public.carcontrol_user 
ORDER BY created_at DESC 
LIMIT 10;

-- 10. Verificar veículos do usuário
SELECT 'Verificando veículos...' as status;

SELECT id, placa, modelo, created_at 
FROM public.carcontrol_vehicles 
ORDER BY created_at DESC 
LIMIT 10;