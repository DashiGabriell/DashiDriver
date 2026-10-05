## Objetivo
Corrigir o erro `Database error saving new user` no cadastro, garantindo que novos usuários consigam criar conta e entrar sem cair de volta no `/login`.

## O que vou ajustar
1. Revisar o fluxo de cadastro em `src/pages/Login.tsx` para alinhar signup e OAuth com o redirecionamento correto do app.
2. Corrigir a lógica de pós-login/autenticação para não mandar o usuário de volta ao login quando a sessão já existir.
3. Adicionar uma migration para consertar a função/trigger de criação automática do usuário no banco, que hoje é a origem mais provável do erro 500 no endpoint `/auth/v1/signup`.
4. Validar o fluxo de cadastro por e-mail e Google contra as tabelas realmente usadas pelo app (`carcontrol_profiles` e `carcontrol_user`).

## Diagnóstico encontrado
- O erro aparece no endpoint de auth (`/auth/v1/signup` com status 500), então a falha está no backend de autenticação, não no formulário React.
- O projeto depende de registros auxiliares em tabelas como `carcontrol_profiles` e `carcontrol_user` logo após criar o usuário.
- Há evidência de trigger/função `handle_new_user()` e também de múltiplos gatilhos antigos em `auth.users`, o que sugere schema legado ou trigger escrevendo em tabela/coluna incorreta.
- O app mistura caminhos de pós-login (`/bem-vindo`, `/dashboard`, `/onboarding`) e isso explica parte do comportamento de redirecionamento incorreto após autenticar.

## Implementação proposta
### Frontend
- Ajustar `Login.tsx` para:
  - usar `emailRedirectTo`/`redirectTo` coerente com a rota final;
  - evitar navegação prematura para `/dashboard` quando ainda falta onboarding/empresa;
  - manter o Google OAuth retornando para uma rota protegida válida.
- Revisar o comportamento de `ProtectedRoute` e da tela `BemVindo` para respeitar o estado real do usuário recém-criado.

### Banco / Auth
- Criar migration para:
  - recriar `public.handle_new_user()` com inserts compatíveis com o schema atual;
  - garantir que os inserts usem `NEW.id`, `NEW.email` e `NEW.raw_user_meta_data` corretamente;
  - remover trigger duplicado/legado em `auth.users` se houver;
  - recriar um único trigger oficial `on_auth_user_created` apontando para a função corrigida.
- Se necessário, tornar a função resiliente para não quebrar signup por campos opcionais ausentes.

## Validação
- Verificar que cadastro por e-mail deixa de retornar 500.
- Verificar que login/cadastro com Google não volta para `/login` indevidamente.
- Confirmar que o usuário criado passa a existir nas tabelas auxiliares esperadas e consegue seguir para onboarding/dashboard conforme o caso.

## Detalhes técnicos
- Arquivos alvo: `src/pages/Login.tsx`, possivelmente `src/components/layout/ProtectedRoute.tsx` e/ou `src/pages/BemVindo.tsx`.
- Nova migration SQL para corrigir trigger de auth.
- Provável causa raiz: trigger `handle_new_user` desatualizado em relação ao schema atual (`carcontrol_profiles` / `carcontrol_user`) ou múltiplos triggers concorrendo em `auth.users`.