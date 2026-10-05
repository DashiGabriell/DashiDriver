# Plano de Backend: Settings.tsx

## 🎯 Objetivo
Configurações globais do sistema.

## 🗄️ Estrutura de Dados
- **Tabela:** `app_settings` (key, value).

## 🔧 Implementação
- **Hook:** `useAppSettings()` para leitura/escrita.
- **UI:** Formulário para alterar configurações (ex: nome do sistema, email suporte).

## 🔐 Segurança
- RLS política: Apenas Admins podem alterar configurações.
