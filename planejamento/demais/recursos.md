# Recursos da Plataforma DashiDrive — 2026

**Versão:** 2.5 (Enterprise-Ready)  
**Data da Atualização:** 22 de Junho de 2026  
**Status:** ✅ Pronto para Escala Comercial

Este documento detalha **todos os recursos e funcionalidades** implementados na plataforma **DashiDrive**, uma solução completa e integrada para gestão de frotas, controle financeiro, vistorias veiculares, manutenção e um marketplace inovador de locação.

---

## 1. Dashboard e Visão Analítica — Comando Central

A central de comando do gestor com visão em tempo real da saúde do negócio.

### KPIs em Tempo Real (50ms Response)
- **Receita Estimada:** Soma de todos os aluguéis pendentes e confirmados
- **Saldo Total a Receber:** Diferença entre receitas futuras e despesas
- **Custos Totais:** Manutenções + parcelas de seguros + despesas diversas
- **Pagamentos em Atraso:** Número de motoristas em inadimplência com valores
- **Status da Frota:** Gráfico visual de distribuição (Disponível, Alugado, Oficina, Inativo)

### Gráficos Interativos (Recharts)
- **Fluxo de Caixa:** Receitas vs. despesas por período
- **Receita por Veículo:** Ranking de veículos mais lucrativos
- **Evolução Mensal:** Tendência de receita sobre últimos 12 meses

### Filtros Temporais Avançados
- Dia, semana, mês, ano com seletor customizado
- Comparação período anterior (crescimento %)
- Exportação de dados em CSV

---

## 2. Gestão de Frota (Veículos) — Patrimônio Core

Controle detalhado de cada ativo da empresa com histórico completo.

### Inventário Completo
- **Dados Básicos:** Placa (PK), modelo, marca, ano, cor, KM atual
- **Economia:** Consumo de combustível, tipo de combustível
- **Financeiro:** Valor de diária, valor de compra, depreciação
- **Status:** Disponível, Alugado, Oficina, Inativo, Vendido
- **Documentos:** CNH do motorista, Seguro, IPVA, Licenciamento

### Dossiê do Veículo (Página de Detalhe)
- **Histórico de Manutenções:** Listagem completa com datas, custos, KM
- **Histórico Financeiro:** Receitas e despesas vinculadas à placa
- **Galeria de Fotos:** Fotos cadastrais do veículo
- **Gestão de Documentos:** Upload de CNH, seguros, certificados, notas fiscais
- **Localização:** GPS e histórico de movimentação
- **Odômetro:** Acompanhamento de KM com histórico

### Filtros e Busca
- Busca por placa, modelo, marca
- Filtro por status, combustível, faixa de preço
- Ordenação por KM, receita, data de aquisição

### Operações em Lote
- Alterar status de múltiplos veículos simultaneamente
- Adicionar manutenção agendada para frota inteira
- Exportar relatório de frotas em PDF/CSV

---

## 3. Gestão de Motoristas e Colaboradores — Capital Humano

Administração completa do relacionamento com condutores.

### Cadastro Estruturado
- **Dados Pessoais:** Nome, CPF, data nascimento, estado civil, endereço, telefone, e-mail
- **CNH:** Número, categoria, data validade, data emissão, UF
- **Documentos:** RG, comprovante de residência
- **Relacionamento:** Data início, status (Ativo, Inativo, Bloqueado)

### Perfil do Motorista
- **Histórico de Locações:** Todos os veículos alugados com datas
- **Rating:** Estrelas (1-5) baseado em avaliações
- **Histórico de Pagamentos:** Quitações, atrasos, multas
- **Inadimplência:** Flag visual, valor total em atraso, data da última falha

### Controle de Inadimplência
- **Dashboard Motoristas:** Visualização instantânea de inadimplentes
- **Alertas Automáticos:** Notificação quando x dias de atraso
- **Ações Rápidas:** Bloquear, gerar cobrança, renegociar

### Quitações em Lote
- Marcar múltiplos pagamentos como recebidos
- Integração automática com Asaas
- Histórico de quitações salvo por data/usuário

---

## 4. Controle Financeiro Avançado — Nervosismo do Negócio

Gestão rigorosa de todas as movimentações monetárias com histórico auditável.

### Pagamentos e Recebimentos
- **Registros de Receita:** Aluguéis, serviços extras, multas, caução
- **Registros de Despesa:** Manutenção, combustível, seguros, impostos
- **Método de Pagamento:** Dinheiro, TED, PIX, Boleto, Crédito (Asaas integrado)
- **Integração Asaas:** Sincronização automática
  - Crédito em conta (recebimento automático)
  - Boleto (geração e rastreamento)
  - PIX (confirmação instantânea)

### Pagamentos Programados (Recorrências)
- **Configuração:** Frequência (Diária, Semanal, Mensal), data início/fim
- **Projeção Automática:** Sistema calcula todas as datas futuras
- **Histórico:** Registro de qual motorista/veículo tem qual recorrência

### Parcelas e Seguros
- **Módulo Dedicado:** Gestão de financiamentos de veículos
- **Parcelas de Seguro:** Registro de todas as parcelas obrigatórias
- **Calendário de Vencimentos:** Alertas quando parcela vence
- **Automação:** RLS calcula juros/multa se necessário

### Análise de Lucratividade Detalhada
- **Por Veículo:** Receita total - custos fixos = lucro real
- **Comparativo:** Ranking de veículos mais lucrativos
- **Projeção Anual:** Extrapolação com base nos últimos 3 meses
- **Margem de Lucro:** Percentual de lucro sobre receita
- **ROI de Investimento:** Tempo para amortizar custo do veículo

---

## 5. Sistema de Manutenção e Oficina — Durabilidade do Patrimônio

Rastreabilidade completa de custos e disponibilidade de veículos.

### Agendamento de Serviços
- **Tipos:** Preventiva, Corretiva, Revisão, Inspeção
- **KM:** Quilometragem em que o serviço foi realizado
- **Data de Agendamento:** Quando será realizado
- **Descrição:** Detalhes do serviço
- **Status:** Agendado, em execução, concluído, cancelado

### Controle de Custos
- **Entrada de Peças:** Listagem de peças gastas com valores
- **Mão de Obra:** Valor cobrado pelo mecânico
- **Total:** Custo total do serviço
- **Integração Financeira:** Lançamento automático nas despesas

### Histórico de KM e Maintenance Log
- **Timeline:** Visualização cronológica de todos os serviços
- **KM Progression:** Gráfico de KM vs. data
- **Avisos Preventivos:** Alerta quando 6 meses ou 5k km passaram

### Anexos e Documentação
- **Upload de Notas Fiscais:** Storage em Supabase
- **Fotos de Antes/Depois:** Comprovação visual do serviço
- **Garantia de Peças:** Registro de garantia instalada

---

## 6. Sistema de Checklists e Vistorias — Proteção do Ativo

Garantia de conservação do patrimônio através de inspeções fotográficas com PDF e WhatsApp.

### Tipos de Vistoria
- **Entrega:** Quando motorista retira o veículo
- **Devolução:** Quando veículo volta de locação
- **Avaria:** Quando detectado dano durante uso
- **Pós-Manutenção:** Comprovação de manutenção realizada

### Captura de Evidências (Mobile Premium)
- **Fotos Estruturadas:** Frente, traseira, laterais, interior, motor
- **Resolução:** Câmera nativa do device
- **Storage:** Supabase Storage com URL persistente
- **Metadados:** Lat/Long (GPS), timestamp, ID motorista, ID veículo

### Notas e Detalhes Granulares
- **Nota por Foto:** Observação para cada foto
- **Descrição Geral:** Resumo da vistoria
- **Checklist:** Items pré-definidos (ex: Lanternas?, Pneus?, Vidros?)

### Geração de Relatórios (PDF)
- **Template Profissional:** Logo, dados veículo, dados motorista, fotos
- **Automático:** PDF gerado instantaneamente
- **Armazenamento:** Salvo em Storage com link compartilhável

### Compartilhamento Instantâneo
- **WhatsApp:** Envio direto via WhatsApp Business API
- **E-mail:** Automático para motorista + gerenciador
- **Link:** URL segura para visualizar online

### Comparação de Vistorias
- **Feature Única:** Comparar 2 checklists lado a lado
- **Uso:** Detectar novas avarias entre entrega e devolução
- **Relatório de Danos:** Lista automática de danos novos

---

## 7. Marketplace de Locação e Serviços — Novo Ecossistema ✅

Conexão inteligente entre locadoras (providers) e motoristas (seekers).

### Busca e Descoberta (Experiência Motorista/Seeker)

#### **Landing Page Premium**
- Hero section com CTA "Encontrar Veículo Perfeito"
- Categorias destacadas (Uber/99, Dug, Particular)
- Ratings, avaliações, casos de sucesso

#### **Busca com Filtros Avançados**
- **Filtros:** Preço, combustível, câmbio, ano, quilometragem, localização
- **Ordenação:** Preço, popularidade, rating, mais recente
- **Busca Textual:** Por modelo, marca, ou nome da locadora

#### **Ficha Detalhada do Anúncio**
- **Carrossel de Fotos:** Múltiplas imagens do veículo
- **Especificações:** Motor, potência, consumo, cor, versão
- **Preço e Condições:**
  - Valor da diária
  - Caução requerida
  - Franquia de KM
  - Benefícios inclusos
- **Perfil da Locadora:** Nome, rating ⭐, número de aluguel, tempo de resposta
- **Disponibilidade:** Calendário interativo

#### **Meu Histórico de Propostas**
- **Dashboard Seeker:** Propostas com status (Pendente, Aceita, Recusada, Concluída)
- **Filtros:** Por data, status, valor, locadora
- **Ações:** Cancelar proposta, enviar mensagem, ver rating

#### **Sistema de Favoritos**
- Salvar anúncios para consulta posterior
- Notificação quando veículo muda de preço

### Gestão de Ofertas (Experiência Locadora/Provider)

#### **Painel "Meus Anúncios"**
- **Dashboard de Performance:** 
  - Número de visualizações
  - Número de propostas
  - Taxa de conversão
  - Receita total gerada
  - Período com maior demanda

#### **Dicas de Conversão**
- Sistema recomenda ações
- Sugestões de preço (comparativo com mercado)
- Best practices (ex: "Anúncios com 5+ fotos convertem 3x mais")

#### **Criar Novo Anúncio**
- **Fluxo Mobile Optimizado:**
  1. Selecionar veículo da frota
  2. Upload de fotos (até 10)
  3. Preencher especificações
  4. Definir preço e condições
  5. Adicionar benefícios
  6. Publicar (instantâneo)

#### **Análise de Propostas Recebidas**
- **Card por Proposta:** 
  - Foto do motorista (CNH)
  - Nome e rating
  - Data desejada e duração
  - Valor oferecido
  - Referências
  
- **Ações:** Aceitar, recusar, ou negociar
- **Score de Risco:** Marca motoristas com histórico de atrasos

#### **Status do Anúncio**
- Ativo (aparece em buscas)
- Pausado (oculto)
- Alugado (reservado até data fim)
- Vendido (removido permanentemente)

### Categorias Suportadas (Marketplace Aberto)

#### ✅ **Locação de Veículos** (Core Business)
- Motos, carros, vans, utilitários
- Filtros por tipo, combustível, capacidade

#### ✅ **Peças Automotivas**
- Fornecedores podem listar peças
- Sistema de avaliação
- Entrega via motoboy ou retirada

#### ✅ **Acessórios**
- Spoilers, rodas, sistema áudio
- Filtros por compatibilidade

#### ✅ **Serviços**
- Mecânica, alinhamento, balanceamento
- Serviços estéticos
- Avaliações de mecânicos

### Checkout e Pagamento (B2B Seguro)

#### **Fluxo de Checkout**
1. **Resumo do Aluguel:** Veículo, datas, preço total, caução
2. **Dados do Motorista:** CPF, CNH, contato (pré-preenchido)
3. **Método de Pagamento:** Asaas integrado
4. **Termos e Condições:** Contrato de locação
5. **Confirmação:** Número de proposta, QR code

#### **Proteção Comercial**
- Caução bloqueada até devolução
- Seguro obrigatório (cobertura básica)
- Franquia de KM

---

## 8. Multi-Tenant e Gestão de Usuários — Segurança Absoluta

Estrutura enterprise com isolamento total.

### Isolamento por Empresa (Row Level Security - RLS)
- **Cada locadora vê apenas seus dados:**
  - Seus veículos, motoristas, pagamentos, vistorias
  - Suas métricas, relatórios, anúncios
  
- **Isolamento no Banco de Dados:**
  - Todas as operações filtradas por `company_id`
  - Impossível acessar dados de outra empresa
  - Auditoria completa

### Onboarding de Empresa
- **Fluxo Simplificado:**
  1. Nome da empresa, CNPJ, contato
  2. Cria first admin user
  3. Integra com Asaas (API keys)
  4. Trial de 14 dias (grátis)

### Níveis de Acesso (Roles - RBAC)
- **`USER`:** Operação padrão
- **`ADMIN`:** Gestão total da empresa
- **`DASHI`:** Acesso técnico especializado
- **`DASHI_ADMIN`:** Acesso admin para Dashi
- **`SERVICE_ROLE`:** Role interna de serviço

### Gestão de Equipe (Admin Only)
- **Adicionar Usuários:** Enviar convite via e-mail
- **Remover Usuários:** Revoga acesso instantaneamente
- **Histórico:** Logs de quem foi adicionado/removido

### Perfil de Usuário
- **Dados Pessoais:** Nome, CPF, telefone, e-mail
- **Empresa:** Qual empresa o usuário pertence
- **Preferências:** Tema (light/dark), idioma, notificações
- **Integração:** Chave Asaas (se admin)

---

## 9. Alertas e Notificações — Proatividade Total

Sistema inteligente para evitar esquecimentos críticos.

### Centro de Notificações (Realtime)
- **Badge:** Contador de notificações não lidas
- **Painel:** Listagem de últimas 50 notificações
- **Busca:** Filtro por tipo, período, leitura

### Tipos de Alertas Críticos
- **Faturas Vencidas:** Avisos para motoristas inadimplentes
- **Manutenções Atrasadas:** Veículo com serviço preventivo vencido
- **Documentos Próximos do Vencimento:**
  - CNH do motorista (7 dias antes)
  - Seguro do veículo (30 dias antes)
  - Licenciamento/IPVA (60 dias antes)
  
- **Novas Propostas no Marketplace:** Quando motorista faz proposta
- **Pagamentos Confirmados:** Confirmação de recebimento via Asaas
- **Avarias Reportadas:** Quando vistoria detecta danos novos

### Painel de Prioridades
- **Classificação:** Baixa, Média, Alta, Crítica
- **Exemplos:**
  - Crítica: Faturas 30+ dias atrasadas
  - Alta: CNH vencendo em 7 dias
  - Média: Manutenção vencendo em 30 dias
  - Baixa: Sugestões de otimização marketplace

### Integração WhatsApp
- **Notificações Push:** Mensagens para WhatsApp Business
- **Notificações Motorista:** WhatsApp quando checklist gera PDF

---

## 10. Experiência Mobile-Premium — Interface de Alto Impacto

Interface premium otimizada para uso intensivo no campo.

### Design Mobile-Premium
- **Neumorfismo:** Efeitos 3D soft (buttons, cards)
- **Glassmorfismo:** Transparências com blur
- **Animações Fluidas:** 60fps com Framer Motion
- **Tema Claro/Escuro:** Automático ou manual
- **Tipografia Premium:** Weights variados, tamanhos legíveis

### Navegação Contextual
- **Layout Desktop:** Sidebar fixo, header com search
- **Layout Mobile:** Bottom navigation tab-based + top header
- **Layout Marketplace:** Header premium, logo centralizado, busca em destaque

### Operações Rápidas (Atalhos)
- **Dashboard:** Buttons flutuantes para ações comuns
  - Novo checklist
  - Registrar pagamento
  - Agendar manutenção
  - Ver alertas críticos
  
- **Dentro de Page:** Botões contextuais

### Sincronização em Tempo Real (Supabase Realtime)
- **Checklists:** Admin visualiza, outros veem em realtime
- **Notificações:** Badges update instantaneamente
- **Motoristas:** Status muda broadcast para todos
- **Pagamentos:** Confirmação Asaas em 1-2 segundos

### Responsividade Completa
- **Breakpoints:** Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)
- **Testes:** iPhone, Android, iPad, browsers desktop
- **Orientação:** Portrait e landscape em mobile

---

## 11. Integrações Avançadas — Ecossistema Conectado

### Asaas — Pagamentos Completos
- **Crédito em Conta:** Recebimento automático
- **Boleto:** Geração automática e rastreamento
- **PIX:** Confirmação instantânea
- **Webhook:** Supabase recebe notificação de confirmação
- **Anti-fraude:** Valida CPF, contas, oferece retry

### WhatsApp Business API
- **Notificações Transacionais:** Checklist PDF
- **Alertas Críticos:** Status de atrasos
- **Contato Direto:** Link de chat entre motorista e admin

### Supabase Realtime (WebSocket)
- **Notificações:** Nova proposta em <500ms
- **Sync de Status:** Admin aceita proposta, tela motorista atualiza
- **Collaborative:** Merge conflict warning se 2 admins editam mesmo registro

---

**DashiDrive** = **ERP Completo + Marketplace + Mobile Premium**  
**Tudo integrado, seguro, escalável e pronto para produção.**

---

**Última Atualização:** 22 de Junho de 2026  
**Versão:** 2.5 (Enterprise-Ready)
