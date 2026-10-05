# Archive note — migrations legadas

Pastas históricas `supabase/migrations/dump/` e `supabase/migrations/comuns/` foram **retiradas do working tree** (Epic 1 / Epic 13).

- Cópias locais podem existir em `trash/` (gitignored).
- O schema live está no projeto Supabase remoto.
- Novas mudanças **somente** via `supabase/migrations/<timestamp>_*.sql` na raiz de `migrations/`.
- Não recolocar dumps nem “master schema” no path canônico.

Ver `supabase/README.md` para o fluxo oficial.
