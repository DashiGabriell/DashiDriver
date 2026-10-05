# Fixtures de staging (Epic 12)

Dados de teste **nunca** devem usar PII real de clientes.

## Contas mínimas para smoke RLS

Criar (ou reutilizar) no projeto de **staging**:

| Alias | Role | Empresa | Uso |
|-------|------|---------|-----|
| User A | admin | Company Alpha | Tenant “bom” |
| User B | admin | Company Beta | Cross-tenant (deve falhar SELECT na Alpha) |
| Dev | `role=dev` | qualquer | Bypass helpers `is_dev_user()` |

Não versionar senhas. Guardar credenciais só em 1Password / secrets do time.

## Seed sugerido (manual)

1. Duas companies com `ativo = true`.  
2. Um `carcontrol_vehicles` em cada company.  
3. Rodar `supabase/tests/rls_cross_tenant_smoke.sql` autenticado como User A apontando `company_id` da Beta → esperado 0 leaks.

## Pagamento / webhook

- Um registro em `payments` com `asaas_subscription_id` de sandbox.  
- Nunca apontar webhook de produção para staging e vice-versa sem secret isolado.
