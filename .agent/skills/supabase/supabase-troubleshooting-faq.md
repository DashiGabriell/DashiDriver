# Supabase - Troubleshooting e FAQ

## 🐛 Troubleshooting Detalhado

### 1. Problemas de Autenticação

#### Erro: "Invalid API key"

**Sintomas:**
```
Error: Invalid API key
```

**Causas Possíveis:**
1. Chave incorreta no `.env`
2. Usando `service_role` key ao invés de `anon` key
3. Variável de ambiente não carregada
4. Servidor não reiniciado após mudança no `.env`

**Soluções:**

```bash
# 1. Verificar .env
cat .env | grep SUPABASE

# 2. Confirmar que está usando a chave correta
# ✅ Usar: VITE_SUPABASE_PUBLISHABLE_KEY (anon key)
# ❌ Não usar: SUPABASE_SERVICE_ROLE_KEY

# 3. Reiniciar servidor
npm run dev
```

**Validação:**
```typescript
console.log("URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("Key:", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 20) + "...");
```

---

#### Erro: "Session expired"

**Sintomas:**
```
Error: Session expired
User is logged out unexpectedly
```

**Causas Possíveis:**
1. `autoRefreshToken` não configurado
2. Token expirou e não foi renovado
3. Listener de `onAuthStateChange` não implementado

**Soluções:**

```typescript
// 1. Verificar configuração do cliente
export const supabase = createClient(URL, KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true, // ✅ Deve estar true
  }
});

// 2. Implementar listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token renovado automaticamente');
  }
  if (event === 'SIGNED_OUT') {
    console.log('Usuário deslogado');
  }
});
```

---

#### Erro: "User not found"

**Sintomas:**
```
Error: User not found
Cannot read properties of null (reading 'id')
```

**Causas Possíveis:**
1. Usuário não está autenticado
2. Sessão não foi carregada ainda
3. Token inválido

**Soluções:**

```typescript
// 1. Sempre verificar se usuário existe
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  // Redirecionar para login
  window.location.href = '/login';
  return;
}

// 2. Usar hook useAuth
const { user, loading } = useAuth();

if (loading) return <div>Carregando...</div>;
if (!user) return <Navigate to="/login" />;

// 3. Verificar sessão
const { data: { session } } = await supabase.auth.getSession();
console.log('Sessão:', session);
```

---

### 2. Problemas com Row Level Security (RLS)

#### Erro: "Row Level Security policy violation"

**Sintomas:**
```
Error: new row violates row-level security policy for table "users"
```

**Causas Possíveis:**
1. RLS habilitado mas sem políticas
2. Política muito restritiva
3. Usuário não autenticado
4. Política com condição incorreta

**Soluções:**

```sql
-- 1. Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- 2. Listar políticas existentes
SELECT * FROM pg_policies 
WHERE tablename = 'users';

-- 3. Criar política permissiva para teste
CREATE POLICY "allow_all_for_testing" ON users
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Depois de testar, criar política correta
DROP POLICY "allow_all_for_testing" ON users;

CREATE POLICY "users_select" ON users
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "users_insert" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
```

**Debugging:**
```typescript
// Verificar se usuário está autenticado
const { data: { user } } = await supabase.auth.getUser();
console.log('User ID:', user?.id);

// Testar query com detalhes do erro
const { data, error } = await supabase
  .from('users')
  .insert({ name: 'Test' });

console.log('Error:', error);
console.log('Error details:', error?.details);
console.log('Error hint:', error?.hint);
```

---

#### Erro: "Permission denied for table"

**Sintomas:**
```
Error: permission denied for table users
```

**Causas Possíveis:**
1. RLS não configurado corretamente
2. Usando `service_role` key quando deveria usar `anon` key
3. Política não cobre o tipo de operação

**Soluções:**

```sql
-- 1. Verificar permissões da tabela
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'users';

-- 2. Garantir permissões corretas
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO anon;

-- 3. Criar políticas para cada operação
CREATE POLICY "users_select" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_insert" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "users_update" ON users FOR UPDATE TO authenticated USING (true);
CREATE POLICY "users_delete" ON users FOR DELETE TO authenticated USING (true);
```

---

### 3. Problemas com Queries

#### Erro: "Table doesn't exist"

**Sintomas:**
```
Error: relation "public.users" does not exist
```

**Causas Possíveis:**
1. Migrações não foram aplicadas
2. Nome da tabela incorreto
3. Schema incorreto
4. Conectado ao banco errado

**Soluções:**

```bash
# 1. Verificar se migrações foram aplicadas
supabase db push

# 2. Listar tabelas existentes
psql "postgresql://..." -c "\dt"

# 3. Verificar no SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

```typescript
// 4. Verificar nome da tabela no código
const { data, error } = await supabase
  .from('users') // ✅ Correto
  // .from('user') // ❌ Errado (singular vs plural)
  .select('*');
```

---

#### Erro: "Column doesn't exist"

**Sintomas:**
```
Error: column "email" does not exist
```

**Causas Possíveis:**
1. Coluna não existe na tabela
2. Nome da coluna incorreto (case-sensitive)
3. Tipos TypeScript desatualizados

**Soluções:**

```bash
# 1. Verificar colunas da tabela
psql "postgresql://..." -c "\d users"

# 2. Atualizar tipos TypeScript
npx supabase gen types typescript --project-id PROJECT_ID > src/integrations/supabase/types.ts
```

```typescript
// 3. Usar tipos TypeScript para validação
import { Database } from '@/integrations/supabase/types';

type User = Database['public']['Tables']['users']['Row'];

// TypeScript vai avisar se coluna não existir
const user: User = {
  id: '...',
  email: '...', // ✅ TypeScript valida
  // emai: '...', // ❌ TypeScript vai dar erro
};
```

---

#### Erro: "Foreign key violation"

**Sintomas:**
```
Error: insert or update on table "orders" violates foreign key constraint
```

**Causas Possíveis:**
1. ID referenciado não existe
2. Ordem de inserção incorreta
3. Constraint mal configurada

**Soluções:**

```typescript
// 1. Verificar se registro pai existe
const { data: customer } = await supabase
  .from('customers')
  .select('id')
  .eq('id', customerId)
  .single();

if (!customer) {
  throw new Error('Cliente não encontrado');
}

// 2. Inserir na ordem correta
// Primeiro o pai
const { data: customer } = await supabase
  .from('customers')
  .insert({ name: 'João' })
  .select()
  .single();

// Depois o filho
const { data: order } = await supabase
  .from('orders')
  .insert({ customer_id: customer.id })
  .select()
  .single();
```

---

### 4. Problemas de Performance

#### Query Lenta (> 1s)

**Sintomas:**
- Queries demorando muito
- Timeout em requisições
- Interface travando

**Causas Possíveis:**
1. Falta de índices
2. Query mal otimizada
3. Muitos dados sendo retornados
4. Joins complexos

**Soluções:**

```sql
-- 1. Analisar query
EXPLAIN ANALYZE
SELECT * FROM orders
WHERE customer_id = 'xxx'
ORDER BY created_at DESC;

-- 2. Criar índices apropriados
CREATE INDEX idx_orders_customer_created 
ON orders(customer_id, created_at DESC);

-- 3. Índice para queries frequentes
CREATE INDEX idx_orders_status 
ON orders(status) 
WHERE status != 'completed';
```

```typescript
// 4. Limitar dados retornados
const { data } = await supabase
  .from('orders')
  .select('id, customer_id, total, status') // ✅ Apenas campos necessários
  // .select('*') // ❌ Todos os campos
  .range(0, 9) // ✅ Paginação
  .limit(10);

// 5. Usar cache
const { data } = useQuery({
  queryKey: ['orders'],
  queryFn: fetchOrders,
  staleTime: 1000 * 60 * 5, // Cache por 5 minutos
});
```

---

#### Muitas Requisições Simultâneas

**Sintomas:**
- Erro 429 (Too Many Requests)
- Queries falhando aleatoriamente

**Causas Possíveis:**
1. Muitas queries em loop
2. Realtime subscriptions demais
3. Falta de debounce em buscas

**Soluções:**

```typescript
// 1. Usar debounce em buscas
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebouncedValue(searchTerm, 500);

const { data } = useQuery({
  queryKey: ['products', debouncedSearch],
  queryFn: () => searchProducts(debouncedSearch),
});

// 2. Combinar queries
// ❌ Evitar
const { data: users } = await supabase.from('users').select('*');
const { data: orders } = await supabase.from('orders').select('*');

// ✅ Preferir
const { data } = await supabase
  .from('users')
  .select(`
    *,
    orders(*)
  `);

// 3. Limitar subscriptions
useEffect(() => {
  const channel = supabase.channel('changes');
  // Configurar apenas 1 subscription por componente
  return () => supabase.removeChannel(channel);
}, []);
```

---

### 5. Problemas com Storage

#### Erro: "Bucket not found"

**Sintomas:**
```
Error: Bucket not found
```

**Causas Possíveis:**
1. Bucket não foi criado
2. Nome do bucket incorreto
3. Permissões incorretas

**Soluções:**

```typescript
// 1. Listar buckets existentes
const { data: buckets } = await supabase.storage.listBuckets();
console.log('Buckets:', buckets);

// 2. Criar bucket via Dashboard ou CLI
// Dashboard: Storage > New Bucket

// 3. Verificar nome do bucket
const { data, error } = await supabase.storage
  .from('produtos') // ✅ Nome correto
  // .from('produto') // ❌ Nome errado
  .upload('file.jpg', file);
```

---

#### Erro: "File size too large"

**Sintomas:**
```
Error: Payload too large
```

**Causas Possíveis:**
1. Arquivo maior que limite (50MB padrão)
2. Limite do plano atingido

**Soluções:**

```typescript
// 1. Validar tamanho antes do upload
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

if (file.size > MAX_SIZE) {
  throw new Error('Arquivo muito grande (máximo 5MB)');
}

// 2. Comprimir imagem antes do upload
async function compressImage(file: File): Promise<File> {
  // Usar biblioteca como browser-image-compression
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
  };
  return await imageCompression(file, options);
}

// 3. Upload em chunks para arquivos grandes
// (Requer implementação customizada)
```

---

### 6. Problemas com Realtime

#### Subscription Não Funciona

**Sintomas:**
- Mudanças no banco não aparecem em tempo real
- Subscription não recebe eventos

**Causas Possíveis:**
1. Realtime não habilitado na tabela
2. RLS bloqueando subscription
3. Channel não subscrito corretamente

**Soluções:**

```sql
-- 1. Habilitar Realtime na tabela
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- 2. Verificar se está habilitado
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

```typescript
// 3. Implementar subscription corretamente
const channel = supabase
  .channel('users-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'users',
    },
    (payload) => {
      console.log('Change:', payload);
    }
  )
  .subscribe((status) => {
    console.log('Subscription status:', status);
  });

// 4. Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

---

## ❓ FAQ (Perguntas Frequentes)

### Geral

**Q: Supabase é gratuito?**

A: Sim, há um plano gratuito generoso:
- 500 MB de banco de dados
- 1 GB de storage
- 2 GB de bandwidth
- 50.000 requisições/mês

Para produção, recomenda-se o plano Pro ($25/mês).

---

**Q: Posso usar Supabase com Next.js?**

A: Sim! Supabase funciona perfeitamente com Next.js, tanto no cliente quanto no servidor.

```typescript
// Cliente (browser)
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Servidor (API routes)
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Apenas no servidor!
);
```

---

**Q: Como fazer backup dos dados?**

A: Supabase faz backup automático diário. Para backup manual:

```bash
# Via CLI
supabase db dump -f backup.sql

# Via pg_dump
pg_dump "postgresql://..." > backup.sql
```

---

**Q: Posso usar Supabase offline?**

A: Não nativamente, mas você pode implementar:
1. Cache local com React Query
2. IndexedDB para persistência
3. Sincronização quando online

---

### Autenticação

**Q: Como implementar login social (Google, GitHub)?**

A: Configure no Dashboard e use:

```typescript
// Google
await supabase.auth.signInWithOAuth({
  provider: 'google',
});

// GitHub
await supabase.auth.signInWithOAuth({
  provider: 'github',
});
```

---

**Q: Como implementar "Lembrar-me"?**

A: Supabase já faz isso automaticamente com `persistSession: true`.

---

**Q: Como implementar 2FA?**

A: Use o recurso de MFA do Supabase:

```typescript
// Habilitar MFA
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp',
});

// Verificar código
await supabase.auth.mfa.verify({
  factorId: data.id,
  code: '123456',
});
```

---

### Banco de Dados

**Q: Como fazer full-text search?**

A:
```typescript
const { data } = await supabase
  .from('products')
  .select('*')
  .textSearch('name', 'apple', {
    type: 'websearch',
    config: 'english',
  });
```

---

**Q: Como fazer agregações (SUM, COUNT, AVG)?**

A:
```sql
-- Via SQL
SELECT 
  status,
  COUNT(*) as total,
  SUM(amount) as total_amount
FROM orders
GROUP BY status;
```

```typescript
// Via RPC
const { data } = await supabase.rpc('get_order_stats');
```

---

**Q: Como fazer transações?**

A: Use RPC functions para operações atômicas:

```sql
CREATE OR REPLACE FUNCTION transfer_funds(
  from_account UUID,
  to_account UUID,
  amount DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE accounts SET balance = balance - amount WHERE id = from_account;
  UPDATE accounts SET balance = balance + amount WHERE id = to_account;
END;
$$ LANGUAGE plpgsql;
```

---

### Performance

**Q: Como otimizar queries lentas?**

A:
1. Criar índices apropriados
2. Usar `select()` específico
3. Implementar paginação
4. Usar cache com React Query

---

**Q: Qual o limite de requisições?**

A:
- Free: 50.000/mês
- Pro: 5.000.000/mês
- Enterprise: Ilimitado

---

### Segurança

**Q: Como proteger dados sensíveis?**

A:
1. Usar RLS para controle de acesso
2. Nunca expor `service_role` key
3. Validar dados no cliente e servidor
4. Usar HTTPS sempre

---

**Q: Como implementar auditoria?**

A:
```sql
-- Criar tabela de logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para auditoria
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 🆘 Suporte

### Recursos de Ajuda

1. **Documentação Oficial:** https://supabase.com/docs
2. **Discord Community:** https://discord.supabase.com
3. **GitHub Discussions:** https://github.com/supabase/supabase/discussions
4. **Stack Overflow:** Tag `supabase`

### Reportar Bugs

1. Verificar se já foi reportado: https://github.com/supabase/supabase/issues
2. Criar issue com:
   - Descrição do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Versão do Supabase
   - Código de exemplo

---

**Versão:** 1.0.0  
**Última Atualização:** 2026-04-30  
**Contribuições:** Bem-vindas!
