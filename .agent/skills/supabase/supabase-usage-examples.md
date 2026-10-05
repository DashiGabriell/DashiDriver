# Exemplos Práticos de Uso do Supabase

## 📋 Visão Geral

Este documento complementa a skill `supabase-connection-setup.md` com exemplos práticos e padrões de uso testados em produção.

## 🔐 Autenticação

### Login com Email e Senha

```typescript
import { supabase } from "@/integrations/supabase/client";

async function handleLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Erro no login:", error.message);
    return { success: false, error };
  }

  console.log("Login bem-sucedido:", data.user);
  return { success: true, user: data.user };
}
```

### Registro de Novo Usuário

```typescript
async function handleSignUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        display_name: "Nome do Usuário",
      },
    },
  });

  if (error) {
    console.error("Erro no registro:", error.message);
    return { success: false, error };
  }

  return { success: true, user: data.user };
}
```

### Logout

```typescript
async function handleLogout() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("Erro no logout:", error.message);
    return { success: false, error };
  }

  return { success: true };
}
```

### Verificar Usuário Atual

```typescript
import { getSessionOnce, getUserOnce } from "@/lib/auth";

async function getCurrentUser() {
  const user = await getUserOnce();
  
  if (!user) {
    console.log("Usuário não autenticado");
    return null;
  }

  console.log("Usuário atual:", user);
  return user;
}
```

### Resetar Senha

```typescript
async function handlePasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    console.error("Erro ao enviar email:", error.message);
    return { success: false, error };
  }

  return { success: true };
}
```

## 📊 Operações CRUD

### SELECT - Buscar Dados

#### Buscar Todos os Registros

```typescript
const { data, error } = await supabase
  .from("produtos")
  .select("*");

if (error) throw error;
console.log("Produtos:", data);
```

#### Buscar com Filtros

```typescript
const { data, error } = await supabase
  .from("produtos")
  .select("*")
  .eq("ativo", true)
  .gte("preco_venda", 10)
  .order("nome", { ascending: true });

if (error) throw error;
console.log("Produtos filtrados:", data);
```

#### Buscar com Relacionamentos (JOIN)

```typescript
const { data, error } = await supabase
  .from("pedidos")
  .select(`
    *,
    clientes(
      nome,
      email,
      telefone
    ),
    transportadoras(
      razao_social,
      taxa_entrega
    )
  `)
  .order("data_pedido", { ascending: false });

if (error) throw error;
console.log("Pedidos com relacionamentos:", data);
```

#### Buscar com Paginação

```typescript
const pageSize = 10;
const page = 0;

const { data, error, count } = await supabase
  .from("produtos")
  .select("*", { count: "exact" })
  .range(page * pageSize, (page + 1) * pageSize - 1)
  .order("nome", { ascending: true });

if (error) throw error;
console.log(`Produtos (página ${page + 1}):`, data);
console.log(`Total de registros:`, count);
```

#### Buscar Registro Único

```typescript
const { data, error } = await supabase
  .from("produtos")
  .select("*")
  .eq("id", "uuid-do-produto")
  .single();

if (error) throw error;
console.log("Produto:", data);
```

### INSERT - Inserir Dados

#### Inserir Registro Único

```typescript
const { data, error } = await supabase
  .from("produtos")
  .insert({
    nome: "Maçã Fuji",
    preco_venda: 8.50,
    estoque_atual: 100,
    ativo: true,
  })
  .select()
  .single();

if (error) throw error;
console.log("Produto criado:", data);
```

#### Inserir Múltiplos Registros

```typescript
const { data, error } = await supabase
  .from("produtos")
  .insert([
    { nome: "Banana Prata", preco_venda: 5.00 },
    { nome: "Laranja Lima", preco_venda: 6.50 },
    { nome: "Mamão Papaya", preco_venda: 7.00 },
  ])
  .select();

if (error) throw error;
console.log("Produtos criados:", data);
```

### UPDATE - Atualizar Dados

#### Atualizar por ID

```typescript
const { data, error } = await supabase
  .from("produtos")
  .update({
    preco_venda: 9.00,
    estoque_atual: 150,
  })
  .eq("id", "uuid-do-produto")
  .select()
  .single();

if (error) throw error;
console.log("Produto atualizado:", data);
```

#### Atualizar Múltiplos Registros

```typescript
const { data, error } = await supabase
  .from("produtos")
  .update({ ativo: false })
  .eq("estoque_atual", 0)
  .select();

if (error) throw error;
console.log("Produtos desativados:", data);
```

#### Upsert (Insert ou Update)

```typescript
const { data, error } = await supabase
  .from("produtos")
  .upsert({
    id: "uuid-existente-ou-novo",
    nome: "Produto",
    preco_venda: 10.00,
  })
  .select()
  .single();

if (error) throw error;
console.log("Produto upserted:", data);
```

### DELETE - Deletar Dados

#### Deletar por ID

```typescript
const { error } = await supabase
  .from("produtos")
  .delete()
  .eq("id", "uuid-do-produto");

if (error) throw error;
console.log("Produto deletado com sucesso");
```

#### Deletar com Filtros

```typescript
const { error } = await supabase
  .from("produtos")
  .delete()
  .eq("ativo", false)
  .lt("estoque_atual", 1);

if (error) throw error;
console.log("Produtos inativos deletados");
```

## 🔄 Hooks React Customizados

### Hook para Listar Dados

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getSessionOnce } from "@/lib/auth";

export function useProdutos() {
  return useQuery({
    queryKey: ["produtos"],
    queryFn: async () => {
      const session = await getSessionOnce();
      if (!session) throw new Error("Não autenticado");

      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("ativo", true)
        .order("nome", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// Uso no componente
function ProdutosPage() {
  const { data: produtos, isLoading, error } = useProdutos();

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return (
    <div>
      {produtos?.map((produto) => (
        <div key={produto.id}>{produto.nome}</div>
      ))}
    </div>
  );
}
```

### Hook para Criar Dados

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCreateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (novoProduto: any) => {
      const { data, error } = await supabase
        .from("produtos")
        .insert(novoProduto)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalida cache para recarregar lista
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
}

// Uso no componente
function CreateProdutoForm() {
  const createProduto = useCreateProduto();

  const handleSubmit = async (formData: any) => {
    try {
      await createProduto.mutateAsync(formData);
      alert("Produto criado com sucesso!");
    } catch (error) {
      alert("Erro ao criar produto");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos do formulário */}
      <button type="submit" disabled={createProduto.isPending}>
        {createProduto.isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
```

### Hook Completo com CRUD

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getSessionOnce } from "@/lib/auth";

export function useProdutos() {
  const queryClient = useQueryClient();

  // Listar
  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ["produtos"],
    queryFn: async () => {
      const session = await getSessionOnce();
      if (!session) throw new Error("Não autenticado");

      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Criar
  const createMutation = useMutation({
    mutationFn: async (novoProduto: any) => {
      const { data, error } = await supabase
        .from("produtos")
        .insert(novoProduto)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
    },
  });

  // Atualizar
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("produtos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
    },
  });

  // Deletar
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("produtos")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
    },
  });

  return {
    produtos,
    isLoading,
    createProduto: createMutation.mutate,
    updateProduto: updateMutation.mutate,
    deleteProduto: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
```

## 🔔 Realtime Subscriptions

### Escutar Mudanças em Tempo Real

```typescript
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function useProdutosRealtime() {
  const [produtos, setProdutos] = useState<any[]>([]);

  useEffect(() => {
    // Buscar dados iniciais
    const fetchProdutos = async () => {
      const { data } = await supabase
        .from("produtos")
        .select("*")
        .order("nome", { ascending: true });

      if (data) setProdutos(data);
    };

    fetchProdutos();

    // Configurar subscription
    const channel = supabase
      .channel("produtos-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "produtos",
        },
        (payload) => {
          console.log("Mudança detectada:", payload);

          if (payload.eventType === "INSERT") {
            setProdutos((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setProdutos((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new : p))
            );
          } else if (payload.eventType === "DELETE") {
            setProdutos((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return produtos;
}
```

## 📁 Storage (Upload de Arquivos)

### Upload de Imagem

```typescript
async function uploadImage(file: File, bucket: string = "produtos") {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) throw error;

  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return { path: filePath, url: publicUrl };
}

// Uso no componente
function ImageUpload() {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { url } = await uploadImage(file);
      console.log("Imagem enviada:", url);
      // Salvar URL no banco de dados
    } catch (error) {
      console.error("Erro no upload:", error);
    }
  };

  return <input type="file" accept="image/*" onChange={handleFileChange} />;
}
```

### Deletar Arquivo

```typescript
async function deleteFile(filePath: string, bucket: string = "produtos") {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) throw error;
  console.log("Arquivo deletado com sucesso");
}
```

### Listar Arquivos

```typescript
async function listFiles(bucket: string = "produtos") {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list();

  if (error) throw error;
  return data;
}
```

## 🔍 Queries Avançadas

### Full Text Search

```typescript
const { data, error } = await supabase
  .from("produtos")
  .select("*")
  .textSearch("nome", "maçã", {
    type: "websearch",
    config: "portuguese",
  });
```

### Agregações

```typescript
const { data, error } = await supabase
  .from("pedidos")
  .select("valor_total.sum(), status")
  .eq("status", "delivered");
```

### Filtros Complexos

```typescript
const { data, error } = await supabase
  .from("produtos")
  .select("*")
  .or("estoque_atual.lt.10,ativo.eq.false")
  .order("estoque_atual", { ascending: true });
```

## 🛡️ Tratamento de Erros

### Padrão Recomendado

```typescript
async function fetchProdutos() {
  try {
    const { data, error } = await supabase
      .from("produtos")
      .select("*");

    if (error) {
      // Erro do Supabase
      console.error("Erro do Supabase:", error.message);
      throw new Error(`Falha ao buscar produtos: ${error.message}`);
    }

    return data;
  } catch (error) {
    // Erro de rede ou outro
    console.error("Erro inesperado:", error);
    throw error;
  }
}
```

### Com React Query

```typescript
const { data, error, isError } = useQuery({
  queryKey: ["produtos"],
  queryFn: fetchProdutos,
  retry: 1,
  onError: (error) => {
    console.error("Erro na query:", error);
    // Mostrar toast de erro
  },
});

if (isError) {
  return <div>Erro ao carregar produtos: {error.message}</div>;
}
```

## 📊 Transações

### Múltiplas Operações

```typescript
async function criarPedidoCompleto(pedidoData: any, itens: any[]) {
  // Criar pedido
  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos")
    .insert(pedidoData)
    .select()
    .single();

  if (pedidoError) throw pedidoError;

  // Criar itens do pedido
  const itensComPedidoId = itens.map((item) => ({
    ...item,
    pedido_id: pedido.id,
  }));

  const { error: itensError } = await supabase
    .from("itens_pedido")
    .insert(itensComPedidoId);

  if (itensError) {
    // Rollback: deletar pedido criado
    await supabase.from("pedidos").delete().eq("id", pedido.id);
    throw itensError;
  }

  return pedido;
}
```

## 🎯 Boas Práticas

### 1. Sempre Verificar Autenticação

```typescript
const session = await getSessionOnce();
if (!session) {
  throw new Error("Usuário não autenticado");
}
```

### 2. Usar Select Específico

```typescript
// ❌ Evitar
.select("*")

// ✅ Preferir
.select("id, nome, preco_venda, estoque_atual")
```

### 3. Implementar Paginação

```typescript
// Para listas grandes
.range(start, end)
```

### 4. Invalidar Cache Após Mutations

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["produtos"] });
}
```

### 5. Tratar Erros Adequadamente

```typescript
if (error) {
  console.error("Erro:", error);
  // Mostrar mensagem ao usuário
  throw error;
}
```

---

**Versão:** 1.0.0  
**Última Atualização:** 2026-04-30
