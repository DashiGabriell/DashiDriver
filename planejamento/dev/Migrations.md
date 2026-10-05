# Plano de Backend: Migrations.tsx

## 🎯 Objetivo
Visualizar status das migrações do banco de dados.

## 🗄️ Estrutura de Dados
- **Tabela:** `schema_migrations` (suposta tabela do Supabase ou controle próprio).

## 🔧 Implementação
- **Hook:** `useMigrations()` para ler o estado atual.
- **UI:** Exibir lista de migrações aplicadas.

## 🔐 Segurança
- RLS política: Acesso estritamente para roles 'dev' ou 'admin'.
