# Autenticação e Multitenancy

## Cadastro e Login
- Usuário clica em 'Cadastre-se'.
- Preenche informações.
- Redirecionado para Login.
- Após login: Redirecionado para `src/pages/mobile/OnboardingCadastro.tsx`.
- Seleção de plano.
- Checkout.
- **Pós-Checkout:**
  - Caso plano GESTÃO: Redirecionado para `src/pages/Onboarding.tsx` para cadastro da Locadora (vínculo multitenant).
  - Caso contrário: Acesso direto à área logada.

## Multitenancy
- Obrigatório vincular usuário ao `id` da empresa (locadora).
- Proibir acesso ao sistema sem vínculo de empresa.
- **Gerenciamento de Usuários:** Página de usuários para vincular id da empresa ao perfil.
- **Roles:** Coluna na tabela de usuários (`user`, `admin`, `dev`).
