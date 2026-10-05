O objetivo é criar um **Portal do Lojista (Portal do Losjista)** conectado ao ecossistema DashiDrive, eu focaria em uma experiência extremamente simples, comercial e orientada a conversão.

O lojista não está entrando para gerenciar empresa.

Ele está entrando para:

* Encontrar compradores.
* Receber oportunidades.
* Enviar propostas.
* Fechar vendas.
* Acompanhar resultados.

---

# PROMPT — CRIAÇÃO DO FRONT-END DO Portal do Losjista DASHIDRIVE

Crie um novo ambiente chamado **Portal do Lojista**, seguindo exatamente o mesmo Design System utilizado atualmente na DashiDrive, NAS PÁGINAS DE GESTÃO. Páginas com foco em desktop mas 100% responsivas:

## IMPORTANTE: UTILIZE EXATAMENTE O MESMO ESTILO!

* React + Vite
* TailwindCSS
* shadcn/ui
* Framer Motion
* Visual Mobile-Premium
* Glassmorphism
* Sidebar lateral igual ao ERP atual
* Cards modernos
* Responsividade completa
* Dark Theme por padrão

O objetivo do Portal do Losjista é conectar lojistas de veículos às locadoras cadastradas na DashiDrive.

O Portal do Losjista deve ser totalmente separado visualmente do ERP das locadoras.

O usuário lojista nunca deve visualizar:

* Veículos da locadora
* Motoristas
* Financeiro
* Checklists
* Marketplace de locação

Ele deve visualizar apenas ferramentas relacionadas à venda de veículos para locadoras.

---

# PROMPT OFICIAL

# Portal do Losjista DASHIDRIVE

Criar um novo ambiente chamado: Portal do Losjista

# Portal do Losjista

O Portal do Losjista é uma área exclusiva para lojistas e concessionárias parceiras.

Seu objetivo é permitir que lojistas encontrem oportunidades reais de venda para locadoras cadastradas na DashiDrive.

O sistema NÃO possui chat interno.

O principal CTA da plataforma é:

```txt
Conversar via WhatsApp
```

Toda negociação ocorre fora da plataforma.

A plataforma serve para:

* descobrir oportunidades
* apresentar estoque
* acompanhar métricas
* gerar interações rastreáveis

---

# DIRETRIZES VISUAIS

Seguir exatamente o mesmo padrão visual da DashiDrive:

* React
* Vite
* Tailwind
* Shadcn
* Framer Motion
* Dark Theme
* Glassmorphism
* Sidebar Premium
* Layout Enterprise
* Mobile First

Visual idÇentico ao que já estamos trabalhando nas páginas de Gestçao.
---

# SIDEBAR DO LOJISTA

Recriar o mesmo padrão visual da sidebar atual da DashiDrive (FAÇA UMA CÓPIA DO SIDEBAR → C:\Projects\dashidrive2026\src\components\layout\Sidebar.tsx ← ADAPTADO PARA A NECESSIDADE DO LOJISTA).
Utilizar a mesma sidebar utilizada atualmente no ERP DashiDrive.

Itens:

```txt
Losjista Hub
Oportunidades
Meu Estoque
Analytics
Assinatura
Perfil
Configurações
```

Rodapé:

```txt
Logo da Loja
Nome da Loja
Plano Atual
```

---

# PÁGINA 1

# PortaldoLosjista.tsx

Página inicial.

Objetivo:

Mostrar uma visão geral da operação comercial.

---

KPIs

```txt
Oportunidades Disponíveis
Interações Realizadas
Leads Ativados
Vendas Confirmadas
Taxa de Conversão
```

---

Gráfico

```txt
Interações por mês
```

---

Cards rápidos

```txt
Ver Oportunidades
Cadastrar Veículo
Atualizar Estoque
```

---

Tabela

```txt
Últimas oportunidades acessadas
```

---

# PÁGINA 2

# Oportunidades.tsx

Página principal do sistema.

Objetivo:

Listar todas as demandas publicadas pelas locadoras.

---

Filtros

```txt
Estado
Cidade
Modelo
Faixa de Preço
Quantidade
Data
```

---

Cards de oportunidade

Cada card deve exibir:

```txt
Locadora(DEVE APARECER SOMENTE AS 3 PRIMEIRAS LETRAS DO NOME DA LOCADORA, PARA EVITAR QUE O LOJISTA A PROCURE PESQUISANDO NA INTERNET)
Cidade
Estado

Modelo Procurado

Quantidade

Orçamento

Data de publicação
```

---

Botão principal

```txt
Conversar via WhatsApp
```

Botão secundário

```txt
Ver Detalhes (ABRIRÁ UM MODAL COM OS DETALHES DA SOLICITAÇÃO, COMO SE FOSSE UM POP-UP COM OS DETALHES)
```

---

# PÁGINA 3

# OportunidadeDetalhe.tsx

Objetivo:

Visualizar uma necessidade específica da locadora.

---

Seção 1

Dados da locadora

```txt
Nome
Cidade
Estado
Tempo na plataforma
```

---

Seção 2

Necessidade

```txt
Modelo
Ano mínimo
Quantidade
Orçamento
Observações
```

---

Seção 3

Resumo visual

```txt
Categoria
Urgência
Data de publicação
```

---

CTA principal

Botão gigante:

```txt
Conversar via WhatsApp
```

Ao clicar:

Frontend deve exibir modal elegante:

```txt
Você será conectado ao time DashiDrive para iniciar esta negociação.
```

Botão:

```txt
Continuar para WhatsApp
```

---

# PÁGINA 4

# MeuEstoque.tsx

Objetivo:

Permitir que o lojista gerencie os veículos disponíveis.

---

Tabela

```txt
Foto
Modelo
Ano
KM
Preço
Cidade
Status
```

---

Status

```txt
Disponível
Reservado
Vendido
```

---

Botões

```txt
Editar
Arquivar
Duplicar
```

---

CTA

```txt
Adicionar Veículo
```

---

# PÁGINA 5

# VeiculoDetalhe.tsx

Objetivo:

Visualizar veículo do estoque.

---

Bloco

Informações

```txt
Modelo
Ano
KM
Motor
Combustível
Transmissão
```

---

Bloco

Comercial

```txt
Preço
Condição
Disponibilidade
```

---

Bloco

Galeria

Grid responsivo de imagens.

---

# PÁGINA 6

# NovoVeiculo.tsx

Objetivo:

Cadastrar novo veículo.

---

Campos

```txt
Modelo
Marca
Ano
KM
Valor
Cidade
Estado
Descrição
```

---

Upload

```txt
Fotos
```

---

Botão

```txt
Salvar Veículo
```

---

# PÁGINA 7

# Analytics.tsx

Objetivo:

Mostrar performance comercial.

---

KPIs

```txt
Oportunidades Visualizadas
Interações Geradas
Taxa de Conversão
Vendas Confirmadas
```

---

Gráficos

```txt
Interações por mês

Estados com maior demanda

Modelos mais procurados
```

---

Tabela

```txt
Últimas conversões
```

---

# PÁGINA 8

# Assinatura.tsx

Objetivo:

Gerenciar plano do lojista.

---

Card principal

```txt
Plano Atual

Data Renovação

Benefícios
```

---

Comparativo

```txt
Lojista Free

Lojista Pro

Lojista Elite
```

---

Botões

```txt
Fazer Upgrade

Gerenciar Assinatura
```

---

# PÁGINA 9

# Perfil.tsx

Objetivo:

Perfil público da loja.

---

Campos

```txt
Logo
Nome da Empresa
WhatsApp(NÃO FICA DISPONÍVEL PUBLICAMENTE)
Telefone(NÃO FICA DISPONÍVEL PUBLICAMENTE)
Email(NÃO FICA DISPONÍVEL PUBLICAMENTE)
Website(NÃO FICA DISPONÍVEL PUBLICAMENTE)
```

---

Seções

```txt
Sobre a Empresa

Marcas Trabalhadas

Regiões Atendidas
```

---

# PÁGINA 10

# Configuracoes.tsx

Objetivo:

Preferências da conta.

---

Seções

```txt
Notificações

Usuários

Segurança

Privacidade
```

---

# EXPERIÊNCIA FINAL

O lojista deve sentir que entrou em: Uma central oficial de oportunidades de compra de frota, E não em um marketplace comum.

A ação principal de toda a plataforma é:

```txt
Conversar via WhatsApp
```

A plataforma existe para gerar e rastrear oportunidades.

A negociação acontece fora dela.

A DashiDrive atua como intermediadora e registradora da interação inicial.
