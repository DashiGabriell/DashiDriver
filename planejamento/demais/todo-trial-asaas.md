# To-Do: Implementação de Trial de 7 Dias e Controle de Acesso (Duas Camadas)

Este documento descreve os passos necessários para implementar o período de teste de 7 dias utilizando uma lógica de controle em duas camadas (`profiles` e `companies`), desacoplando o trial inicial da integração imediata com o Asaas. O período de trial deve oferecer acesso equivalente ao **Plano Básico**.

## 📋 Checklist de Implementação

### 1. Database (Supabase)
- [x] **Modificar `carcontrol_profiles`**:
    - Adicionar `trial` (TEXT, default: 'ativo', CHECK: 'ativo', 'expirado').
- [x] **Modificar `carcontrol_companies`**:
    - Adicionar `trial` (TEXT, default: 'ativo', CHECK: 'ativo', 'expirado').
    - Garantir que o campo `ativo` (BOOLEAN) existe (já existe, usaremos para status de plano pago).

### 2. Lógica de Negócio (Frontend/Edge)
- [x] **Fluxo de Onboarding (`OnboardingCadastro.tsx`)**:
    - Ao finalizar o cadastro, processar a intenção de trial (`trial_intent`) e, se confirmada, disparar a função RPC `activate_trial_onboarding`. (Fluxo corrigido para atomicidade e robustez).
- [x] **Automatização de Expiração**:
    - Criar (ou adaptar) um *Cron Job* no Supabase que roda diariamente para verificar `created_at` e atualizar `trial` para 'expirado' após 7 dias. (SQL function `expire_trials` criada).
- [x] **Regra de Validação de Acesso**:
    - Criar hook `useAccessControl` que segue a hierarquia:
        1. Verifica `profiles.trial`. Se 'ativo', **Autoriza acesso (nível Básico)**.
        2. Se 'expirado', verifica `companies.ativo`. Se 'true' (plano pago), **Autoriza (conforme plano contratado)**.
        3. Caso contrário, **Bloqueia**. (Hook `useAccessControl` criado).

### 3. Frontend & UX
- [x] **Página de Expiração (`TrialExpirado.tsx`)**:
    - Criar página sem menu com animação `free-expirado.gif`, texto informativo e botão de redirecionamento para o onboarding/checkout. (Criado e rota adicionada).
- [x] **Contador de Trial**:
    - Criar componente que exibe quantos dias restam do trial baseado no `created_at`. (Componente `TrialCounter` criado e inserido no Perfil).
- [x] **Bloqueio de Acesso**:
    - Bloquear rotas/funcionalidades Pro e Master se o trial estiver 'expirado' E a empresa não estiver com status `ativo` (plano pago correspondente). (Implementado via ProtectedRoute).
    - Aplicar restrições do Plano Básico durante o trial.
- [x] **Modal de Assinatura**:
    - Exibir modal de upgrade quando o acesso estiver bloqueado ou ao tentar acessar recursos Pro/Master durante o trial. (Componente `SubscriptionModal` criado).

### 4. Testes
- [ ] Testar fluxo de novo cadastro com trial ativo (acesso Básico).
- [ ] Testar expiração automática após 7 dias (necessário rodar função SQL manualmente para simular).
- [ ] Testar fallback para a verificação de plano pago na tabela `companies`.
- [ ] Validar bloqueio de recursos Pro/Master durante o período de trial.

---
## 🛡️ Segurança (Conforme `squaddashi.md`)
- Sempre utilizar RLS no Supabase.
- Validar inputs com Zod.
- Não expor chaves de API.
