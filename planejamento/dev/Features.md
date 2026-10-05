# Plano de Backend: Features.tsx

## 🎯 Objetivo
Gerenciar Feature Flags globais (Ativar/Desativar recursos).

## 🗄️ Estrutura de Dados
- **Tabela:** `feature_flags` (id, key, enabled, description).

## 🔧 Implementação
- **Hook:** `useFeatureFlags()` para leitura/atualização.
- **Lógica:** Componente wrapper que encapsula recursos baseado na flag.

## 🔐 Segurança
- RLS política: Leitura pública ou para autenticados; Escrita apenas para Admins.
