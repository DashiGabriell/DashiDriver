# Plano de Backend: Companies.tsx

## 🎯 Objetivo
CRUD completo para gestão de empresas/locadoras.

## 🗄️ Estrutura de Dados
- **Tabela:** `carcontrol_companies`.
- **Campos:** nome, cnpj, email, telefone, ativo, trial_status.

## 🔧 Implementação
- **Hook:** `useCompanies()` com CRUD completo (list, create, update, delete).
- **UI:** Tabela Shadcn/ui com busca e filtros.

## 🔐 Segurança
- RLS política: Apenas usuários com role 'admin' (sistema) podem gerenciar todas as empresas.
