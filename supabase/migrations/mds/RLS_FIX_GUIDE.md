# 🔐 FIX: Erro de RLS (Row Level Security) em Checklists

## 🚨 Problema

O erro `403 Forbidden` ao criar checklists ocorre devido a políticas de segurança RLS (Row Level Security) mal configuradas na tabela `carcontrol_checklists`.

**Erro específico:**
```
new row violates row-level security policy for table "carcontrol_checklists"
```

## ✅ Solução Implementada

### 1. Migrações Criadas

Foram criadas 5 migrações para corrigir o problema:

#### 20260518000001_add_checklist_rls_policies.sql
- Adiciona políticas de segurança RLS para a tabela `carcontrol_checklists`
- Cria funções para verificar permissões de acesso
- Habilita RLS nas tabelas relacionadas

#### 20260518000002_update_jwt_company_id.sql
- Atualiza o JWT para incluir o `company_id`
- Cria triggers para garantir que o JWT contenha o `company_id`
- Atualiza políticas de segurança para usar o `company_id` do JWT

#### 20260518000003_add_company_id_to_users.sql
- Adiciona a coluna `company_id` à tabela `carcontrol_user`
- Cria funções para obter o `company_id` do usuário
- Atualiza o JWT com o `company_id`

#### 20260518000004_fix_company_id_column.sql
- Garante que a coluna `company_id` exista
- Atualiza dados existentes que não têm `company_id`
- Cria triggers para garantir o `company_id` no JWT

#### 20260518000005_final_rls_setup.sql
- Configura final das políticas de segurança RLS
- Cria funções para verificar permissões de acesso
- Habilita RLS em todas as tabelas necessárias

### 2. Atualização do Código

#### checklistService.ts
- Atualizado para garantir que o JWT contenha o `company_id`
- Adicionada verificação de autenticação antes de criar checklists

#### useCarcontrolUser.ts
- Atualizado para garantir que o perfil contenha o `company_id`
- Adicionado log para quando o `company_id` não for encontrado

### 3. Políticas de Segurança Criadas

#### Para `carcontrol_checklists`:
- `checklists_company_read`: Usuários podem ver checklists da sua empresa
- `checklists_company_insert`: Usuários podem criar checklists na sua empresa
- `checklists_company_update`: Usuários podem atualizar checklists da sua empresa
- `checklists_company_delete`: Usuários podem deletar checklists da sua empresa

#### Para `carcontrol_checklist_images`:
- `checklist_images_company_read`: Usuários podem ver imagens de checklists da sua empresa
- `checklist_images_company_insert`: Usuários podem adicionar imagens de checklists na sua empresa
- `checklist_images_company_update`: Usuários podem atualizar imagens de checklists da sua empresa
- `checklist_images_company_delete`: Usuários podem deletar imagens de checklists da sua empresa

## 🚀 Como Aplicar a Solução

### 1. Executar as Migrações

```bash
# Resetar o banco de dados (opcional, se quiser começar do zero)
supabase db reset

# Ou aplicar as migrações individualmente
supabase migration up 20260518000001
supabase migration up 20260518000002
supabase migration up 20260518000003
supabase migration up 20260518000004
supabase migration up 20260518000005
```

### 2. Verificar as Políticas

```sql
-- Verificar políticas de segurança
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'carcontrol_checklists';
```

### 3. Testar a Criação de Checklists

```sql
-- Testar a criação de um checklist
INSERT INTO public.carcontrol_checklists (
  company_id, 
  user_id, 
  vehicle_id, 
  type
) VALUES (
  'seu-company-id', 
  'seu-user-id', 
  'seu-vehicle-id', 
  'entrega'
);
```

## 🔧 Verificação Final

1. **Verificar se o JWT contém o `company_id`:**
   ```sql
   SELECT auth.jwt() ->> 'company_id' as company_id_from_jwt;
   ```

2. **Verificar se as tabelas têm RLS habilitado:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('carcontrol_checklists', 'carcontrol_checklist_images');
   ```

3. **Testar a criação de checklists via aplicação:**
   - Acesse a página de criação de checklists
   - Tente criar um novo checklist
   - Verifique se o erro desapareceu

## 📝 Observações

- As migrações foram criadas para serem idempotentes (podem ser executadas várias vezes)
- As políticas de segurança foram criadas usando o padrão de `company_id` do JWT
- O código foi atualizado para garantir que o JWT contenha o `company_id`
- Todas as tabelas relacionadas agora têm RLS habilitado

## 🚨 Próximos Passos

1. Execute as migrações no seu ambiente de produção
2. Teste a criação de checklists
3. Monitore os logs para verificar se não há mais erros de RLS
4. Atualize o código do frontend se necessário

## 📞 Suporte

Se o problema persistir após aplicar as migrações, verifique:
1. Se o JWT contém o `company_id`
2. Se o usuário tem permissão de acesso ao veículo
3. Se as políticas de segurança estão corretas
4. Se o RLS está habilitado nas tabelas