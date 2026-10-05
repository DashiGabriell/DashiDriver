# Padrões Avançados de Supabase

## 📋 Visão Geral

Este documento apresenta padrões avançados e casos de uso específicos baseados em implementações reais do projeto AgroFruta Insights.

## 🔄 Padrões de Relacionamentos

### 1. One-to-Many com Dados Aninhados

**Cenário:** Buscar pedidos com informações do cliente e transportadora

```typescript
const { data, error } = await supabase
  .from("agrofruta_pedidos")
  .select(`
    *,
    agrofruta_clientes!agrofruta_pedidos_cliente_id_fkey(
      nome,
      email,
      telefone,
      endereco,
      cidade,
      estado
    ),
    agrofruta_transportadoras!agrofruta_pedidos_transportadora_id_fkey(
      razao_social,
      taxa_entrega
    )
  `)
  .order("data_pedido", { ascending: false });
```

**Resultado:**
```typescript
[
  {
    id: "uuid",
    numero_pedido: "PED-2026-000001",
    valor_total: 150.00,
    agrofruta_clientes: {
      nome: "João Silva",
      email: "joao@email.com",
      telefone: "(11) 98765-4321"
    },
    agrofruta_transportadoras: {
      razao_social: "Transportadora XYZ",
      taxa_entrega: 25.00
    }
  }
]
```

### 2. Many-to-Many com Tabela Intermediária

**Cenário:** Buscar pedido com seus itens e informações dos produtos

```typescript
const { data, error } = await supabase
  .from("agrofruta_pedidos")
  .select(`
    *,
    agrofruta_itens_pedido(
      id,
      quantidade,
      preco_unitario,
      desconto,
      valor_total,
      agrofruta_produtos(
        nome,
        codigo_sku,
        unidade_medida
      )
    )
  `)
  .eq("id", pedidoId)
  .single();
```

**Resultado:**
```typescript
{
  id: "uuid",
  numero_pedido: "PED-2026-000001",
  valor_total: 150.00,
  agrofruta_itens_pedido: [
    {
      id: "uuid",
      quantidade: 10,
      preco_unitario: 8.50,
      desconto: 0,
      valor_total: 85.00,
      agrofruta_produtos: {
        nome: "Maçã Fuji",
        codigo_sku: "MAC-001",
        unidade_medida: "kg"
      }
    }
  ]
}
```

### 3. Relacionamento com Filtros

**Cenário:** Buscar apenas itens de pedidos entregues

```typescript
const { data, error } = await supabase
  .from("agrofruta_itens_pedido")
  .select(`
    *,
    agrofruta_pedidos!inner(
      numero_pedido,
      status,
      data_entrega
    ),
    agrofruta_produtos(
      nome,
      preco_venda
    )
  `)
  .eq("agrofruta_pedidos.status", "delivered")
  .gte("agrofruta_pedidos.data_entrega", "2026-01-01");
```

## 🎯 Padrões de Hooks Avançados

### 1. Hook com Paginação Infinita

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePedidosInfinite(clienteId: string) {
  const pageSize = 10;

  return useInfiniteQuery({
    queryKey: ["pedidos-infinite", clienteId],
    queryFn: async ({ pageParam = 0 }) => {
      const start = pageParam * pageSize;
      const end = start + pageSize - 1;

      const { data, error, count } = await supabase
        .from("agrofruta_pedidos")
        .select("*", { count: "exact" })
        .eq("cliente_id", clienteId)
        .range(start, end)
        .order("data_pedido", { ascending: false });

      if (error) throw error;

      return {
        data,
        nextPage: data.length === pageSize ? pageParam + 1 : undefined,
        totalCount: count,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}

// Uso no componente
function PedidosList({ clienteId }: { clienteId: string }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePedidosInfinite(clienteId);

  return (
    <div>
      {data?.pages.map((page) =>
        page.data.map((pedido) => (
          <div key={pedido.id}>{pedido.numero_pedido}</div>
        ))
      )}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
        </button>
      )}
    </div>
  );
}
```

### 2. Hook com Busca e Filtros Dinâmicos

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export function useProdutosComFiltros() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [apenasAtivos, setApenasAtivos] = useState(true);

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ["produtos", searchTerm, categoriaId, apenasAtivos],
    queryFn: async () => {
      let query = supabase
        .from("agrofruta_produtos")
        .select("*");

      // Filtro de busca
      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,codigo_sku.ilike.%${searchTerm}%`);
      }

      // Filtro de categoria
      if (categoriaId) {
        query = query.eq("categoria_id", categoriaId);
      }

      // Filtro de ativos
      if (apenasAtivos) {
        query = query.eq("ativo", true);
      }

      const { data, error } = await query.order("nome", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return {
    produtos,
    isLoading,
    searchTerm,
    setSearchTerm,
    categoriaId,
    setCategoriaId,
    apenasAtivos,
    setApenasAtivos,
  };
}
```

### 3. Hook com Agregações e Estatísticas

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDashboardStats(dataInicio: string, dataFim: string) {
  return useQuery({
    queryKey: ["dashboard-stats", dataInicio, dataFim],
    queryFn: async () => {
      // Total de pedidos
      const { count: totalPedidos } = await supabase
        .from("agrofruta_pedidos")
        .select("*", { count: "exact", head: true })
        .gte("data_pedido", dataInicio)
        .lte("data_pedido", dataFim);

      // Valor total de vendas
      const { data: vendas } = await supabase
        .from("agrofruta_pedidos")
        .select("valor_total")
        .gte("data_pedido", dataInicio)
        .lte("data_pedido", dataFim)
        .eq("status", "delivered");

      const totalVendas = vendas?.reduce((sum, p) => sum + p.valor_total, 0) || 0;

      // Pedidos por status
      const { data: pedidosPorStatus } = await supabase
        .from("agrofruta_pedidos")
        .select("status")
        .gte("data_pedido", dataInicio)
        .lte("data_pedido", dataFim);

      const statusCount = pedidosPorStatus?.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalPedidos: totalPedidos || 0,
        totalVendas,
        pedidosPorStatus: statusCount || {},
      };
    },
  });
}
```

## 🔐 Padrões de RLS Avançados

### 1. Política Baseada em Papel do Usuário

```sql
-- Criar função para verificar papel
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'role',
    'user'
  )::TEXT;
$$ LANGUAGE SQL STABLE;

-- Política: Admin vê tudo, usuário vê apenas seus dados
CREATE POLICY "role_based_select_pedidos"
  ON agrofruta_pedidos
  FOR SELECT
  TO authenticated
  USING (
    auth.user_role() = 'admin'
    OR criado_por = auth.uid()
  );
```

### 2. Política com Relacionamento

```sql
-- Usuário pode ver pedidos dos seus clientes
CREATE POLICY "user_can_view_own_customer_orders"
  ON agrofruta_pedidos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agrofruta_clientes
      WHERE agrofruta_clientes.id = agrofruta_pedidos.cliente_id
      AND agrofruta_clientes.criado_por = auth.uid()
    )
  );
```

### 3. Política com Janela de Tempo

```sql
-- Usuário pode editar pedidos apenas nas últimas 24 horas
CREATE POLICY "edit_recent_orders_only"
  ON agrofruta_pedidos
  FOR UPDATE
  TO authenticated
  USING (
    criado_por = auth.uid()
    AND criado_em > NOW() - INTERVAL '24 hours'
  )
  WITH CHECK (
    criado_por = auth.uid()
  );
```

## 🔄 Padrões de Transações Complexas

### 1. Criar Pedido com Itens e Atualizar Estoque

```typescript
async function criarPedidoCompleto(
  pedidoData: any,
  itens: any[]
) {
  // 1. Criar pedido
  const { data: pedido, error: pedidoError } = await supabase
    .from("agrofruta_pedidos")
    .insert(pedidoData)
    .select()
    .single();

  if (pedidoError) throw pedidoError;

  try {
    // 2. Criar itens do pedido
    const itensComPedidoId = itens.map((item) => ({
      ...item,
      pedido_id: pedido.id,
    }));

    const { error: itensError } = await supabase
      .from("agrofruta_itens_pedido")
      .insert(itensComPedidoId);

    if (itensError) throw itensError;

    // 3. Atualizar estoque dos produtos
    for (const item of itens) {
      const { error: estoqueError } = await supabase.rpc(
        "atualizar_estoque_produto",
        {
          produto_id: item.produto_id,
          quantidade: -item.quantidade,
        }
      );

      if (estoqueError) throw estoqueError;
    }

    return pedido;
  } catch (error) {
    // Rollback: deletar pedido criado
    await supabase
      .from("agrofruta_pedidos")
      .delete()
      .eq("id", pedido.id);

    throw error;
  }
}
```

### 2. Função RPC para Operações Atômicas

```sql
-- Criar função para atualizar estoque atomicamente
CREATE OR REPLACE FUNCTION atualizar_estoque_produto(
  produto_id UUID,
  quantidade INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE agrofruta_produtos
  SET estoque_atual = estoque_atual + quantidade,
      atualizado_em = NOW()
  WHERE id = produto_id;

  -- Verificar se estoque ficou negativo
  IF (SELECT estoque_atual FROM agrofruta_produtos WHERE id = produto_id) < 0 THEN
    RAISE EXCEPTION 'Estoque insuficiente para o produto %', produto_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

```typescript
// Uso no TypeScript
const { error } = await supabase.rpc("atualizar_estoque_produto", {
  produto_id: "uuid-do-produto",
  quantidade: -10, // Negativo para reduzir estoque
});
```

## 📊 Padrões de Queries Otimizadas

### 1. Query com Contagem Eficiente

```typescript
// ❌ Evitar: Buscar todos os dados para contar
const { data } = await supabase.from("pedidos").select("*");
const total = data?.length || 0;

// ✅ Preferir: Usar count
const { count } = await supabase
  .from("pedidos")
  .select("*", { count: "exact", head: true });
```

### 2. Query com Select Específico

```typescript
// ❌ Evitar: Buscar todos os campos
const { data } = await supabase
  .from("produtos")
  .select("*");

// ✅ Preferir: Buscar apenas campos necessários
const { data } = await supabase
  .from("produtos")
  .select("id, nome, preco_venda, estoque_atual");
```

### 3. Query com Índices

```sql
-- Criar índices para queries frequentes
CREATE INDEX idx_pedidos_cliente_data 
  ON agrofruta_pedidos(cliente_id, data_pedido DESC);

CREATE INDEX idx_produtos_categoria_ativo 
  ON agrofruta_produtos(categoria_id, ativo) 
  WHERE ativo = true;

CREATE INDEX idx_pagamentos_status_vencimento 
  ON agrofruta_pagamentos(status, data_vencimento) 
  WHERE status = 'pending';
```

## 🔔 Padrões de Realtime Avançados

### 1. Realtime com Filtros

```typescript
const channel = supabase
  .channel("pedidos-cliente")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "agrofruta_pedidos",
      filter: `cliente_id=eq.${clienteId}`,
    },
    (payload) => {
      console.log("Mudança no pedido:", payload);
    }
  )
  .subscribe();
```

### 2. Realtime com Múltiplas Tabelas

```typescript
const channel = supabase
  .channel("pedidos-e-pagamentos")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "agrofruta_pedidos",
    },
    (payload) => {
      console.log("Mudança em pedido:", payload);
    }
  )
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "agrofruta_pagamentos",
    },
    (payload) => {
      console.log("Mudança em pagamento:", payload);
    }
  )
  .subscribe();
```

### 3. Realtime com React Query

```typescript
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function usePedidosRealtime() {
  const queryClient = useQueryClient();

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ["pedidos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agrofruta_pedidos")
        .select("*")
        .order("data_pedido", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("pedidos-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agrofruta_pedidos",
        },
        () => {
          // Invalidar cache para recarregar dados
          queryClient.invalidateQueries({ queryKey: ["pedidos"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { pedidos, isLoading };
}
```

## 📁 Padrões de Storage Avançados

### 1. Upload com Validação e Resize

```typescript
async function uploadImagemProduto(file: File, produtoId: string) {
  // Validar tipo de arquivo
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Tipo de arquivo não permitido");
  }

  // Validar tamanho (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("Arquivo muito grande (máximo 5MB)");
  }

  // Gerar nome único
  const fileExt = file.name.split(".").pop();
  const fileName = `${produtoId}-${Date.now()}.${fileExt}`;
  const filePath = `produtos/${fileName}`;

  // Upload
  const { error: uploadError } = await supabase.storage
    .from("produtos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from("produtos")
    .getPublicUrl(filePath);

  // Atualizar produto com URL da imagem
  const { error: updateError } = await supabase
    .from("agrofruta_produtos")
    .update({ imagem_url: publicUrl })
    .eq("id", produtoId);

  if (updateError) throw updateError;

  return { url: publicUrl, path: filePath };
}
```

### 2. Upload Múltiplo com Progress

```typescript
async function uploadMultiplosArquivos(
  files: File[],
  onProgress?: (progress: number) => void
) {
  const uploads = [];
  let completed = 0;

  for (const file of files) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const upload = supabase.storage
      .from("arquivos")
      .upload(filePath, file)
      .then((result) => {
        completed++;
        if (onProgress) {
          onProgress((completed / files.length) * 100);
        }
        return result;
      });

    uploads.push(upload);
  }

  const results = await Promise.all(uploads);
  return results;
}

// Uso
const handleUpload = async (files: File[]) => {
  await uploadMultiplosArquivos(files, (progress) => {
    console.log(`Progresso: ${progress.toFixed(0)}%`);
  });
};
```

## 🎯 Padrões de Validação

### 1. Validação no Cliente com Zod

```typescript
import { z } from "zod";

const produtoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  preco_venda: z.number().positive("Preço deve ser positivo"),
  estoque_atual: z.number().int().min(0, "Estoque não pode ser negativo"),
  categoria_id: z.string().uuid("Categoria inválida"),
  ativo: z.boolean().default(true),
});

type ProdutoFormData = z.infer<typeof produtoSchema>;

// Uso no formulário
async function handleSubmit(formData: unknown) {
  try {
    const validData = produtoSchema.parse(formData);
    
    const { error } = await supabase
      .from("agrofruta_produtos")
      .insert(validData);

    if (error) throw error;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Erros de validação:", error.errors);
    }
  }
}
```

### 2. Validação no Banco com Constraints

```sql
-- Adicionar constraints de validação
ALTER TABLE agrofruta_produtos
  ADD CONSTRAINT check_preco_positivo 
    CHECK (preco_venda > 0),
  ADD CONSTRAINT check_estoque_nao_negativo 
    CHECK (estoque_atual >= 0);

-- Adicionar constraint de unicidade
ALTER TABLE agrofruta_produtos
  ADD CONSTRAINT unique_codigo_sku 
    UNIQUE (codigo_sku);
```

## 🔄 Padrões de Cache

### 1. Cache com Stale-While-Revalidate

```typescript
const { data } = useQuery({
  queryKey: ["produtos"],
  queryFn: fetchProdutos,
  staleTime: 1000 * 60 * 5, // 5 minutos
  cacheTime: 1000 * 60 * 30, // 30 minutos
  refetchOnWindowFocus: false,
  refetchOnMount: false,
});
```

### 2. Invalidação Seletiva de Cache

```typescript
// Invalidar apenas queries específicas
queryClient.invalidateQueries({ 
  queryKey: ["produtos"],
  exact: true 
});

// Invalidar queries que começam com prefixo
queryClient.invalidateQueries({ 
  queryKey: ["produtos"],
  exact: false 
});

// Invalidar múltiplas queries
queryClient.invalidateQueries({ 
  predicate: (query) => 
    query.queryKey[0] === "produtos" || 
    query.queryKey[0] === "categorias"
});
```

---

**Versão:** 1.0.0  
**Última Atualização:** 2026-04-30  
**Baseado em:** Projeto AgroFruta Insights
