# Referências e Manipulação das Colunas de Trial

Este documento mapeia todos os locais e recursos no código e no banco de dados que manipulam as colunas `trial`, `trial_intent` e `has_used_free_trial`.

## 1. Estrutura de Banco de Dados (Supabase)

Estas colunas são fundamentais para o controle de acesso de usuários e empresas durante o período de testes.

| Tabela | Coluna | Tipo | Descrição |
| :--- | :--- | :--- | :--- |
| `carcontrol_profiles` | `trial` | TEXT | Status: 'ativo', 'expirado' ou NULL. |
| `carcontrol_profiles` | `has_used_free_trial` | BOOLEAN | Marca se o usuário já utilizou o período de teste. |
| `carcontrol_companies`| `trial` | TEXT | Status de trial da empresa. |

## 2. Funções RPC e SQL

*   **`activate_trial_onboarding(p_trial_intent: BOOLEAN)`**: Função RPC chamada no frontend para ativar o status de trial no perfil e, opcionalmente, na empresa associada ao realizar o cadastro.
*   **`expire_trials` (SQL Function/Cron Job)**: Função que atualiza o status de `trial` para 'expirado' após a expiração dos 7 dias baseados no `created_at`.

## 3. Lógica de Negócio e Frontend

### Hooks
*   **`useAccessControl.ts`**: Principal hook para autorização. Verifica a hierarquia:
    1. `profile.trial === 'ativo'` -> Autoriza acesso Básico.
    2. `company.ativo === true` -> Autoriza conforme plano pago.
*   **`useSaveOnboarding.ts`**: Utiliza `trial_intent` para invocar a função RPC `activate_trial_onboarding`.

### Componentes e Páginas
*   **`OnboardingCadastro.tsx`**: Gerencia a escolha do trial pelo usuário, verifica `has_used_free_trial` antes de permitir a seleção, e atualiza o estado `trial_intent` e `has_used_free_trial` no banco.
*   **`TrialCounter.tsx`**: Exibe o tempo restante do trial.
*   **`TrialExpirado.tsx`**: Página de destino quando o trial expira e não há plano pago ativo.
*   **`ProtectedRoute.tsx`**: Utiliza as regras de acesso para bloquear ou permitir rotas protegidas baseadas no status de trial/plano.

### Webhooks
*   **`asaas-webhook/index.ts`**: Atualiza a coluna `trial` para `NULL` após o processamento bem-sucedido de um pagamento (ativação de plano pago), encerrando o estado de trial.

## 4. Documentação de Fluxo

Para detalhes sobre a intenção do design e fluxo, consulte:
*   `FLUXO_CADASTRO.md`
*   `planejamento/todo-trial-asaas.md`
