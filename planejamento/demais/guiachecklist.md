# 📋 Guia do Módulo de Checklist Inteligente — DashiDrive

Este documento detalha a implementação, funcionalidades e instruções de uso do novo módulo de **Checklist Inteligente** do sistema DashiDrive. Este módulo foi projetado para ser *mobile-first*, juridicamente seguro e ultra-performático.

---

## 🛠️ O que foi feito (Resumo Técnico)

A implementação seguiu rigorosamente os padrões de engenharia do **Squad Dashi**, dividida em quatro fases críticas:

1.  **Infraestrutura de BD e Storage**:
    *   Criação das tabelas `carcontrol_checklists` e `carcontrol_checklist_images` com suporte a multitenancy.
    *   Configuração de bucket no Supabase Storage com políticas de RLS granulares.
    *   Implementação de funções PostgreSQL (RPC) para comparação de fotos e cálculo de progresso.

2.  **Interface Mobile (UI/UX)**:
    *   Desenvolvimento de componentes com estilo *Neu-morphism* para uma experiência moderna e tátil.
    *   Sistema de **captura guiada** com feedback em tempo real.
    *   Grid de imagens inteligente com suporte a zoom e visualização de metadados.

3.  **Inteligência e Processamento**:
    *   **Compressão Local**: Conversão automática de fotos para WebP e redimensionamento antes do upload, economizando até 80% de banda.
    *   **Marca D'Água Dinâmica**: Injeção de dados (Placa, Data, Empresa) via Canvas API para validade jurídica.
    *   **Upload Triplo**: Armazenamento automático da versão Original, Thumbnail e Watermarked.

4.  **Integração de Fluxo**:
    *   Conexão total com os dados de veículos e motoristas do sistema.
    *   Geração automática de **Alertas Críticos** para vistorias de avaria.
    *   Preparação para geração e compartilhamento de relatórios em PDF.

---

## 📍 Páginas de Acesso (Rotas Mobile)

O módulo está integrado ao fluxo mobile e pode ser acessado através das seguintes rotas:

| Página | Rota | Descrição |
| :--- | :--- | :--- |
| **Lista de Vistorias** | `/mobile/checklists` | Central de busca e histórico de todas as vistorias. |
| **Nova Vistoria** | `/mobile/checklists/novo` | Formulário para selecionar veículo e tipo de vistoria. |
| **Painel de Captura** | `/mobile/checklists/:id` | Interface principal de fotos e finalização. |
| **Comparação Visual** | `/mobile/checklists/:id/comparar` | Ferramenta para comparar fotos atuais com vistorias passadas. |

> **Dica**: Você também pode acessar o histórico de vistorias diretamente na página de **Detalhes do Veículo** na versão desktop/web.

---

## 🚀 Como Utilizar (Passo a Passo)

### 1. Iniciando uma Vistoria
1.  Acesse o menu **Checklists** no seu dispositivo mobile.
2.  Clique no botão **(+) Novo**.
3.  Selecione o **Tipo de Checklist** (ex: Entrega, Devolução ou Avaria).
4.  Escolha o **Veículo** pela placa e, se necessário, vincule o **Motorista**.
5.  Clique em **Iniciar Captura**.

### 2. Capturando as Fotos
1.  O sistema apresentará um **Stepper** (passo a passo) no topo.
2.  Para cada etapa (ex: Frente, Lateral), clique no card da câmera.
3.  Tire a foto ou escolha da galeria.
4.  Confira se a imagem está clara e clique em **Confirmar**.
5.  O sistema avançará **automaticamente** para o próximo passo pendente.

### 3. Revisão e Finalização
1.  Acesse a aba **Resumo** para ver todas as fotos capturadas.
2.  Se notar algo errado, você pode excluir e tirar a foto novamente.
3.  Quando todos os passos obrigatórios estiverem concluídos, clique em **Finalizar Checklist**.
4.  *Nota: Se for uma "Avaria", o sistema enviará um alerta imediato para a gestão.*

### 4. Gerando o Relatório
1.  Após finalizar, vá para a aba **Relatório**.
2.  Clique em **Gerar Relatório PDF**.
3.  Uma vez gerado, você poderá **Ver**, **Baixar** ou **Compartilhar** (via WhatsApp, E-mail, etc.) o documento oficial.

### 5. Comparando Vistorias
1.  Na página de um checklist já existente, clique na opção de **Comparação**.
2.  Selecione um checklist anterior do mesmo veículo.
3.  Navegue pelas fotos lado a lado para identificar novos danos ou mudanças no estado do veículo.

---

## 🔒 Segurança e Performance

*   **Offline First**: O sistema foi preparado para lidar com instabilidades de conexão durante a captura.
*   **Privacidade**: Graças ao Row Level Security (RLS), apenas usuários autorizados da sua empresa podem ver as fotos e relatórios.
*   **Otimização**: As fotos são carregadas via thumbnails no grid, garantindo que a página abra instantaneamente mesmo com dezenas de registros.

---

**Squad DashiDrive**  
*Inovação em Gestão de Frotas*  
📅 16 de Maio de 2026
