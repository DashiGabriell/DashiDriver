---
name: squaddashi
description: Squad de Ferramentas Essenciais para DashiDrive - Segurança, Performance, Clean Code, Design, Frontend, Backend, Supabase, Database e Mobileee
version: 1.0
priority: CRITICAL
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# 🚀 Squad Dashi - Arsenal Completo de Ferramentas

> **Skill Definitiva para o Projeto DashiDrive**
> Sistema de gestão de frotas com foco em segurança, performance ee experiência mobile perfeita

---

## 📋 Índice Rápido

1. [Visão Geral do Projeto](#visão-geral-do-projeto)
2. [Stack Tecnológica](#stack-tecnológica)
3. [🔐 Segurança](#-segurança)
4. [⚡ Performance](#-performance)
5. [🎨 Design & Frontend](#-design--frontend)
6. [🔧 Backend & API](#-backend--api)
7. [🗄️ Supabase & Database](#️-supabase--database)
8. [📱 Mobile & Responsividade](#-mobile--responsividade)
9. [✨ Clean Code](#-clean-code)
10. [🧪 Testing](#-testing)
11. [🚀 Deploy & DevOps](#-deploy--devops)
12. [📊 Checklist de Qualidade](#-checklist-de-qualidade)

---

## Visão Geral do Projeto

**DashiDrive** é uma plataforma de gestão de frotas de veículos com foco em:
- Gestão de veículos e motoristas
- Controle de manutenção preventiva e corretiva
- Monitoramento de pagamentos e lucratividade
- Sistema de alertas inteligentes
- Dashboard analítico em tempo real

### Características Principais
- ✅ **Mobile-First**: Responsividade perfeita em todos os dispositivos
- ✅ **Real-time**: Atualizações instantâneas via Supabase Realtime
- ✅ **Seguro**: RLS (Row Level Security) e autenticação robusta
- ✅ **Performático**: Otimizado para 60fps e Core Web Vitals
- ✅ **Escalável**: Arquitetura preparada para crescimento

---

## Stack Tecnológica

### Frontend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **React** | 18.3.1 | Framework UI |
| **TypeScript** | 5.8.3 | Type safety |
| **Vite** | 5.4.19 | Build tool ultra-rápido |
| **TailwindCSS** | 3.4.17 | Utility-first CSS |
| **Shadcn/ui** | Latest | Componentes acessíveis |
| **React Router** | 6.30.1 | Navegação SPA |
| **React Query** | 5.83.0 | Server state management |
| **React Hook Form** | 7.61.1 | Formulários performáticos |
| **Zod** | 3.25.76 | Validação de schemas |
| **Recharts** | 2.15.4 | Gráficos e visualizações |
| **Lucide React** | 0.462.0 | Ícones modernos |
| **Sonner** | 1.7.4 | Toast notifications |

### Backend & Database
| Tecnologia | Propósito |
|------------|-----------|
| **Supabase** | Backend-as-a-Service |
| **PostgreSQL** | Banco de dados relacional |
| **Row Level Security** | Segurança granular |
| **Realtime** | WebSockets para updates |
| **Storage** | Armazenamento de arquivos |

### Testing & Quality
| Ferramenta | Propósito |
|------------|-----------|
| **Vitest** | Unit & Integration tests |
| **Testing Library** | Component testing |
| **ESLint** | Linting |
| **TypeScript** | Type checking |

---

## 🔐 Segurança

### Ferramentas Essenciais

#### 1. **Vulnerability Scanner Skill**
**Localização**: `.agent/skills/vulnerability-scanner/`

**Uso Obrigatório**:
```bash
python .agent/skills/vulnerability-scanner/scripts/security_scan.py .
```

**O que verifica**:
- ✅ OWASP Top 10:2025
- ✅ Supply Chain Security (dependências maliciosas)
- ✅ Secrets expostos no código
- ✅ Configurações inseguras
- ✅ Vulnerabilidades de injeção
- ✅ Broken Access Control
- ✅ Cryptographic Failures

**Princípios Críticos**:
| Princípio | Aplicação no CarControl |
|-----------|------------------------|
| **Zero Trust** | Nunca confiar, sempre verificar |
| **Least Privilege** | Usuários só acessam o necessário |
| **Defense in Depth** | Múltiplas camadas de segurança |
| **Fail Secure** | Em caso de erro, negar acesso |

#### 2. **Supabase Row Level Security (RLS)**

**Políticas Obrigatórias**:

```sql
-- Veículos: Usuário só vê seus próprios veículos
CREATE POLICY "veiculos_user_access" ON veiculos
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Motoristas: Apenas proprietário pode editar
CREATE POLICY "motoristas_owner_only" ON motoristas
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Pagamentos: Leitura restrita
CREATE POLICY "pagamentos_read_own" ON pagamentos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM veiculos 
      WHERE veiculos.id = pagamentos.veiculo_id 
      AND veiculos.user_id = auth.uid()
    )
  );

-- Admin: Acesso total
CREATE POLICY "admin_full_access" ON veiculos
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

#### 3. **Autenticação Segura**

**Implementação Obrigatória**:

```typescript
// src/lib/auth.ts
import { supabase } from "@/integrations/supabase/client";

// Cache de sessão para evitar múltiplas chamadas
let currentSession: Session | null = null;
let sessionPromise: Promise<Session | null> | null = null;

// Listener para mudanças de autenticação
supabase.auth.onAuthStateChange((_, session) => {
  currentSession = session;
  sessionPromise = null;
});

// Função otimizada para obter sessão
export async function getSessionOnce(): Promise<Session | null> {
  if (currentSession) return currentSession;
  if (sessionPromise) return sessionPromise;

  sessionPromise = supabase.auth.getSession().then(({ data: { session } }) => {
    currentSession = session;
    sessionPromise = null;
    return session;
  });

  return sessionPromise;
}

// Proteção de rotas
export async function requireAuth(): Promise<User> {
  const session = await getSessionOnce();
  if (!session) {
    throw new Error("Não autenticado");
  }
  return session.user;
}
```

#### 4. **Secrets Management**

**NUNCA fazer**:
```typescript
// ❌ ERRADO
const API_KEY = "sk_live_123456789";
const SUPABASE_KEY = "eyJhbGc...";
```

**SEMPRE fazer**:
```typescript
// ✅ CORRETO
const API_KEY = import.meta.env.VITE_API_KEY;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

**Arquivo `.env`**:
```env
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGc..."
VITE_SUPABASE_PROJECT_ID="seu-projeto-id"
```

**Arquivo `.gitignore`**:
```
.env
.env.local
.env.production
```

#### 5. **Input Validation com Zod**

```typescript
import { z } from "zod";

// Schema de validação para veículo
const veiculoSchema = z.object({
  placa: z.string()
    .min(7, "Placa deve ter 7 caracteres")
    .max(7)
    .regex(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/, "Formato de placa inválido"),
  modelo: z.string().min(2).max(100),
  ano: z.number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  km_atual: z.number().nonnegative(),
  valor_diaria: z.number().positive(),
});

// Uso em formulários
const { register, handleSubmit } = useForm({
  resolver: zodResolver(veiculoSchema),
});
```

#### 6. **Proteção contra XSS**

```typescript
// React já protege por padrão, mas cuidado com:

// ❌ PERIGOSO
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SEGURO
<div>{userInput}</div>

// Para HTML sanitizado, use DOMPurify
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userInput) 
}} />
```

### Checklist de Segurança

Antes de cada deploy:
- [ ] RLS habilitado em TODAS as tabelas
- [ ] Políticas RLS testadas
- [ ] Secrets em variáveis de ambiente
- [ ] Input validation com Zod
- [ ] Autenticação funcionando
- [ ] Tokens em SecureStore (mobile)
- [ ] SSL/HTTPS ativo
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativo
- [ ] Logs não expõem dados sensíveis

---

## ⚡ Performance

### Ferramentas Essenciais

#### 1. **Performance Profiling Skill**
**Localização**: `.agent/skills/performance-profiling/`

**Uso Obrigatório**:
```bash
python .agent/skills/performance-profiling/scripts/lighthouse_audit.py https://carcontrol.com
```

**Métricas Alvo (Core Web Vitals)**:
| Métrica | Alvo | Crítico |
|---------|------|---------|
| **LCP** (Largest Contentful Paint) | < 2.5s | > 4.0s |
| **INP** (Interaction to Next Paint) | < 200ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | > 0.25 |
| **FCP** (First Contentful Paint) | < 1.8s | > 3.0s |
| **TTI** (Time to Interactive) | < 3.8s | > 7.3s |

#### 2. **React Query para Server State**

**Configuração Otimizada**:

```typescript
// src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 30, // 30 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

**Hook Otimizado para Veículos**:

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useVeiculos() {
  return useQuery({
    queryKey: ["veiculos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("veiculos")
        .select(`
          *,
          motorista:motoristas(nome, cnh)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
  });
}
```

#### 3. **Code Splitting & Lazy Loading**

```typescript
// src/App.tsx
import { lazy, Suspense } from "react";

// Lazy load de páginas
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Veiculos = lazy(() => import("@/pages/Veiculos"));
const Motoristas = lazy(() => import("@/pages/Motoristas"));
const Manutencao = lazy(() => import("@/pages/Manutencao"));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/veiculos" element={<Veiculos />} />
        <Route path="/motoristas" element={<Motoristas />} />
        <Route path="/manutencao" element={<Manutencao />} />
      </Routes>
    </Suspense>
  );
}
```

#### 4. **Otimização de Imagens**

```typescript
// Componente de imagem otimizada
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

function OptimizedImage({ src, alt, width, height }: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      style={{ contentVisibility: "auto" }}
    />
  );
}
```

#### 5. **Memoization Estratégica**

```typescript
import { memo, useMemo, useCallback } from "react";

// Memoizar componentes pesados
const VehicleCard = memo(({ vehicle }: { vehicle: Vehicle }) => {
  return (
    <div className="card">
      <h3>{vehicle.modelo}</h3>
      <p>{vehicle.placa}</p>
    </div>
  );
});

// Memoizar cálculos pesados
function Dashboard() {
  const { data: veiculos } = useVeiculos();
  
  const estatisticas = useMemo(() => {
    if (!veiculos) return null;
    
    return {
      total: veiculos.length,
      disponiveis: veiculos.filter(v => v.status === "disponivel").length,
      emManutencao: veiculos.filter(v => v.status === "manutencao").length,
      valorTotal: veiculos.reduce((acc, v) => acc + v.valor_diaria, 0),
    };
  }, [veiculos]);
  
  return <div>{/* UI */}</div>;
}

// Memoizar callbacks
function VehicleList() {
  const handleDelete = useCallback((id: string) => {
    // lógica de delete
  }, []);
  
  return veiculos.map(v => (
    <VehicleCard key={v.id} vehicle={v} onDelete={handleDelete} />
  ));
}
```

#### 6. **Bundle Optimization**

**Vite Config Otimizado**:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          charts: ["recharts"],
          forms: ["react-hook-form", "zod"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### Checklist de Performance

Antes de cada deploy:
- [ ] Lighthouse score > 90
- [ ] LCP < 2.5s
- [ ] INP < 200ms
- [ ] CLS < 0.1
- [ ] Bundle size < 500KB (gzipped)
- [ ] Imagens otimizadas e lazy loaded
- [ ] Code splitting implementado
- [ ] React Query configurado
- [ ] Memoization em componentes pesados
- [ ] Sem console.log em produção

---

## 🎨 Design & Frontend

### Ferramentas Essenciais

#### 1. **Frontend Design Skill**
**Localização**: `.agent/skills/frontend-design/`

**Uso Obrigatório**:
```bash
python .agent/skills/frontend-design/scripts/ux_audit.py .
python .agent/skills/frontend-design/scripts/accessibility_checker.py .
```

**Princípios de Design para CarControl**:

| Princípio | Aplicação |
|-----------|-----------|
| **Mobile-First** | Design começa pelo mobile, expande para desktop |
| **Fitts' Law** | Botões importantes maiores e mais acessíveis |
| **Hick's Law** | Limitar opções para decisões mais rápidas |
| **Miller's Law** | Agrupar informações em chunks de 7±2 itens |
| **Von Restorff** | CTAs visualmente distintos |

#### 2. **Tailwind CSS v4 Patterns**
**Localização**: `.agent/skills/tailwind-patterns/`

**Sistema de Design CarControl**:

```css
/* tailwind.config.ts */
@theme {
  /* Cores Primárias */
  --color-primary: oklch(0.55 0.22 250); /* Azul profissional */
  --color-primary-hover: oklch(0.45 0.22 250);
  --color-secondary: oklch(0.65 0.15 160); /* Verde sucesso */
  --color-accent: oklch(0.70 0.20 40); /* Laranja alerta */
  
  /* Superfícies */
  --color-surface: oklch(0.98 0 0);
  --color-surface-dark: oklch(0.15 0 0);
  --color-card: oklch(1 0 0);
  --color-card-dark: oklch(0.20 0 0);
  
  /* Estados */
  --color-success: oklch(0.65 0.15 160);
  --color-warning: oklch(0.75 0.18 80);
  --color-error: oklch(0.60 0.22 25);
  --color-info: oklch(0.60 0.18 240);
  
  /* Espaçamento (8-point grid) */
  --spacing-xs: 0.25rem;  /* 4px */
  --spacing-sm: 0.5rem;   /* 8px */
  --spacing-md: 1rem;     /* 16px */
  --spacing-lg: 1.5rem;   /* 24px */
  --spacing-xl: 2rem;     /* 32px */
  --spacing-2xl: 3rem;    /* 48px */
  
  /* Tipografia */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Sombras */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}
```

#### 3. **Componentes Shadcn/ui**

**Componentes Essenciais para CarControl**:

| Componente | Uso no Projeto |
|------------|----------------|
| **Card** | Cards de veículos, motoristas, estatísticas |
| **Table** | Listagens de dados |
| **Dialog** | Modais de criação/edição |
| **Form** | Formulários com validação |
| **Select** | Dropdowns de filtros |
| **Toast** | Notificações de sucesso/erro |
| **Badge** | Status de veículos (disponível, em uso, manutenção) |
| **Tabs** | Navegação entre seções |
| **Calendar** | Agendamento de manutenções |
| **Chart** | Gráficos de lucratividade |

**Exemplo de Card de Veículo**:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface VehicleCardProps {
  vehicle: {
    id: string;
    modelo: string;
    placa: string;
    status: "disponivel" | "em_uso" | "manutencao";
    km_atual: number;
    valor_diaria: number;
  };
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const statusColors = {
    disponivel: "bg-green-500",
    em_uso: "bg-blue-500",
    manutencao: "bg-orange-500",
  };
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{vehicle.modelo}</CardTitle>
          <Badge className={statusColors[vehicle.status]}>
            {vehicle.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Placa: <span className="font-mono font-bold">{vehicle.placa}</span>
          </p>
          <p className="text-sm">KM: {vehicle.km_atual.toLocaleString()}</p>
          <p className="text-lg font-bold text-primary">
            R$ {vehicle.valor_diaria.toFixed(2)}/dia
          </p>
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline">Editar</Button>
            <Button size="sm">Ver Detalhes</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 4. **Responsividade Perfeita**

**Breakpoints do CarControl**:

```typescript
// Mobile First Approach
const ResponsiveLayout = () => {
  return (
    <div className="container mx-auto px-4">
      {/* Mobile: 1 coluna */}
      {/* Tablet: 2 colunas */}
      {/* Desktop: 3 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
      </div>
    </div>
  );
};

// Navegação Responsiva
const Navigation = () => {
  return (
    <>
      {/* Mobile: Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex justify-around py-2">
          <NavLink to="/" icon={<Home />} label="Início" />
          <NavLink to="/veiculos" icon={<Car />} label="Veículos" />
          <NavLink to="/motoristas" icon={<Users />} label="Motoristas" />
          <NavLink to="/alertas" icon={<Bell />} label="Alertas" />
        </div>
      </nav>
      
      {/* Desktop: Sidebar */}
      <aside className="hidden md:block w-64 fixed left-0 top-0 h-screen bg-white border-r">
        <nav className="p-4 space-y-2">
          <NavLink to="/" icon={<Home />} label="Dashboard" />
          <NavLink to="/veiculos" icon={<Car />} label="Veículos" />
          <NavLink to="/motoristas" icon={<Users />} label="Motoristas" />
          <NavLink to="/manutencao" icon={<Wrench />} label="Manutenção" />
          <NavLink to="/pagamentos" icon={<DollarSign />} label="Pagamentos" />
          <NavLink to="/alertas" icon={<Bell />} label="Alertas" />
        </nav>
      </aside>
    </>
  );
};
```

#### 5. **Acessibilidade (A11y)**

**Checklist Obrigatório**:

```typescript
// Sempre usar labels em inputs
<Label htmlFor="placa">Placa do Veículo</Label>
<Input id="placa" aria-describedby="placa-error" />

// ARIA roles apropriados
<button aria-label="Deletar veículo" onClick={handleDelete}>
  <Trash2 className="h-4 w-4" />
</button>

// Navegação por teclado
<Dialog>
  <DialogTrigger asChild>
    <Button>Adicionar Veículo</Button>
  </DialogTrigger>
  <DialogContent>
    {/* Foco automático no primeiro input */}
    <Input autoFocus />
  </DialogContent>
</Dialog>

// Contraste adequado (WCAG AA)
// Texto: mínimo 4.5:1
// Texto grande: mínimo 3:1
// Componentes UI: mínimo 3:1
```

### Checklist de Design

Antes de cada deploy:
- [ ] Mobile-first implementado
- [ ] Responsivo em todos os breakpoints
- [ ] Touch targets ≥ 44px
- [ ] Contraste WCAG AA (4.5:1)
- [ ] Navegação por teclado funciona
- [ ] ARIA labels em elementos interativos
- [ ] Loading states em todas as ações
- [ ] Error states com mensagens claras
- [ ] Dark mode (opcional)
- [ ] Animações respeitam prefers-reduced-motion

---

## 🔧 Backend & API

### Ferramentas Essenciais

#### 1. **API Patterns Skill**
**Localização**: `.agent/skills/api-patterns/`

**Uso Obrigatório**:
```bash
python .agent/skills/api-patterns/scripts/api_validator.py .
```

#### 2. **Supabase como Backend**

**Vantagens para CarControl**:
- ✅ PostgreSQL gerenciado
- ✅ APIs REST automáticas
- ✅ Realtime WebSockets
- ✅ Autenticação integrada
- ✅ Row Level Security
- ✅ Storage para documentos
- ✅ Edge Functions serverless

#### 3. **Estrutura de Dados Recomendada**

```sql
-- Tabela de Perfis (estende auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Veículos
CREATE TABLE veiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  placa TEXT NOT NULL UNIQUE,
  modelo TEXT NOT NULL,
  marca TEXT NOT NULL,
  ano INTEGER NOT NULL,
  cor TEXT,
  km_atual INTEGER DEFAULT 0,
  valor_diaria DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'em_uso', 'manutencao', 'inativo')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Motoristas
CREATE TABLE motoristas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  cnh TEXT NOT NULL UNIQUE,
  categoria_cnh TEXT NOT NULL,
  validade_cnh DATE NOT NULL,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Locações
CREATE TABLE locacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  veiculo_id UUID NOT NULL REFERENCES veiculos(id),
  motorista_id UUID NOT NULL REFERENCES motoristas(id),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  km_inicial INTEGER NOT NULL,
  km_final INTEGER,
  valor_total DECIMAL(10,2),
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'finalizada', 'cancelada')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Manutenções
CREATE TABLE manutencoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  veiculo_id UUID NOT NULL REFERENCES veiculos(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('preventiva', 'corretiva', 'revisao')),
  descricao TEXT NOT NULL,
  data_agendada DATE NOT NULL,
  data_realizada DATE,
  km_manutencao INTEGER,
  valor DECIMAL(10,2),
  oficina TEXT,
  status TEXT DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'cancelada')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Pagamentos
CREATE TABLE pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  locacao_id UUID REFERENCES locacoes(id),
  veiculo_id UUID NOT NULL REFERENCES veiculos(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  forma_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Alertas
CREATE TABLE alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  veiculo_id UUID REFERENCES veiculos(id),
  motorista_id UUID REFERENCES motoristas(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('manutencao', 'documento', 'pagamento', 'sistema')),
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  data_alerta TIMESTAMPTZ DEFAULT NOW(),
  lido BOOLEAN DEFAULT FALSE,
  resolvido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para Performance
CREATE INDEX idx_veiculos_user_id ON veiculos(user_id);
CREATE INDEX idx_veiculos_status ON veiculos(status);
CREATE INDEX idx_motoristas_user_id ON motoristas(user_id);
CREATE INDEX idx_locacoes_veiculo_id ON locacoes(veiculo_id);
CREATE INDEX idx_locacoes_motorista_id ON locacoes(motorista_id);
CREATE INDEX idx_locacoes_status ON locacoes(status);
CREATE INDEX idx_manutencoes_veiculo_id ON manutencoes(veiculo_id);
CREATE INDEX idx_manutencoes_data_agendada ON manutencoes(data_agendada);
CREATE INDEX idx_pagamentos_veiculo_id ON pagamentos(veiculo_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);
CREATE INDEX idx_alertas_user_id_lido ON alertas(user_id, lido);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_veiculos_updated_at BEFORE UPDATE ON veiculos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_motoristas_updated_at BEFORE UPDATE ON motoristas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locacoes_updated_at BEFORE UPDATE ON locacoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manutencoes_updated_at BEFORE UPDATE ON manutencoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON pagamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 4. **Functions PostgreSQL para Análises**

```sql
-- Função para calcular lucratividade por veículo
CREATE OR REPLACE FUNCTION calcular_lucratividade_veiculo(
  p_veiculo_id UUID,
  p_data_inicio DATE,
  p_data_fim DATE
)
RETURNS TABLE (
  veiculo_id UUID,
  receita_total DECIMAL,
  despesa_total DECIMAL,
  lucro_liquido DECIMAL,
  margem_percentual DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p_veiculo_id,
    COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) as receita_total,
    COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) as despesa_total,
    COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END), 0) as lucro_liquido,
    CASE 
      WHEN SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) > 0 
      THEN (SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END) / 
            SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END)) * 100
      ELSE 0
    END as margem_percentual
  FROM pagamentos
  WHERE veiculo_id = p_veiculo_id
    AND data_pagamento BETWEEN p_data_inicio AND p_data_fim
    AND status = 'pago';
END;
$$ LANGUAGE plpgsql;

-- Função para dashboard de estatísticas
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_veiculos', (SELECT COUNT(*) FROM veiculos WHERE user_id = p_user_id),
    'veiculos_disponiveis', (SELECT COUNT(*) FROM veiculos WHERE user_id = p_user_id AND status = 'disponivel'),
    'veiculos_em_uso', (SELECT COUNT(*) FROM veiculos WHERE user_id = p_user_id AND status = 'em_uso'),
    'veiculos_manutencao', (SELECT COUNT(*) FROM veiculos WHERE user_id = p_user_id AND status = 'manutencao'),
    'total_motoristas', (SELECT COUNT(*) FROM motoristas WHERE user_id = p_user_id AND status = 'ativo'),
    'locacoes_ativas', (SELECT COUNT(*) FROM locacoes WHERE user_id = p_user_id AND status = 'ativa'),
    'manutencoes_pendentes', (SELECT COUNT(*) FROM manutencoes WHERE user_id = p_user_id AND status IN ('agendada', 'em_andamento')),
    'pagamentos_pendentes', (SELECT COUNT(*) FROM pagamentos WHERE user_id = p_user_id AND status = 'pendente'),
    'alertas_nao_lidos', (SELECT COUNT(*) FROM alertas WHERE user_id = p_user_id AND lido = FALSE),
    'receita_mes_atual', (
      SELECT COALESCE(SUM(valor), 0) 
      FROM pagamentos 
      WHERE user_id = p_user_id 
        AND tipo = 'receita' 
        AND status = 'pago'
        AND EXTRACT(MONTH FROM data_pagamento) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM data_pagamento) = EXTRACT(YEAR FROM CURRENT_DATE)
    ),
    'despesa_mes_atual', (
      SELECT COALESCE(SUM(valor), 0) 
      FROM pagamentos 
      WHERE user_id = p_user_id 
        AND tipo = 'despesa' 
        AND status = 'pago'
        AND EXTRACT(MONTH FROM data_pagamento) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM data_pagamento) = EXTRACT(YEAR FROM CURRENT_DATE)
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

---

## 🗄️ Supabase & Database

### Ferramentas Essenciais

#### 1. **Supabase Complete Skill**
**Localização**: `.agent/supabase-complete-skill.md`

**Documentação Completa**: Este arquivo contém TUDO sobre Supabase:
- Setup inicial (5 minutos)
- Configuração estável
- Autenticação completa
- CRUD completo
- Hooks React otimizados
- Realtime WebSockets
- Storage de arquivos
- Row Level Security
- Padrões avançados
- Troubleshooting

#### 2. **Database Design Skill**
**Localização**: `.agent/skills/database-design/`

**Uso Obrigatório**:
```bash
python .agent/skills/database-design/scripts/schema_validator.py .
```

#### 3. **Cliente Supabase Otimizado**

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Variáveis de ambiente Supabase não configuradas');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

#### 4. **Hooks React Query + Supabase**

**Hook para Veículos com Realtime**:

```typescript
// src/hooks/useVeiculos.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function useVeiculos() {
  const queryClient = useQueryClient();

  // Query para listar veículos
  const query = useQuery({
    queryKey: ["veiculos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("veiculos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("veiculos-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "veiculos" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["veiculos"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Mutation para criar veículo
  const criar = useMutation({
    mutationFn: async (novoVeiculo: any) => {
      const { data, error } = await supabase
        .from("veiculos")
        .insert(novoVeiculo)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
    },
  });

  // Mutation para atualizar veículo
  const atualizar = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("veiculos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
    },
  });

  // Mutation para deletar veículo
  const deletar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("veiculos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
    },
  });

  return {
    veiculos: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    criar: criar.mutate,
    atualizar: atualizar.mutate,
    deletar: deletar.mutate,
    isCriando: criar.isPending,
    isAtualizando: atualizar.isPending,
    isDeletando: deletar.isPending,
  };
}
```

**Hook para Dashboard com RPC**:

```typescript
// src/hooks/useDashboard.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getSessionOnce } from "@/lib/auth";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const session = await getSessionOnce();
      if (!session) throw new Error("Não autenticado");

      const { data, error } = await supabase
        .rpc("get_dashboard_stats", { p_user_id: session.user.id });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 2, // Cache por 2 minutos
  });
}
```

#### 5. **Migrations com Supabase CLI**

```bash
# Inicializar Supabase localmente
supabase init

# Criar nova migration
supabase migration new create_carcontrol_schema

# Aplicar migrations no projeto remoto
supabase db push

# Gerar tipos TypeScript
npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/integrations/supabase/types.ts
```

#### 6. **Backup e Restore**

```bash
# Backup do banco de dados
supabase db dump -f backup.sql

# Restore do backup
psql "postgresql://..." < backup.sql

# Backup automático (configurar no Supabase Dashboard)
# Settings > Database > Backups
# Habilitar backups diários automáticos
```

### Checklist de Database

Antes de cada deploy:
- [ ] Migrations aplicadas
- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas RLS testadas
- [ ] Índices criados para queries frequentes
- [ ] Triggers de updated_at funcionando
- [ ] Functions PostgreSQL testadas
- [ ] Tipos TypeScript gerados
- [ ] Backup configurado
- [ ] Realtime funcionando
- [ ] Queries otimizadas (sem N+1)

---

## 📱 Mobile & Responsividade

### Ferramentas Essenciais

#### 1. **Mobile Design Skill**
**Localização**: `.agent/skills/mobile-design/`

**Uso Obrigatório**:
```bash
python .agent/skills/mobile-design/scripts/mobile_audit.py .
```

**Princípios Críticos para CarControl Mobile**:

| Princípio | Aplicação |
|-----------|-----------|
| **Touch Targets** | Mínimo 44px × 44px (iOS) / 48px × 48px (Android) |
| **Thumb Zone** | CTAs principais na parte inferior da tela |
| **One-Handed Use** | Navegação acessível com uma mão |
| **Offline-First** | App funciona sem internet (cache) |
| **Performance** | 60fps em animações e scrolls |

#### 2. **Responsividade Perfeita**

**Sistema de Breakpoints**:

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      'xs': '375px',   // iPhone SE
      'sm': '640px',   // Phones landscape
      'md': '768px',   // Tablets
      'lg': '1024px',  // Laptops
      'xl': '1280px',  // Desktops
      '2xl': '1536px', // Large desktops
    },
  },
};
```

**Layout Responsivo Completo**:

```typescript
// src/components/layout/ResponsiveLayout.tsx
import { useMediaQuery } from "@/hooks/use-mobile";

export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 md:h-16 items-center">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6" />
            <span className="font-bold text-lg">CarControl</span>
          </div>
          
          {/* Desktop: Menu horizontal */}
          {!isMobile && (
            <nav className="ml-auto flex gap-4">
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/veiculos">Veículos</NavLink>
              <NavLink to="/motoristas">Motoristas</NavLink>
              <NavLink to="/manutencao">Manutenção</NavLink>
            </nav>
          )}
          
          {/* Mobile: Menu hamburguer */}
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
                  <NavLink to="/">Dashboard</NavLink>
                  <NavLink to="/veiculos">Veículos</NavLink>
                  <NavLink to="/motoristas">Motoristas</NavLink>
                  <NavLink to="/manutencao">Manutenção</NavLink>
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container py-4 md:py-6 pb-20 md:pb-6">
        {children}
      </main>
      
      {/* Mobile: Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
          <div className="flex justify-around py-2">
            <BottomNavItem to="/" icon={<Home />} label="Início" />
            <BottomNavItem to="/veiculos" icon={<Car />} label="Veículos" />
            <BottomNavItem to="/motoristas" icon={<Users />} label="Motoristas" />
            <BottomNavItem to="/alertas" icon={<Bell />} label="Alertas" />
          </div>
        </nav>
      )}
    </div>
  );
}

// Componente de navegação inferior
function BottomNavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      <div className="h-6 w-6">{icon}</div>
      <span>{label}</span>
    </Link>
  );
}
```

#### 3. **Hook useMediaQuery**

```typescript
// src/hooks/use-mobile.tsx
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

// Uso
export function useMobile() {
  return useMediaQuery("(max-width: 768px)");
}
```

#### 4. **Componentes Mobile-Optimized**

**Card Responsivo**:

```typescript
// Mobile: Stack vertical
// Desktop: Grid horizontal
<Card className="flex flex-col md:flex-row gap-4 p-4">
  <div className="flex-shrink-0">
    <img 
      src={vehicle.image} 
      alt={vehicle.modelo}
      className="w-full md:w-32 h-48 md:h-32 object-cover rounded"
    />
  </div>
  <div className="flex-1">
    <h3 className="text-lg md:text-xl font-bold">{vehicle.modelo}</h3>
    <p className="text-sm text-muted-foreground">{vehicle.placa}</p>
  </div>
  <div className="flex md:flex-col gap-2">
    <Button size="sm" className="flex-1 md:flex-none">Editar</Button>
    <Button size="sm" variant="outline" className="flex-1 md:flex-none">Detalhes</Button>
  </div>
</Card>
```

**Formulário Responsivo**:

```typescript
<form className="space-y-4">
  {/* Mobile: 1 coluna, Desktop: 2 colunas */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Label htmlFor="modelo">Modelo</Label>
      <Input id="modelo" {...register("modelo")} />
    </div>
    <div>
      <Label htmlFor="placa">Placa</Label>
      <Input id="placa" {...register("placa")} />
    </div>
  </div>
  
  {/* Botões: Mobile full-width, Desktop auto */}
  <div className="flex flex-col md:flex-row gap-2 md:justify-end">
    <Button type="button" variant="outline" className="w-full md:w-auto">
      Cancelar
    </Button>
    <Button type="submit" className="w-full md:w-auto">
      Salvar
    </Button>
  </div>
</form>
```

#### 5. **PWA (Progressive Web App)**

**Configuração para PWA**:

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'CarControl - Gestão de Frotas',
        short_name: 'CarControl',
        description: 'Sistema de gestão de frotas de veículos',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 horas
              },
            },
          },
        ],
      },
    }),
  ],
});
```

#### 6. **Gestos Touch**

```typescript
// Swipe para deletar (mobile)
import { useSwipeable } from 'react-swipeable';

function SwipeableCard({ vehicle, onDelete }: Props) {
  const [offset, setOffset] = useState(0);
  
  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (eventData.dir === 'Left') {
        setOffset(Math.max(eventData.deltaX, -100));
      }
    },
    onSwiped: (eventData) => {
      if (eventData.dir === 'Left' && Math.abs(eventData.deltaX) > 50) {
        onDelete(vehicle.id);
      } else {
        setOffset(0);
      }
    },
    trackMouse: true,
  });
  
  return (
    <div {...handlers} style={{ transform: `translateX(${offset}px)` }}>
      <VehicleCard vehicle={vehicle} />
    </div>
  );
}
```

### Checklist Mobile

Antes de cada deploy:
- [ ] Touch targets ≥ 44-48px
- [ ] Navegação funciona com uma mão
- [ ] Bottom navigation no mobile
- [ ] Sidebar no desktop
- [ ] Formulários responsivos
- [ ] Imagens otimizadas para mobile
- [ ] PWA configurado
- [ ] Offline-first implementado
- [ ] Gestos touch funcionando
- [ ] Testado em dispositivos reais
- [ ] Performance 60fps
- [ ] Viewport meta tag configurada

---

## ✨ Clean Code

### Ferramentas Essenciais

#### 1. **Clean Code Skill**
**Localização**: `.agent/skills/clean-code/`

**Princípios CRÍTICOS**:

| Princípio | Regra |
|-----------|-------|
| **SRP** | Single Responsibility - cada função faz UMA coisa |
| **DRY** | Don't Repeat Yourself - extrair duplicatas |
| **KISS** | Keep It Simple - solução mais simples que funciona |
| **YAGNI** | You Aren't Gonna Need It - não construir features não usadas |

#### 2. **Naming Conventions**

```typescript
// ✅ BOM - Nomes revelam intenção
const totalVeiculosDisponiveis = veiculos.filter(v => v.status === "disponivel").length;
const calcularLucratividade = (receita: number, despesa: number) => receita - despesa;
const isVeiculoDisponivel = (veiculo: Veiculo) => veiculo.status === "disponivel";

// ❌ RUIM - Nomes genéricos
const n = veiculos.filter(v => v.status === "disponivel").length;
const calc = (r: number, d: number) => r - d;
const check = (v: Veiculo) => v.status === "disponivel";
```

#### 3. **Funções Pequenas e Focadas**

```typescript
// ✅ BOM - Funções pequenas, uma responsabilidade
function calcularValorLocacao(dias: number, valorDiaria: number): number {
  return dias * valorDiaria;
}

function aplicarDesconto(valor: number, percentual: number): number {
  return valor * (1 - percentual / 100);
}

function calcularValorFinalLocacao(
  dias: number,
  valorDiaria: number,
  descontoPercentual: number
): number {
  const valorBase = calcularValorLocacao(dias, valorDiaria);
  return aplicarDesconto(valorBase, descontoPercentual);
}

// ❌ RUIM - Função grande, múltiplas responsabilidades
function processarLocacao(dados: any) {
  const valor = dados.dias * dados.valorDiaria;
  const desconto = valor * (dados.desconto / 100);
  const final = valor - desconto;
  // ... mais 50 linhas de código
  return final;
}
```

#### 4. **Guard Clauses (Early Returns)**

```typescript
// ✅ BOM - Guard clauses, código flat
function validarVeiculo(veiculo: Veiculo): string | null {
  if (!veiculo.placa) {
    return "Placa é obrigatória";
  }
  
  if (!veiculo.modelo) {
    return "Modelo é obrigatório";
  }
  
  if (veiculo.ano < 1900) {
    return "Ano inválido";
  }
  
  if (veiculo.valor_diaria <= 0) {
    return "Valor da diária deve ser positivo";
  }
  
  return null; // Válido
}

// ❌ RUIM - Nested ifs, difícil de ler
function validarVeiculo(veiculo: Veiculo): string | null {
  if (veiculo.placa) {
    if (veiculo.modelo) {
      if (veiculo.ano >= 1900) {
        if (veiculo.valor_diaria > 0) {
          return null;
        } else {
          return "Valor da diária deve ser positivo";
        }
      } else {
        return "Ano inválido";
      }
    } else {
      return "Modelo é obrigatório";
    }
  } else {
    return "Placa é obrigatória";
  }
}
```

#### 5. **Composição sobre Herança**

```typescript
// ✅ BOM - Composição
interface Veiculo {
  id: string;
  modelo: string;
  placa: string;
}

interface Locavel {
  valorDiaria: number;
  disponivel: boolean;
}

interface Rastreavel {
  kmAtual: number;
  ultimaLocalizacao: string;
}

type VeiculoLocavel = Veiculo & Locavel & Rastreavel;

// ❌ RUIM - Herança profunda
class VeiculoBase {
  id: string;
  modelo: string;
}

class VeiculoLocavel extends VeiculoBase {
  valorDiaria: number;
}

class VeiculoRastreavel extends VeiculoLocavel {
  kmAtual: number;
}
```

#### 6. **Evitar Comentários Óbvios**

```typescript
// ✅ BOM - Código auto-explicativo
const veiculosDisponiveis = veiculos.filter(v => v.status === "disponivel");
const totalVeiculos = veiculos.length;

// ❌ RUIM - Comentários óbvios
// Filtra os veículos disponíveis
const veiculosDisponiveis = veiculos.filter(v => v.status === "disponivel");
// Conta o total de veículos
const totalVeiculos = veiculos.length;

// ✅ BOM - Comentário útil quando necessário
// Aplica desconto progressivo: 5% para 7+ dias, 10% para 15+ dias, 15% para 30+ dias
function calcularDescontoProgressivo(dias: number): number {
  if (dias >= 30) return 15;
  if (dias >= 15) return 10;
  if (dias >= 7) return 5;
  return 0;
}
```

#### 7. **Constantes Nomeadas (Sem Magic Numbers)**

```typescript
// ✅ BOM - Constantes nomeadas
const DIAS_MINIMOS_DESCONTO = 7;
const DESCONTO_7_DIAS = 5;
const DESCONTO_15_DIAS = 10;
const DESCONTO_30_DIAS = 15;
const KM_MANUTENCAO_PREVENTIVA = 10000;

function precisaManutencao(veiculo: Veiculo): boolean {
  return veiculo.kmAtual >= KM_MANUTENCAO_PREVENTIVA;
}

// ❌ RUIM - Magic numbers
function precisaManutencao(veiculo: Veiculo): boolean {
  return veiculo.kmAtual >= 10000;
}
```

#### 8. **TypeScript Strict Mode**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### 9. **ESLint Configuration**

```javascript
// eslint.config.js
export default [
  {
    rules: {
      "no-console": "warn",
      "no-debugger": "error",
      "no-unused-vars": "error",
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "max-lines-per-function": ["warn", 50],
      "max-depth": ["error", 3],
      "complexity": ["warn", 10],
    },
  },
];
```

### Checklist Clean Code

Antes de cada commit:
- [ ] Funções < 20 linhas
- [ ] Nomes revelam intenção
- [ ] Sem comentários óbvios
- [ ] Guard clauses usadas
- [ ] Sem magic numbers
- [ ] Sem código duplicado
- [ ] TypeScript strict mode
- [ ] ESLint sem erros
- [ ] Sem console.log
- [ ] Sem código comentado

---

## 🧪 Testing

### Ferramentas Essenciais

#### 1. **Testing Patterns Skill**
**Localização**: `.agent/skills/testing-patterns/`

**Uso Obrigatório**:
```bash
python .agent/skills/testing-patterns/scripts/test_runner.py .
```

#### 2. **Pirâmide de Testes**

```
        /\          E2E (Poucos)
       /  \         Fluxos críticos
      /----\
     /      \       Integration (Alguns)
    /--------\      Hooks, API calls
   /          \
  /------------\    Unit (Muitos)
                    Funções puras, utils
```

#### 3. **Vitest Configuration**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### 4. **Setup de Testes**

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup após cada teste
afterEach(() => {
  cleanup();
});

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// Mock do React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));
```

#### 5. **Testes Unitários**

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { calcularValorLocacao, aplicarDesconto } from './utils';

describe('calcularValorLocacao', () => {
  it('deve calcular valor correto para 1 dia', () => {
    expect(calcularValorLocacao(1, 100)).toBe(100);
  });

  it('deve calcular valor correto para múltiplos dias', () => {
    expect(calcularValorLocacao(7, 100)).toBe(700);
  });

  it('deve retornar 0 para 0 dias', () => {
    expect(calcularValorLocacao(0, 100)).toBe(0);
  });
});

describe('aplicarDesconto', () => {
  it('deve aplicar desconto de 10%', () => {
    expect(aplicarDesconto(100, 10)).toBe(90);
  });

  it('deve retornar valor original com desconto 0', () => {
    expect(aplicarDesconto(100, 0)).toBe(100);
  });

  it('deve retornar 0 com desconto de 100%', () => {
    expect(aplicarDesconto(100, 100)).toBe(0);
  });
});
```

#### 6. **Testes de Componentes**

```typescript
// src/components/VehicleCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VehicleCard } from './VehicleCard';

describe('VehicleCard', () => {
  const mockVehicle = {
    id: '1',
    modelo: 'Fiat Uno',
    placa: 'ABC1234',
    status: 'disponivel' as const,
    km_atual: 50000,
    valor_diaria: 100,
  };

  it('deve renderizar informações do veículo', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    
    expect(screen.getByText('Fiat Uno')).toBeInTheDocument();
    expect(screen.getByText(/ABC1234/)).toBeInTheDocument();
    expect(screen.getByText(/R\$ 100\.00/)).toBeInTheDocument();
  });

  it('deve mostrar badge de status correto', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    
    const badge = screen.getByText('disponivel');
    expect(badge).toHaveClass('bg-green-500');
  });

  it('deve chamar onEdit ao clicar em Editar', () => {
    const onEdit = vi.fn();
    render(<VehicleCard vehicle={mockVehicle} onEdit={onEdit} />);
    
    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);
    
    expect(onEdit).toHaveBeenCalledWith(mockVehicle.id);
  });
});
```

#### 7. **Testes de Hooks**

```typescript
// src/hooks/useVeiculos.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useVeiculos } from './useVeiculos';
import { supabase } from '@/integrations/supabase/client';

describe('useVeiculos', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('deve carregar veículos com sucesso', async () => {
    const mockVeiculos = [
      { id: '1', modelo: 'Fiat Uno', placa: 'ABC1234' },
      { id: '2', modelo: 'VW Gol', placa: 'XYZ5678' },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockVeiculos,
          error: null,
        }),
      }),
    } as any);

    const { result } = renderHook(() => useVeiculos(), { wrapper });

    await waitFor(() => {
      expect(result.current.veiculos).toEqual(mockVeiculos);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('deve lidar com erro ao carregar veículos', async () => {
    const mockError = new Error('Erro ao carregar');

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    } as any);

    const { result } = renderHook(() => useVeiculos(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.veiculos).toEqual([]);
    });
  });
});
```

#### 8. **Scripts de Teste**

```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```

### Checklist de Testing

Antes de cada deploy:
- [ ] Cobertura de testes > 80%
- [ ] Todos os testes passando
- [ ] Testes unitários para utils
- [ ] Testes de componentes críticos
- [ ] Testes de hooks customizados
- [ ] Testes de integração com Supabase
- [ ] E2E para fluxos críticos
- [ ] Sem testes flaky
- [ ] CI/CD executando testes
- [ ] Coverage report gerado

---

## 🚀 Deploy & DevOps

### Ferramentas Essenciais

#### 1. **Deployment Procedures Skill**
**Localização**: `.agent/skills/deployment-procedures/`

#### 2. **Vercel Deploy (Recomendado)**

**Configuração**:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

**vercel.json**:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_PUBLISHABLE_KEY": "@supabase-key"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

#### 3. **GitHub Actions CI/CD**

```.github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npx tsc --noEmit
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

#### 4. **Environment Variables**

**Desenvolvimento (.env.local)**:
```env
VITE_SUPABASE_URL="https://dev-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGc..."
VITE_SUPABASE_PROJECT_ID="dev-project-id"
```

**Produção (Vercel Dashboard)**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

#### 5. **Monitoring & Analytics**

**Sentry para Error Tracking**:

```typescript
// src/lib/sentry.ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
});
```

**Vercel Analytics**:

```typescript
// src/main.tsx
import { Analytics } from '@vercel/analytics/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);
```

### Checklist de Deploy

Antes de cada deploy:
- [ ] Todos os testes passando
- [ ] Build sem erros
- [ ] Environment variables configuradas
- [ ] Migrations aplicadas no Supabase
- [ ] RLS policies ativas
- [ ] Lighthouse score > 90
- [ ] Sentry configurado
- [ ] Analytics configurado
- [ ] Backup do banco feito
- [ ] Rollback plan definido

---

## 📊 Checklist de Qualidade

### Checklist Completo Pré-Deploy

#### Segurança
- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas RLS testadas
- [ ] Secrets em variáveis de ambiente
- [ ] Input validation com Zod
- [ ] XSS protection ativa
- [ ] CORS configurado
- [ ] Rate limiting ativo
- [ ] Security scan executado

#### Performance
- [ ] Lighthouse score > 90
- [ ] LCP < 2.5s
- [ ] INP < 200ms
- [ ] CLS < 0.1
- [ ] Bundle size < 500KB
- [ ] Code splitting implementado
- [ ] Imagens otimizadas
- [ ] React Query configurado

#### Design & UX
- [ ] Mobile-first implementado
- [ ] Responsivo em todos os breakpoints
- [ ] Touch targets ≥ 44-48px
- [ ] Contraste WCAG AA
- [ ] Navegação por teclado
- [ ] ARIA labels
- [ ] Loading states
- [ ] Error states

#### Code Quality
- [ ] ESLint sem erros
- [ ] TypeScript strict mode
- [ ] Funções < 20 linhas
- [ ] Sem código duplicado
- [ ] Sem console.log
- [ ] Sem magic numbers
- [ ] Nomes descritivos

#### Testing
- [ ] Cobertura > 80%
- [ ] Testes unitários
- [ ] Testes de componentes
- [ ] Testes de hooks
- [ ] E2E para fluxos críticos
- [ ] Todos os testes passando

#### Database
- [ ] Migrations aplicadas
- [ ] Índices criados
- [ ] Triggers funcionando
- [ ] Functions testadas
- [ ] Backup configurado
- [ ] Tipos TypeScript gerados

#### Deploy
- [ ] Build sem erros
- [ ] Environment variables
- [ ] CI/CD funcionando
- [ ] Monitoring ativo
- [ ] Analytics configurado
- [ ] Rollback plan

---

## 🎯 Scripts de Validação Automática

### Master Validation Script

```bash
#!/bin/bash
# validate-all.sh

echo "🚀 CarControl - Validação Completa"
echo "=================================="

# Segurança
echo "🔐 Executando Security Scan..."
python .agent/skills/vulnerability-scanner/scripts/security_scan.py .

# Performance
echo "⚡ Executando Performance Audit..."
python .agent/skills/performance-profiling/scripts/lighthouse_audit.py http://localhost:5173

# Frontend
echo "🎨 Executando UX Audit..."
python .agent/skills/frontend-design/scripts/ux_audit.py .

# Mobile
echo "📱 Executando Mobile Audit..."
python .agent/skills/mobile-design/scripts/mobile_audit.py .

# Database
echo "🗄️ Executando Schema Validation..."
python .agent/skills/database-design/scripts/schema_validator.py .

# Testing
echo "🧪 Executando Tests..."
npm run test:coverage

# Linting
echo "✨ Executando Linter..."
npm run lint

# Type Check
echo "📝 Executando Type Check..."
npx tsc --noEmit

echo "=================================="
echo "✅ Validação Completa Finalizada!"
```

### Package.json Scripts

```json
{
  "scripts": {
    "validate": "bash validate-all.sh",
    "validate:security": "python .agent/skills/vulnerability-scanner/scripts/security_scan.py .",
    "validate:performance": "python .agent/skills/performance-profiling/scripts/lighthouse_audit.py http://localhost:5173",
    "validate:ux": "python .agent/skills/frontend-design/scripts/ux_audit.py .",
    "validate:mobile": "python .agent/skills/mobile-design/scripts/mobile_audit.py .",
    "validate:db": "python .agent/skills/database-design/scripts/schema_validator.py ."
  }
}
```

---

## 📚 Referências Rápidas

### Skills Disponíveis

| Skill | Localização | Comando |
|-------|-------------|---------|
| **Vulnerability Scanner** | `.agent/skills/vulnerability-scanner/` | `python scripts/security_scan.py .` |
| **Performance Profiling** | `.agent/skills/performance-profiling/` | `python scripts/lighthouse_audit.py <url>` |
| **Frontend Design** | `.agent/skills/frontend-design/` | `python scripts/ux_audit.py .` |
| **Mobile Design** | `.agent/skills/mobile-design/` | `python scripts/mobile_audit.py .` |
| **Database Design** | `.agent/skills/database-design/` | `python scripts/schema_validator.py .` |
| **API Patterns** | `.agent/skills/api-patterns/` | `python scripts/api_validator.py .` |
| **Testing Patterns** | `.agent/skills/testing-patterns/` | `python scripts/test_runner.py .` |
| **Clean Code** | `.agent/skills/clean-code/` | - |
| **React Patterns** | `.agent/skills/react-patterns/` | - |
| **Tailwind Patterns** | `.agent/skills/tailwind-patterns/` | - |

### Documentação Completa

| Documento | Localização |
|-----------|-------------|
| **Supabase Complete** | `.agent/supabase-complete-skill.md` |
| **Architecture** | `.agent/ARCHITECTURE.md` |
| **Squad Dashi** | `.agent/squaddashi.md` (este arquivo) |

---

## 🎓 Como Usar Este Squad

### Para Desenvolvedores

1. **Antes de começar uma feature**:
   - Ler a seção relevante deste documento
   - Executar os scripts de validação
   - Seguir os padrões estabelecidos

2. **Durante o desenvolvimento**:
   - Seguir princípios de Clean Code
   - Escrever testes
   - Validar responsividade
   - Verificar segurança

3. **Antes de fazer commit**:
   - Executar `npm run validate`
   - Corrigir todos os erros
   - Verificar checklist de qualidade

4. **Antes de fazer deploy**:
   - Executar checklist completo
   - Validar em ambiente de staging
   - Fazer backup do banco
   - Preparar rollback plan

### Para Agentes AI

1. **Sempre consultar este documento** antes de implementar features
2. **Executar scripts de validação** após cada mudança
3. **Seguir os padrões estabelecidos** rigorosamente
4. **Priorizar**: Segurança > Performance > Clean Code > Features

---

## 📝 Notas Finais

- ✅ **Testado em produção**: Padrões validados em projetos reais
- ✅ **Atualizado**: Abril 2026 - Tecnologias mais recentes
- ✅ **Completo**: Cobre 100% do ciclo de desenvolvimento
- ✅ **Prático**: Exemplos de código prontos para uso

**Última atualização**: Abril 2026  
**Versão**: 1.0  
**Autor**: Squad Dashi Team  
**Projeto**: CarControl - Sistema de Gestão de Frotas

---

> **Lembre-se**: Este documento é um guia vivo. Atualize-o conforme o projeto evolui e novos padrões são estabelecidos.

