# Supabase - Referência Rápida

## 🚀 Setup Inicial

```bash
# Instalar dependências
npm install @supabase/supabase-js @tanstack/react-query

# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Gerar tipos TypeScript
npx supabase gen types typescript --project-id PROJECT_ID > src/integrations/supabase/types.ts
```

## 📁 Estrutura de Arquivos

```
src/
├── integrations/supabase/
│   ├── client.ts          # Cliente Supabase
│   └── types.ts           # Tipos do banco
├── lib/
│   └── auth.ts            # Gerenciamento de sessão
└── hooks/
    └── useAuth.tsx        # Hook de autenticação
```

## 🔧 Configuração

### .env

```env
VITE_SUPABASE_URL="https://xxx.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJxxx..."
VITE_SUPABASE_PROJECT_ID="xxx"
```

### client.ts

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
```

## 🔐 Autenticação

```typescript
// Login
await supabase.auth.signInWithPassword({ email, password });

// Registro
await supabase.auth.signUp({ email, password });

// Logout
await supabase.auth.signOut();

// Usuário atual
const { data: { user } } = await supabase.auth.getUser();

// Sessão atual
const { data: { session } } = await supabase.auth.getSession();

// Listener de mudanças
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session);
});
```

## 📊 CRUD Operations

### SELECT

```typescript
// Todos
await supabase.from("table").select("*");

// Com filtros
await supabase.from("table").select("*")
  .eq("column", value)
  .gte("price", 10)
  .order("name", { ascending: true });

// Com relacionamentos
await supabase.from("orders").select(`
  *,
  customers(name, email),
  products(name, price)
`);

// Único registro
await supabase.from("table").select("*")
  .eq("id", id)
  .single();

// Com paginação
await supabase.from("table").select("*", { count: "exact" })
  .range(0, 9);
```

### INSERT

```typescript
// Único
await supabase.from("table").insert({ name: "Item" })
  .select()
  .single();

// Múltiplos
await supabase.from("table").insert([
  { name: "Item 1" },
  { name: "Item 2" }
]).select();
```

### UPDATE

```typescript
// Por ID
await supabase.from("table").update({ name: "New Name" })
  .eq("id", id)
  .select()
  .single();

// Múltiplos
await supabase.from("table").update({ active: false })
  .eq("status", "inactive")
  .select();

// Upsert
await supabase.from("table").upsert({ id, name: "Item" })
  .select()
  .single();
```

### DELETE

```typescript
// Por ID
await supabase.from("table").delete()
  .eq("id", id);

// Com filtros
await supabase.from("table").delete()
  .eq("active", false);
```

## 🔍 Filtros

```typescript
// Igualdade
.eq("column", value)

// Diferente
.neq("column", value)

// Maior que
.gt("column", value)

// Maior ou igual
.gte("column", value)

// Menor que
.lt("column", value)

// Menor ou igual
.lte("column", value)

// Like (case-sensitive)
.like("column", "%pattern%")

// iLike (case-insensitive)
.ilike("column", "%pattern%")

// In
.in("column", [value1, value2])

// Is null
.is("column", null)

// Not null
.not("column", "is", null)

// OR
.or("column1.eq.value1,column2.eq.value2")

// AND (padrão ao encadear)
.eq("column1", value1).eq("column2", value2)
```

## 📁 Storage

```typescript
// Upload
const { data, error } = await supabase.storage
  .from("bucket")
  .upload("path/file.jpg", file);

// Download
const { data, error } = await supabase.storage
  .from("bucket")
  .download("path/file.jpg");

// URL pública
const { data } = supabase.storage
  .from("bucket")
  .getPublicUrl("path/file.jpg");

// Deletar
await supabase.storage
  .from("bucket")
  .remove(["path/file.jpg"]);

// Listar
const { data, error } = await supabase.storage
  .from("bucket")
  .list("path");
```

## 🔔 Realtime

```typescript
const channel = supabase
  .channel("table-changes")
  .on(
    "postgres_changes",
    {
      event: "*", // INSERT, UPDATE, DELETE
      schema: "public",
      table: "table_name",
    },
    (payload) => {
      console.log("Change:", payload);
    }
  )
  .subscribe();

// Cleanup
supabase.removeChannel(channel);
```

## 🎣 React Hooks

### useQuery (Listar)

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const { data, isLoading, error } = useQuery({
  queryKey: ["items"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("items")
      .select("*");
    if (error) throw error;
    return data;
  },
});
```

### useMutation (Criar/Atualizar/Deletar)

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: async (newItem) => {
    const { data, error } = await supabase
      .from("items")
      .insert(newItem)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
  },
});

// Uso
mutation.mutate({ name: "New Item" });
```

## 🛡️ Row Level Security (RLS)

```sql
-- Habilitar RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Política de leitura
CREATE POLICY "policy_name"
  ON table_name
  FOR SELECT
  TO authenticated
  USING (true);

-- Política de inserção
CREATE POLICY "policy_name"
  ON table_name
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política de atualização
CREATE POLICY "policy_name"
  ON table_name
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política de deleção
CREATE POLICY "policy_name"
  ON table_name
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

## 🔧 Supabase CLI

```bash
# Inicializar projeto
supabase init

# Iniciar local
supabase start

# Parar local
supabase stop

# Status
supabase status

# Criar migração
supabase migration new migration_name

# Aplicar migrações (remoto)
supabase db push

# Baixar schema (remoto)
supabase db pull

# Resetar banco local
supabase db reset

# Gerar tipos
npx supabase gen types typescript --project-id ID > src/integrations/supabase/types.ts
```

## 🐛 Troubleshooting

### Erro: "Invalid API key"
- Verificar `.env`
- Usar chave `anon/public`, não `service_role`
- Reiniciar servidor dev

### Erro: "RLS policy violation"
- Verificar autenticação
- Revisar políticas RLS
- Testar no SQL Editor

### Erro: "Table doesn't exist"
- Executar migrações: `supabase db push`
- Verificar nome da tabela

### Erro: "Session expired"
- Configurar `autoRefreshToken: true`
- Implementar `onAuthStateChange`

## 📚 Links Úteis

- [Documentação](https://supabase.com/docs)
- [Auth Docs](https://supabase.com/docs/guides/auth)
- [Database Docs](https://supabase.com/docs/guides/database)
- [Storage Docs](https://supabase.com/docs/guides/storage)
- [Realtime Docs](https://supabase.com/docs/guides/realtime)
- [CLI Docs](https://supabase.com/docs/guides/cli)

---

**Versão:** 1.0.0
