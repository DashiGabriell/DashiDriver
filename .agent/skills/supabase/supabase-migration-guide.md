# Guia de Migração para Supabase

## 📋 Visão Geral

Este guia ajuda a migrar um projeto existente para usar Supabase, seja vindo de outro banco de dados ou adicionando Supabase a um projeto sem backend.

## 🎯 Cenários de Migração

### Cenário 1: Projeto sem Backend
Adicionar Supabase a um projeto frontend puro

### Cenário 2: Migração de Firebase
Migrar de Firebase para Supabase

### Cenário 3: Migração de API REST Própria
Substituir backend próprio por Supabase

### Cenário 4: Migração de PostgreSQL Existente
Migrar banco PostgreSQL para Supabase

## 📝 Checklist Pré-Migração

- [ ] Fazer backup completo dos dados atuais
- [ ] Documentar schema do banco atual
- [ ] Listar todas as queries e operações
- [ ] Identificar regras de negócio no backend
- [ ] Mapear autenticação atual
- [ ] Listar integrações externas
- [ ] Definir estratégia de rollback

## 🚀 Cenário 1: Projeto sem Backend

### Passo 1: Instalar Dependências

```bash
npm install @supabase/supabase-js @tanstack/react-query
```

### Passo 2: Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie novo projeto
3. Aguarde provisionamento (2-3 minutos)
4. Anote credenciais

### Passo 3: Configurar Variáveis de Ambiente

Crie `.env`:

```env
VITE_SUPABASE_URL="https://xxx.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJxxx..."
VITE_SUPABASE_PROJECT_ID="xxx"
```

### Passo 4: Criar Cliente Supabase

Crie `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
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

### Passo 5: Criar Schema do Banco

Crie `supabase/migrations/001_initial_schema.sql`:

```sql
-- Exemplo: Tabela de usuários
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver todos os perfis
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated
  USING (true);

-- Política: Usuários podem atualizar apenas seu perfil
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);
```

### Passo 6: Aplicar Migrações

```bash
supabase init
supabase db push
```

### Passo 7: Substituir Estado Local por Queries

**Antes (Estado Local):**
```typescript
const [users, setUsers] = useState([]);

useEffect(() => {
  // Dados mockados ou de localStorage
  setUsers([
    { id: 1, name: "João" },
    { id: 2, name: "Maria" }
  ]);
}, []);
```

**Depois (Supabase):**
```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const { data: users = [], isLoading } = useQuery({
  queryKey: ["users"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*");
    if (error) throw error;
    return data;
  },
});
```

## 🔥 Cenário 2: Migração de Firebase

### Passo 1: Mapear Estrutura de Dados

**Firebase (NoSQL):**
```javascript
{
  users: {
    userId1: {
      name: "João",
      email: "joao@email.com",
      posts: {
        postId1: { title: "Post 1" },
        postId2: { title: "Post 2" }
      }
    }
  }
}
```

**Supabase (SQL):**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT
);

CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT
);
```

### Passo 2: Migrar Autenticação

**Firebase:**
```javascript
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();
await signInWithEmailAndPassword(auth, email, password);
```

**Supabase:**
```typescript
import { supabase } from "@/integrations/supabase/client";

await supabase.auth.signInWithPassword({ email, password });
```

### Passo 3: Migrar Queries

**Firebase:**
```javascript
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const db = getFirestore();
const q = query(
  collection(db, "posts"),
  where("userId", "==", userId)
);
const snapshot = await getDocs(q);
const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

**Supabase:**
```typescript
const { data: posts, error } = await supabase
  .from("posts")
  .select("*")
  .eq("user_id", userId);
```

### Passo 4: Migrar Realtime

**Firebase:**
```javascript
import { onSnapshot } from "firebase/firestore";

onSnapshot(collection(db, "posts"), (snapshot) => {
  const posts = snapshot.docs.map(doc => doc.data());
  setPosts(posts);
});
```

**Supabase:**
```typescript
const channel = supabase
  .channel("posts-changes")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "posts" },
    (payload) => {
      console.log("Change:", payload);
    }
  )
  .subscribe();
```

### Passo 5: Migrar Storage

**Firebase:**
```javascript
import { getStorage, ref, uploadBytes } from "firebase/storage";

const storage = getStorage();
const storageRef = ref(storage, `images/${file.name}`);
await uploadBytes(storageRef, file);
```

**Supabase:**
```typescript
const { data, error } = await supabase.storage
  .from("images")
  .upload(`images/${file.name}`, file);
```

### Passo 6: Exportar e Importar Dados

**Exportar do Firebase:**
```javascript
// Script Node.js para exportar
const admin = require("firebase-admin");
const fs = require("fs");

admin.initializeApp();
const db = admin.firestore();

async function exportData() {
  const snapshot = await db.collection("users").get();
  const users = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
}

exportData();
```

**Importar para Supabase:**
```typescript
// Script para importar
import { supabase } from "./client";
import users from "./users.json";

async function importData() {
  const { error } = await supabase
    .from("users")
    .insert(users);
  
  if (error) console.error(error);
  else console.log("Importação concluída!");
}

importData();
```

## 🔄 Cenário 3: Migração de API REST Própria

### Passo 1: Mapear Endpoints para Tabelas

**API REST:**
```
GET    /api/products          -> SELECT * FROM products
GET    /api/products/:id      -> SELECT * FROM products WHERE id = :id
POST   /api/products          -> INSERT INTO products
PUT    /api/products/:id      -> UPDATE products WHERE id = :id
DELETE /api/products/:id      -> DELETE FROM products WHERE id = :id
```

**Supabase:**
```typescript
// GET /api/products
const { data } = await supabase.from("products").select("*");

// GET /api/products/:id
const { data } = await supabase.from("products").select("*").eq("id", id).single();

// POST /api/products
const { data } = await supabase.from("products").insert(newProduct).select().single();

// PUT /api/products/:id
const { data } = await supabase.from("products").update(updates).eq("id", id).select().single();

// DELETE /api/products/:id
const { error } = await supabase.from("products").delete().eq("id", id);
```

### Passo 2: Migrar Lógica de Negócio

**Backend (Express):**
```javascript
app.post("/api/orders", async (req, res) => {
  const { items, customerId } = req.body;
  
  // Calcular total
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Criar pedido
  const order = await db.orders.create({
    customer_id: customerId,
    total,
    status: "pending"
  });
  
  // Criar itens
  await db.orderItems.bulkCreate(
    items.map(item => ({ ...item, order_id: order.id }))
  );
  
  res.json(order);
});
```

**Supabase (Edge Function ou RPC):**

Opção 1 - Edge Function:
```typescript
// supabase/functions/create-order/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { items, customerId } = await req.json();
  
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  
  // Calcular total
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Criar pedido
  const { data: order, error } = await supabase
    .from("orders")
    .insert({ customer_id: customerId, total, status: "pending" })
    .select()
    .single();
  
  if (error) throw error;
  
  // Criar itens
  await supabase
    .from("order_items")
    .insert(items.map(item => ({ ...item, order_id: order.id })));
  
  return new Response(JSON.stringify(order), {
    headers: { "Content-Type": "application/json" },
  });
});
```

Opção 2 - RPC Function:
```sql
-- Criar função no banco
CREATE OR REPLACE FUNCTION create_order(
  p_customer_id UUID,
  p_items JSONB
)
RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_total DECIMAL;
  v_item JSONB;
BEGIN
  -- Calcular total
  SELECT SUM((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER)
  INTO v_total
  FROM jsonb_array_elements(p_items) AS item;
  
  -- Criar pedido
  INSERT INTO orders (customer_id, total, status)
  VALUES (p_customer_id, v_total, 'pending')
  RETURNING id INTO v_order_id;
  
  -- Criar itens
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price')::DECIMAL
    );
  END LOOP;
  
  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;
```

```typescript
// Chamar do frontend
const { data: orderId, error } = await supabase.rpc("create_order", {
  p_customer_id: customerId,
  p_items: items,
});
```

### Passo 3: Migrar Autenticação

**Backend (JWT):**
```javascript
const jwt = require("jsonwebtoken");

// Middleware de autenticação
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Não autorizado" });
  }
}
```

**Supabase:**
```typescript
// Autenticação é automática
// Supabase gerencia tokens JWT automaticamente
// RLS garante segurança no nível do banco

// Apenas verificar se usuário está autenticado
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  throw new Error("Não autorizado");
}
```

## 🗄️ Cenário 4: Migração de PostgreSQL Existente

### Passo 1: Exportar Schema

```bash
# Exportar schema do banco atual
pg_dump -h localhost -U usuario -d banco --schema-only > schema.sql

# Exportar dados
pg_dump -h localhost -U usuario -d banco --data-only > data.sql
```

### Passo 2: Adaptar Schema para Supabase

```sql
-- Remover comandos incompatíveis
-- Adicionar suporte a RLS
-- Ajustar tipos de dados se necessário

-- Exemplo de adaptação
-- ANTES:
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100)
);

-- DEPOIS:
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select" ON users
  FOR SELECT TO authenticated
  USING (true);
```

### Passo 3: Importar para Supabase

```bash
# Via Supabase CLI
supabase db push

# Ou via SQL Editor no Dashboard
# Cole o conteúdo de schema.sql
```

### Passo 4: Importar Dados

```bash
# Conectar ao banco Supabase
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"

# Importar dados
\i data.sql
```

### Passo 5: Atualizar Conexões no Código

**Antes (pg):**
```typescript
import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  database: "mydb",
  user: "user",
  password: "password",
});

const result = await pool.query("SELECT * FROM users");
```

**Depois (Supabase):**
```typescript
import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase
  .from("users")
  .select("*");
```

## 🔄 Estratégia de Migração Gradual

### Fase 1: Preparação (1-2 semanas)
- [ ] Configurar Supabase em paralelo
- [ ] Criar schema no Supabase
- [ ] Configurar RLS
- [ ] Testar queries básicas

### Fase 2: Migração de Leitura (1-2 semanas)
- [ ] Migrar queries SELECT para Supabase
- [ ] Manter escritas no sistema antigo
- [ ] Sincronizar dados periodicamente
- [ ] Monitorar performance

### Fase 3: Migração de Escrita (2-3 semanas)
- [ ] Migrar operações INSERT/UPDATE/DELETE
- [ ] Implementar validações
- [ ] Testar transações
- [ ] Validar integridade dos dados

### Fase 4: Desativação do Sistema Antigo (1 semana)
- [ ] Redirecionar 100% do tráfego para Supabase
- [ ] Monitorar erros
- [ ] Manter backup do sistema antigo
- [ ] Documentar mudanças

## 🧪 Testes Pós-Migração

### Checklist de Testes

- [ ] Autenticação funciona corretamente
- [ ] Todas as queries retornam dados esperados
- [ ] RLS está bloqueando acessos não autorizados
- [ ] Realtime está funcionando
- [ ] Storage está acessível
- [ ] Performance está adequada
- [ ] Backup automático está configurado

### Script de Validação

```typescript
async function validateMigration() {
  console.log("Iniciando validação...");
  
  // Teste 1: Autenticação
  const { data: { user } } = await supabase.auth.getUser();
  console.log("✓ Autenticação:", user ? "OK" : "FALHOU");
  
  // Teste 2: Leitura de dados
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("*")
    .limit(1);
  console.log("✓ Leitura:", !usersError ? "OK" : "FALHOU");
  
  // Teste 3: Escrita de dados
  const { error: insertError } = await supabase
    .from("test_table")
    .insert({ name: "Test" });
  console.log("✓ Escrita:", !insertError ? "OK" : "FALHOU");
  
  // Teste 4: RLS
  await supabase.auth.signOut();
  const { error: rlsError } = await supabase
    .from("users")
    .select("*");
  console.log("✓ RLS:", rlsError ? "OK" : "FALHOU");
  
  console.log("Validação concluída!");
}
```

## 🚨 Rollback Plan

### Se algo der errado:

1. **Manter sistema antigo ativo** durante migração
2. **Ter backup completo** antes de iniciar
3. **Documentar todas as mudanças** para reverter
4. **Monitorar logs** constantemente
5. **Ter plano B** para cada fase

### Script de Rollback

```bash
#!/bin/bash

echo "Iniciando rollback..."

# 1. Redirecionar tráfego para sistema antigo
# 2. Restaurar variáveis de ambiente antigas
# 3. Reverter mudanças no código
# 4. Notificar equipe

echo "Rollback concluído!"
```

## 📊 Monitoramento Pós-Migração

### Métricas para Acompanhar

- **Performance:** Tempo de resposta das queries
- **Erros:** Taxa de erros nas operações
- **Uso:** Número de requisições por minuto
- **Custo:** Uso de recursos do Supabase
- **Disponibilidade:** Uptime do serviço

### Ferramentas

- Supabase Dashboard (métricas nativas)
- Sentry (monitoramento de erros)
- DataDog / New Relic (APM)
- Custom logging

---

**Versão:** 1.0.0  
**Última Atualização:** 2026-04-30  
**Tempo Estimado de Migração:** 4-8 semanas (dependendo da complexidade)
