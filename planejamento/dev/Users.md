# Plano de Backend: Users.tsx

## 🎯 Objetivo
Gerenciamento de usuários globais e suas permissões.

## 🗄️ Estrutura de Dados
- **Tabela:** `public.profiles` e `auth.users`.

## 🔧 Implementação
- **Hook:** `useGlobalUsers()` para listar e gerenciar papéis.
- **UI:** Tabela de usuários com edição de roles.

## 🔐 Segurança
- RLS política: Apenas dev podem listar e editar usuários.
