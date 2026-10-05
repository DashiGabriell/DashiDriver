# Supabase Schema for LocaDashi

## 1. Overview

Este documento descreve o modelo inicial de dados para o app LocaDashi, baseado nas páginas e no mock de dados atuais.

A ideia é suportar:
- gerenciamento de veículos
- contratos de motoristas
- pagamentos e cobranças
- manutenções e serviços
- alertas operacionais
- autenticação de usuários via Supabase Auth

## 2. Supabase Setup

O app usa o cliente Supabase em `src/integrations/supabase/client.ts` com as variáveis de ambiente:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

O cliente é criado com `createClient<Database>()`, permitindo tipagem futura para as tabelas.

### Recomendação de ambiente

No `.env` local:

```env
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

## 3. Tabelas principais

### `carcontrol_vehicles`

Armazena dados dos veículos da frota.

- `id uuid PRIMARY KEY`
- `marca text NOT NULL`
- `modelo text NOT NULL`
- `ano int NOT NULL`
- `placa text NOT NULL UNIQUE`
- `cor text NOT NULL`
- `status text NOT NULL` (valores esperados: `disponivel`, `alugado`, `oficina`, `bloqueado`)
- `km_atual int NOT NULL`
- `km_inicial int NOT NULL`
- `parcela numeric(12,2) NOT NULL`
- `parcelas_restantes int NOT NULL`
- `banco text NOT NULL`
- `seguro numeric(12,2) NOT NULL`
- `vencimento_seguro date NOT NULL`
- `vencimento_parcela date NOT NULL`
- `photo_urls text[] NOT NULL DEFAULT '{}'` (fotos do veículo armazenadas no bucket `vehicle-photos`)
- `user_id uuid` (opcional, proprietário/organização)
- `created_at timestamp with time zone DEFAULT now()`
- `updated_at timestamp with time zone DEFAULT now()`

### `carcontrol_drivers`

Representa contratos de motoristas.

- `id uuid PRIMARY KEY`
- `nome text NOT NULL`
- `cpf text NOT NULL UNIQUE`
- `cnh text NOT NULL`
- `telefone text NOT NULL`
- `veiculo_id uuid REFERENCES carcontrol_vehicles(id) ON DELETE SET NULL`
- `valor_semanal numeric(12,2) NOT NULL`
- `inicio date NOT NULL`
- `status text NOT NULL` (valores esperados: `ativo`, `atrasado`, `encerrado`)
- `caucao numeric(12,2) NOT NULL`
- `foto_url text` (foto do motorista armazenada no bucket `driver-photos`)
- `contrato_url text` (PDF do contrato armazenado no bucket `driver-documents`)
- `antecedentes_url text` (PDF dos antecedentes criminais armazenado no bucket `driver-documents`)
- `comprovante_residencia_url text` (PDF do comprovante de residência armazenado no bucket `driver-documents`)
- `user_id uuid` (opcional)
- `created_at timestamp with time zone DEFAULT now()`
- `updated_at timestamp with time zone DEFAULT now()`

### `carcontrol_payments`

Histórico de pagamentos e cobranças.

- `id uuid PRIMARY KEY`
- `driver_id uuid REFERENCES carcontrol_drivers(id) ON DELETE SET NULL`
- `vehicle_id uuid REFERENCES carcontrol_vehicles(id) ON DELETE SET NULL`
- `valor numeric(12,2) NOT NULL`
- `data date NOT NULL`
- `metodo text NOT NULL`
- `status text NOT NULL` (valores esperados: `pago`, `pendente`, `atrasado`)
- `user_id uuid` (opcional)
- `created_at timestamp with time zone DEFAULT now()`
- `updated_at timestamp with time zone DEFAULT now()`

### `carcontrol_maintenances`

Registra serviços de manutenção realizados na frota.

- `id uuid PRIMARY KEY`
- `vehicle_id uuid REFERENCES carcontrol_vehicles(id) ON DELETE CASCADE`
- `tipo text NOT NULL` (valores esperados: `preventiva`, `corretiva`, `emergencial`)
- `servico text NOT NULL`
- `oficina text NOT NULL`
- `data date NOT NULL`
- `valor numeric(12,2) NOT NULL`
- `proximo_km int` (opcional)
- `user_id uuid` (opcional)
- `created_at timestamp with time zone DEFAULT now()`
- `updated_at timestamp with time zone DEFAULT now()`

### `carcontrol_alerts`

Alertas do painel operacional.

- `id uuid PRIMARY KEY`
- `tipo text NOT NULL` (valores esperados: `pagamento`, `seguro`, `manutencao`, `documento`, `contrato`, `ocioso`)
- `titulo text NOT NULL`
- `descricao text NOT NULL`
- `severidade text NOT NULL` (valores esperados: `info`, `atencao`, `critico`)
- `data date NOT NULL`
- `user_id uuid` (opcional)
- `created_at timestamp with time zone DEFAULT now()`
- `updated_at timestamp with time zone DEFAULT now()`

## 4. Relacionamentos

- `carcontrol_drivers.veiculo_id` → `carcontrol_vehicles.id`
- `carcontrol_payments.driver_id` → `carcontrol_drivers.id`
- `carcontrol_payments.vehicle_id` → `carcontrol_vehicles.id`
- `carcontrol_maintenances.vehicle_id` → `carcontrol_vehicles.id`

Opcional:
- `user_id` em cada tabela para suportar proprietários, multi-tenancy ou filtros por usuário.

## 5. Tipos no cliente Supabase

A base de dados sugere uma tipagem `Database` conforme `src/integrations/supabase/types.ts`.

É recomendável estender o typescript com as tabelas reais para permitir consultas tipadas:

```ts
export interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  cor: string;
  status: 'disponivel' | 'alugado' | 'oficina' | 'bloqueado';
  km_atual: number;
  km_inicial: number;
  parcela: number;
  parcelas_restantes: number;
  banco: string;
  seguro: number;
  vencimento_seguro: string;
  vencimento_parcela: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}
```

## 6. Exemplo de DDL inicial

```sql
create table carcontrol_vehicles (
  id uuid primary key default gen_random_uuid(),
  marca text not null,
  modelo text not null,
  ano int not null,
  placa text not null unique,
  cor text not null,
  status text not null check (status in ('disponivel','alugado','oficina','bloqueado')),
  km_atual int not null,
  km_inicial int not null,
  parcela numeric(12,2) not null,
  parcelas_restantes int not null,
  banco text not null,
  seguro numeric(12,2) not null,
  vencimento_seguro date not null,
  vencimento_parcela date not null,
  photo_urls text[] not null default '{}',
  user_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table carcontrol_drivers (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cpf text not null unique,
  cnh text not null,
  telefone text not null,
  veiculo_id uuid references carcontrol_vehicles(id) on delete set null,
  valor_semanal numeric(12,2) not null,
  inicio date not null,
  status text not null check (status in ('ativo','atrasado','encerrado')),
  caucao numeric(12,2) not null,
  user_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table carcontrol_payments (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references carcontrol_drivers(id) on delete set null,
  vehicle_id uuid references carcontrol_vehicles(id) on delete set null,
  valor numeric(12,2) not null,
  data date not null,
  metodo text not null,
  status text not null check (status in ('pago','pendente','atrasado')),
  user_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table carcontrol_maintenances (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references carcontrol_vehicles(id) on delete cascade,
  tipo text not null check (tipo in ('preventiva','corretiva','emergencial')),
  servico text not null,
  oficina text not null,
  data date not null,
  valor numeric(12,2) not null,
  proximo_km int,
  user_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table carcontrol_alerts (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('pagamento','seguro','manutencao','documento','contrato','ocioso')),
  titulo text not null,
  descricao text not null,
  severidade text not null check (severidade in ('info','atencao','critico')),
  data date not null,
  user_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## 7. Regras de acesso e segurança

### Supabase Auth

O aplicativo já usa o fluxo de autenticação Supabase via `supabase.auth.*`.

### Políticas RLS sugeridas

1. Habilitar RLS em todas as tabelas de dados principais.
2. Permitir leitura e escrita apenas para usuários autenticados.
3. Restringir linhas por `user_id` quando a aplicação precisar separar dados por usuário.

Exemplo:

```sql
alter table vehicles enable row level security;
create policy "Users can read their vehicles" on vehicles
  for select using (auth.uid() = user_id);
create policy "Users can manage their vehicles" on vehicles
  for all using (auth.uid() = user_id);
```

Se o app for inicialmente mono-tenant (um único cliente), as políticas podem ser mais flexíveis e depois endurecidas com `user_id`.

## 8. Esquema de migração inicial

- Criar as tabelas acima
- Criar chaves e índices em `placa`, `cpf`, `driver_id`, `vehicle_id`
- Configurar funções de atualização de `updated_at` se desejado
- Configurar RLS e policies para dados autenticados

## 9. Observações do modelo

- `payments` e `maintenances` seguem o mock atual e suportam histórico de registros.
- `alerts` são eventos operacionais exibidos em `Alertas.tsx`.
- `drivers.veiculo_id` é a chave de ligação entre motoristas e veículos.
- `vehicles.parcela`, `vehicles.seguro` e `payments.valor` são valores monetários que devem ser exibidos com formatação `pt-BR` no front-end.
- Se for preciso rastrear contratos com períodos mais longos, vale criar uma tabela adicional `contracts` no futuro.

---

### Conclusão

Este documento serve como base para a primeira migração Supabase e como referência para evoluir o modelo junto com as páginas atuais de dashboard, veículos, motoristas, pagamentos, manutenção e alertas.

---

## 10. Supabase Storage

### Bucket: `vehicle-photos`

Armazena fotos dos veículos da frota.

**Configuração:**
- **Nome:** `vehicle-photos`
- **Público:** `true` (URLs públicas para visualização)
- **Limite de tamanho:** 5MB por arquivo
- **Tipos permitidos:** `image/jpeg`, `image/png`, `image/webp`, `image/gif`

**Estrutura de pastas:**
```
vehicle-photos/
├── {vehicle_id}/
│   ├── {uuid}-foto1.jpg
│   ├── {uuid}-foto2.png
│   └── ...
```

**Políticas de acesso (RLS):**

1. **SELECT (Leitura Pública):**
   - Nome: `Public read access`
   - Permite: Qualquer pessoa pode visualizar fotos
   - Definição: `bucket_id = 'vehicle-photos'`

2. **INSERT (Upload Autenticado):**
   - Nome: `Authenticated upload`
   - Permite: Usuários autenticados podem fazer upload
   - Definição: `bucket_id = 'vehicle-photos'`
   - Roles: `authenticated`

3. **UPDATE (Atualização Autenticada):**
   - Nome: `Authenticated update`
   - Permite: Usuários autenticados podem atualizar arquivos
   - Definição: `bucket_id = 'vehicle-photos'`
   - Roles: `authenticated`

4. **DELETE (Deleção Autenticada):**
   - Nome: `Authenticated delete`
   - Permite: Usuários autenticados podem deletar arquivos
   - Definição: `bucket_id = 'vehicle-photos'`
   - Roles: `authenticated`

**Integração com a tabela `carcontrol_vehicles`:**

O campo `photo_urls` armazena array de URLs públicas das fotos:
```typescript
photo_urls: [
  "https://igchaidmowxpyjapjybe.supabase.co/storage/v1/object/public/vehicle-photos/{vehicle_id}/{uuid}-foto1.jpg",
  "https://igchaidmowxpyjapjybe.supabase.co/storage/v1/object/public/vehicle-photos/{vehicle_id}/{uuid}-foto2.png"
]
```

**Exemplo de uso no código:**

```typescript
// Upload de foto
const filePath = `${vehicleId}/${crypto.randomUUID()}-${file.name}`;
const { error } = await supabase.storage
  .from('vehicle-photos')
  .upload(filePath, file, { cacheControl: '3600', upsert: false });

// Obter URL pública
const { data } = supabase.storage
  .from('vehicle-photos')
  .getPublicUrl(filePath);

// Deletar foto
await supabase.storage
  .from('vehicle-photos')
  .remove([filePath]);
```

---

### Bucket: `driver-photos`

Armazena fotos dos motoristas.

**Configuração:**
- **Nome:** `driver-photos`
- **Público:** `true` (URLs públicas para visualização)
- **Limite de tamanho:** 5MB por arquivo
- **Tipos permitidos:** `image/jpeg`, `image/png`, `image/webp`, `image/gif`

**Estrutura de pastas:**
```
driver-photos/
├── {driver_id}/
│   └── foto/
│       └── {uuid}.jpg
```

**Políticas de acesso (RLS):**

1. **SELECT (Leitura Pública):**
   - Nome: `Fotos públicas para leitura`
   - Permite: Qualquer pessoa pode visualizar fotos
   - Definição: `bucket_id = 'driver-photos'`

2. **INSERT (Upload Autenticado):**
   - Nome: `Usuários autenticados podem fazer upload de fotos`
   - Permite: Usuários autenticados podem fazer upload
   - Definição: `bucket_id = 'driver-photos'`
   - Roles: `authenticated`

3. **UPDATE (Atualização Autenticada):**
   - Nome: `Usuários autenticados podem atualizar fotos`
   - Permite: Usuários autenticados podem atualizar arquivos
   - Definição: `bucket_id = 'driver-photos'`
   - Roles: `authenticated`

4. **DELETE (Deleção Autenticada):**
   - Nome: `Usuários autenticados podem deletar fotos`
   - Permite: Usuários autenticados podem deletar arquivos
   - Definição: `bucket_id = 'driver-photos'`
   - Roles: `authenticated`

**Integração com a tabela `carcontrol_drivers`:**

O campo `foto_url` armazena a URL pública da foto:
```typescript
foto_url: "https://igchaidmowxpyjapjybe.supabase.co/storage/v1/object/public/driver-photos/{driver_id}/foto/{uuid}.jpg"
```

---

### Bucket: `driver-documents`

Armazena documentos PDF dos motoristas (contrato, antecedentes criminais, comprovante de residência).

**Configuração:**
- **Nome:** `driver-documents`
- **Público:** `true` (URLs públicas para download)
- **Limite de tamanho:** 5MB por arquivo
- **Tipos permitidos:** `application/pdf`

**Estrutura de pastas:**
```
driver-documents/
├── {driver_id}/
│   ├── contrato/
│   │   └── {uuid}.pdf
│   ├── antecedentes/
│   │   └── {uuid}.pdf
│   └── comprovante_residencia/
│       └── {uuid}.pdf
```

**Políticas de acesso (RLS):**

1. **SELECT (Leitura Pública):**
   - Nome: `Documentos públicos para leitura`
   - Permite: Qualquer pessoa pode visualizar/baixar documentos
   - Definição: `bucket_id = 'driver-documents'`

2. **INSERT (Upload Autenticado):**
   - Nome: `Usuários autenticados podem fazer upload`
   - Permite: Usuários autenticados podem fazer upload
   - Definição: `bucket_id = 'driver-documents'`
   - Roles: `authenticated`

3. **UPDATE (Atualização Autenticada):**
   - Nome: `Usuários autenticados podem atualizar seus documentos`
   - Permite: Usuários autenticados podem atualizar arquivos
   - Definição: `bucket_id = 'driver-documents'`
   - Roles: `authenticated`

4. **DELETE (Deleção Autenticada):**
   - Nome: `Usuários autenticados podem deletar seus documentos`
   - Permite: Usuários autenticados podem deletar arquivos
   - Definição: `bucket_id = 'driver-documents'`
   - Roles: `authenticated`

**Integração com a tabela `carcontrol_drivers`:**

Os campos de documentos armazenam URLs públicas dos PDFs:
```typescript
contrato_url: "https://igchaidmowxpyjapjybe.supabase.co/storage/v1/object/public/driver-documents/{driver_id}/contrato/{uuid}.pdf"
antecedentes_url: "https://igchaidmowxpyjapjybe.supabase.co/storage/v1/object/public/driver-documents/{driver_id}/antecedentes/{uuid}.pdf"
comprovante_residencia_url: "https://igchaidmowxpyjapjybe.supabase.co/storage/v1/object/public/driver-documents/{driver_id}/comprovante_residencia/{uuid}.pdf"
```

**Exemplo de uso no código:**

```typescript
// Upload de documento
const filePath = `${driverId}/contrato/${crypto.randomUUID()}.pdf`;
const { error } = await supabase.storage
  .from('driver-documents')
  .upload(filePath, file, { cacheControl: '3600', upsert: false });

// Obter URL pública
const { data } = supabase.storage
  .from('driver-documents')
  .getPublicUrl(filePath);

// Deletar documento
await supabase.storage
  .from('driver-documents')
  .remove([filePath]);
```

---

### Instruções de Configuração

Para configurar os buckets e políticas pela primeira vez, consulte:
📄 **`supabase/STORAGE_POLICIES_SETUP.md`** (se existir)

Ou aplique a migration:
📄 **`supabase/migrations/002_add_driver_documents.sql`**