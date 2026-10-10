<p align="center">
  <img src="../public/logo.png" alt="DashiDriver logo" width="220" />
</p>

# Supabase — DashiDriver

Fonte oficial de schema, Edge Functions e testes SQL deste monorepo.

> Repositório: `DashiDriver` · Epic 13

## Fonte da verdade

| Caminho | Papel |
|---------|--------|
| `supabase/migrations/*.sql` | **Única** pasta canônica de migrations incrementais |
| `supabase/functions/` | Edge Functions |
| `supabase/tests/` | Smoke SQL (RLS) + notas de fixtures |
| `supabase/marketplace/` | SQL histórico do módulo marketplace (aplicar só se ainda não estiver no remoto; novas mudanças → `migrations/`) |
| `scripts/migrations/` | Legado / one-offs — **não** é canônico; migrar para `supabase/migrations/` ao promover |

**Não são fonte da verdade:** `trash/`, dumps `*.dump`, pastas antigas `migrations/dump` e `migrations/comuns` (removidas do working tree; não reintroduzir).

## Regras

1. **Nunca editar** uma migration já aplicada em staging/produção. Crie uma nova com `supabase migration new <nome>`.
2. Preferir SQL **idempotente** (`IF NOT EXISTS`, `CREATE OR REPLACE`, `DROP POLICY IF EXISTS`) quando o remoto pode estar parcialmente aplicado.
3. Toda migration que mexe em tabela exposta deve revisar **RLS** (`planejamento/RLS-ACCESS-MATRIX.md`).
4. Não commitar dumps binários nem `.env` (ver `.gitignore`).

## Fluxo oficial de mudança de schema

```text
1. Desenvolver SQL em staging (SQL Editor ou supabase db query) até ficar correto
2. supabase migration new descricao_curta
3. Colar o SQL final no arquivo gerado (ou supabase db pull --linked quando aplicável)
4. Revisar RLS + advisors
5. Aplicar: supabase db push   (projeto linkado)
   — ou — colar no SQL Editor na ordem dos timestamps
6. Rodar supabase/tests/rls_cross_tenant_smoke.sql em staging
7. Atualizar types se necessário (supabase gen types / fluxo do time)
```

### CLI

```bash
npx supabase --version
npx supabase link --project-ref <ref>    # uma vez
npx supabase migration list
npx supabase db push                     # aplica migrations pendentes no remoto linkado
npx supabase migration up --local        # se usar stack local
```

Se o histórico remoto divergir do local (migrations antigas aplicadas só via Editor), **não** force `db reset` em produção. Use `migration list`, alinhe com o time, e prefira migrations incrementais novas.

## Baseline (schema atual)

O banco remoto de produção/staging já contém o schema legado aplicado historicamente (Editor / dumps).  
As migrations canônicas **a partir de 2026-06-27** cobrem incrementos pós-limpeza:

| Arquivo | Conteúdo |
|---------|----------|
| `20260627000001_create_access_logs.sql` | Tabela + RLS `access_logs` |
| `20260628000001_create_impersonate_tokens.sql` | Tokens de impersonação DEV |
| `20260723000001_ensure_rate_limits.sql` | `rate_limits` + RPC `check_rate_limit` |
| `20260723000002_rls_consolidation.sql` | Helpers + drop policies permissivas + baseline tenant |

Para **gerar** um dump schema-only (arquivo local, não versionar):

```bash
npx supabase db dump --linked -f ./trash/baseline_schema_$(date +%Y%m%d).sql
```

Staging “recriável” no curto prazo: projeto staging linkado + `db push` das migrations canônicas + seed mínimo descrito em `tests/fixtures/README.md`.  
Baseline squash completo (um único `00000000000000_baseline.sql`) fica como follow-up quando o dump remoto for revisado e validado.

## Checklist de release (migration + RLS)

- [ ] Migration nova em `supabase/migrations/` (timestamp único)
- [ ] SQL revisado; sem secrets no arquivo
- [ ] RLS: policies alinhadas à matriz; sem `USING (true)` em tabelas tenant
- [ ] `db push` (ou Editor) em **staging** primeiro
- [ ] Smoke: `supabase/tests/rls_cross_tenant_smoke.sql`
- [ ] `npm test` verde (Epic 12)
- [ ] Só então produção
- [ ] Documentar em `planejamento/` se a matriz de acesso mudou

## Docs relacionados

- `planejamento/RLS-ACCESS-MATRIX.md`
- `planejamento/RATE-LIMITS.md`
- `planejamento/TESTES-SAGRADOS.md`
- `planejamento/PLANO-EXECUCAO-MELHORIAS.md` — Epic 13
