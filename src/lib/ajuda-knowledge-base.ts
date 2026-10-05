export interface AjudaEntry {
  route: string;
  module: string;
  title: string;
  description: string;
  overview_text: string;
  steps: { title: string; description: string }[];
  tips: string[];
  keywords: string[];
}

const knowledgeBase: AjudaEntry[] = [
  {
    route: "/ajuda/gestao",
    module: "gestao",
    title: "Gestão",
    description: "Aprenda a utilizar todas as ferramentas do módulo de gestão da DashiDrive. Selecione um tema para ver o guia completo.",
    overview_text: "O módulo de Gestão oferece ferramentas para gerenciar toda a frota: veículos, motoristas, checklists, pagamentos, financiamentos, manutenções, lucratividade, alertas, usuários e perfil.",
    steps: [],
    tips: [],
    keywords: ["gestao", "ferramentas", "frota", "locadora"],
  },
  {
    route: "/ajuda/gestao/veiculos",
    module: "gestao",
    title: "Veículos",
    description: "O módulo de Veículos é o coração da gestão da frota. Aqui você cadastra, edita, monitora e acompanha todo o ciclo de vida de cada veículo da sua locadora.",
    overview_text: "A página de Veículos oferece uma visão completa de toda a frota em tempo real. Você pode alternar entre visualização em grade ou lista, aplicar filtros por status e acessar rapidamente as ações mais importantes como cadastrar, editar ou visualizar detalhes de cada veículo. Status disponíveis: Disponível, Alugado, Em Manutenção, Inativo.",
    steps: [
      { title: "Acessando a página de Veículos", description: "No menu lateral esquerdo, clique no ícone de Veículos ou navegue diretamente pela rota /veiculos. Você será direcionado para a lista completa da frota." },
      { title: "Visualizando a frota", description: "A tela principal exibe todos os veículos cadastrados em formato de lista ou grade. Cada card mostra informações como placa, modelo, ano e status atual." },
      { title: "Buscando e filtrando", description: "Use a barra de busca para localizar veículos por placa, modelo ou renavam. Os filtros avançados permitem refinar por status, ano, marca e categoria." },
      { title: "Cadastrando um novo veículo", description: "Clique no botão 'Novo Veículo' para abrir o formulário de cadastro. Preencha os dados obrigatórios: placa, renavam, chassi, modelo, ano, marca, cor, combustível e categoria. Documentos como CRLV podem ser anexados." },
      { title: "Editando informações", description: "No card ou linha do veículo, clique no ícone de editar (lápis) para alterar dados cadastrais. É possível atualizar fotos, documentos e status a qualquer momento." },
      { title: "Detalhes do veículo", description: "Ao clicar em um veículo, você acessa a página de detalhes com: informações gerais, histórico de aluguéis, manutenções realizadas, checklist de vistorias, documentos anexados e financeiro vinculado." },
      { title: "Excluindo veículo", description: "Para remover um veículo da frota, acesse os detalhes e clique em Excluir. A exclusão é irreversível, por isso o sistema solicita confirmação. Veículos com histórico de locação ativo não podem ser excluídos." },
    ],
    tips: [
      "Mantenha os documentos sempre atualizados para evitar bloqueios na hora de alugar.",
      "Use os filtros de status para localizar rapidamente veículos disponíveis.",
      "Anexe fotos de qualidade para facilitar a identificação visual da frota.",
      "O campo 'Observações' é útil para registrar avarias ou informações extras.",
      "Configure alertas para vencimento de documentos de cada veículo.",
    ],
    keywords: ["placa", "renavam", "chassi", "CRLV", "disponivel", "alugado", "manutencao", "inativo"],
  },
  {
    route: "/ajuda/gestao/motoristas",
    module: "gestao",
    title: "Motoristas",
    description: "O módulo de Motoristas permite gerenciar todos os condutores vinculados à sua frota, mantendo dados pessoais, documentação e histórico organizados em um só lugar.",
    overview_text: "A página de Motoristas oferece cadastro completo com validação de documentos, controle de validade de CNH, histórico de locações e vínculo direto com veículos. Status: Ativo, Inativo, Suspenso.",
    steps: [
      { title: "Acessando a página de Motoristas", description: "No menu lateral, clique em 'Motoristas' ou navegue pela rota /motoristas." },
      { title: "Visualizando a lista", description: "A listagem pode ser alternada entre visualização em grade ou tabela. Cada card exibe nome, CPF, telefone e status do motorista." },
      { title: "Buscando motoristas", description: "Utilize a barra de busca para localizar motoristas por nome, CPF ou CNH. O sistema busca em tempo real enquanto você digita." },
      { title: "Cadastrando novo motorista", description: "Clique em 'Novo Motorista' e preencha: nome completo, CPF, CNH com categoria e validade, telefone, email e endereço." },
      { title: "Editando dados", description: "No card do motorista, clique no ícone de editar para alterar informações cadastrais." },
      { title: "Detalhes do motorista", description: "Acesse a página de detalhes para visualizar dados pessoais, documentação completa, histórico de locações e vínculo com veículos." },
      { title: "Excluindo motorista", description: "Para remover um motorista, acesse os detalhes e clique em Excluir. Motoristas com locações ativas não podem ser excluídos." },
    ],
    tips: [
      "Mantenha a CNH dos motoristas sempre atualizada para evitar problemas em fiscalizações.",
      "Motoristas com status 'Suspenso' não podem realizar novas locações.",
      "Anexe foto da CNH e documentos para agilizar vistorias e contratações.",
      "Configure alertas para vencimento da CNH de cada motorista.",
    ],
    keywords: ["CNH", "CPF", "condutor", "ativo", "inativo", "suspenso", "documentacao"],
  },
  {
    route: "/ajuda/gestao/checklists",
    module: "gestao",
    title: "Checklists",
    description: "O módulo de Checklists permite realizar vistorias completas com fotos, gerar PDF profissional e compartilhar com o motorista.",
    overview_text: "Checklists é a ferramenta de vistoria digital da DashiDrive. Substitui o papel por um fluxo moderno com fotos, assinaturas e geração automática de PDF. Tipos: Check-in, Check-out, Avarias.",
    steps: [
      { title: "Acessando Checklists", description: "No menu lateral, clique em 'Checklists' ou navegue pela rota /checklists." },
      { title: "Visualizando o histórico", description: "A listagem mostra data, veículo, motorista e status de cada vistoria. Filtros por período, veículo ou tipo." },
      { title: "Criando um novo checklist", description: "Clique em 'Novo Checklist'. Selecione o veículo e motorista. O formulário guia por cada item de vistoria." },
      { title: "Realizando a vistoria", description: "Percorra cada item: pneus, combustível, lataria, vidros, interior, segurança, documentos. Cada item permite OK, Não OK ou Não se Aplica." },
      { title: "Anexando fotos", description: "Tire fotos direto da câmera ou selecione da galeria para comprovar o estado do veículo." },
      { title: "Gerando e compartilhando PDF", description: "O sistema gera automaticamente um PDF profissional. Compartilhe via WhatsApp ou email." },
    ],
    tips: [
      "Sempre registre a vistoria de check-in e check-out para comparar o estado do veículo.",
      "Tire fotos nítidas e com boa iluminação para evitar disputas sobre avarias.",
      "O checklist de devolução ajuda a identificar novos danos e descontar do caução se necessário.",
      "Compartilhe o PDF com o motorista logo após a vistoria para formalizar o acordo.",
    ],
    keywords: ["vistoria", "check-in", "check-out", "PDF", "fotos", "avarias", "whatsapp"],
  },
  {
    route: "/ajuda/gestao/pagamentos",
    module: "gestao",
    title: "Pagamentos",
    description: "O módulo de Pagamentos centraliza o controle financeiro da frota com contas a pagar e receber, status de cada transação e comprovantes anexados.",
    overview_text: "A página de Pagamentos permite registrar e acompanhar todas as movimentações financeiras da frota. Cada transação é categorizada como receita ou despesa, vinculada a um veículo. Status: pendente, pago, atrasado, cancelado.",
    steps: [
      { title: "Acessando Pagamentos", description: "No menu lateral, clique em 'Recebimentos' ou navegue pela rota /pagamentos." },
      { title: "Entendendo a listagem", description: "Cada transação mostra descrição, veículo, valor, vencimento e status. Cores indicam receita ou despesa." },
      { title: "Filtrando transações", description: "Filtre por período, status, tipo ou veículo específico. Ideal para conciliação financeira." },
      { title: "Registrando novo pagamento", description: "Clique em 'Novo Pagamento'. Informe tipo, veículo, descrição, valor, vencimento e forma de pagamento." },
      { title: "Anexando comprovantes", description: "Anexe fotos ou PDFs do comprovante para manter um registro fiscal organizado." },
      { title: "Baixando pagamentos", description: "Atualize o status para 'Pago' informando a data. O sistema registra o histórico automaticamente." },
    ],
    tips: [
      "Mantenha todos os comprovantes anexados para facilitar a prestação de contas.",
      "Use a categoria correta para cada transação para ajudar na análise de lucratividade.",
      "Configure alertas de vencimento para não perder prazos importantes.",
      "Registre receitas e despesas no mesmo dia para um fluxo de caixa preciso.",
    ],
    keywords: ["receitas", "despesas", "transacao", "comprovante", "pendente", "pago", "atrasado"],
  },
  {
    route: "/ajuda/gestao/financiamento-seguro",
    module: "gestao",
    title: "Financiamento & Seguro",
    description: "Acompanhe parcelas recorrentes de financiamentos e seguros veiculares sem nunca perder um vencimento.",
    overview_text: "O módulo de Financiamento & Seguro permite cadastrar e acompanhar todas as parcelas recorrentes da frota, sejam de financiamentos bancários ou apólices de seguro. Cada parcela é vinculada a um veículo.",
    steps: [
      { title: "Acessando Financiamento & Seguro", description: "No menu lateral, clique em 'Financiamento & Seguro' ou navegue pela rota /financiamento-seguro." },
      { title: "Visualizando parcelas", description: "Cada parcela mostra veículo, contrato, valor, vencimento e status." },
      { title: "Cadastrando novo financiamento", description: "Clique em 'Nova Parcela'. Selecione tipo, veículo, descreva o contrato, informe valor e periodicidade." },
      { title: "Controlando vencimentos", description: "Acompanhe o status de cada parcela. O sistema destaca as próximas do vencimento." },
      { title: "Vinculando apólices de seguro", description: "Informe seguradora, número da apólice, vigência e coberturas. O sistema alerta sobre vencimento." },
    ],
    tips: [
      "Cadastre todas as parcelas assim que contratar para não perder prazos.",
      "Mantenha as apólices de seguro sempre atualizadas.",
      "Configure lembretes para os vencimentos mais importantes.",
    ],
    keywords: ["financiamento", "seguro", "parcela", "apolice", "seguradora", "vigencia", "vencimento"],
  },
  {
    route: "/ajuda/gestao/manutencao",
    module: "gestao",
    title: "Manutenção",
    description: "Gerencie manutenções preventivas e corretivas da frota com agendamento, controle de custos e histórico detalhado.",
    overview_text: "O módulo de Manutenção permite agendar e acompanhar todos os serviços realizados nos veículos. Tipos: preventiva, corretiva, revisão.",
    steps: [
      { title: "Acessando Manutenção", description: "No menu lateral, clique em 'Manutenção' ou navegue pela rota /manutencao." },
      { title: "Agendando nova manutenção", description: "Clique em 'Nova Manutenção'. Selecione veículo, tipo, descreva o serviço, data e valor estimado." },
      { title: "Registrando manutenção corretiva", description: "Registre o problema, peças substituídas e custo total. Fotos ajudam a documentar." },
      { title: "Anexando fotos e notas", description: "Anexe fotos do serviço e notas fiscais para criar histórico completo." },
      { title: "Acompanhando preventivas", description: "Use preventivas programadas para evitar falhas. O sistema alerta sobre quilometragem de revisão." },
    ],
    tips: [
      "Agende preventivas com base na quilometragem para evitar quebras inesperadas.",
      "Anexe sempre a nota fiscal do serviço para manter o histórico fiscal.",
      "Compare custos entre veículos similares para identificar unidades problemáticas.",
      "Manutenções preventivas regulares aumentam a vida útil dos veículos.",
    ],
    keywords: ["preventiva", "corretiva", "revisao", "quilometragem", "custo", "nota fiscal"],
  },
  {
    route: "/ajuda/gestao/lucratividade",
    module: "gestao",
    title: "Lucratividade",
    description: "Dashboard financeiro completo com KPIs de receitas, despesas e lucro por veículo para decisões estratégicas.",
    overview_text: "O módulo de Lucratividade transforma dados financeiros brutos em insights acionáveis. Receitas de aluguéis, despesas de manutenção e custos operacionais são consolidados. Indicadores: Receita Total, Despesas, Lucro Líquido, Margem.",
    steps: [
      { title: "Acessando Lucratividade", description: "No menu lateral, clique em 'Lucratividade' ou navegue pela rota /lucratividade." },
      { title: "Entendendo os KPIs", description: "O topo exibe receita total, despesas, lucro líquido e margem percentual." },
      { title: "Analisando por veículo", description: "Abaixo dos KPIs, tabela mostra lucratividade individual de cada veículo." },
      { title: "Filtrando por período", description: "Analise dados mensais, trimestrais ou anuais para identificar tendências." },
      { title: "Exportando relatórios", description: "Exporte relatórios em PDF ou planilha com dados de lucratividade." },
    ],
    tips: [
      "Acompanhe a lucratividade mensalmente para identificar tendências sazonais.",
      "Veículos com margem negativa por mais de 3 meses devem ser avaliados para venda.",
      "Despesas de manutenção impactam diretamente a lucratividade.",
    ],
    keywords: ["KPI", "receita", "despesa", "lucro", "margem", "grafico", "relatorio"],
  },
  {
    route: "/ajuda/gestao/alertas",
    module: "gestao",
    title: "Alertas",
    description: "Central de notificações com alertas críticos e operacionais. Mantenha-se informado sobre vencimentos, manutenções e pendências.",
    overview_text: "A Central de Alertas consolida todas as notificações importantes. Criticos (exigem ação imediata) e Operacionais (eventos rotineiros). O sistema gera alertas automaticamente.",
    steps: [
      { title: "Acessando Alertas", description: "No menu lateral, clique em 'Alertas' ou navegue pela rota /alertas." },
      { title: "Entendendo as categorias", description: "Críticos (vermelho) para vencimentos urgentes, Operacionais (azul) para notificações do dia a dia." },
      { title: "Marcando como lido", description: "Clique em 'Marcar como Lido' para remover da lista de não lidos." },
      { title: "Limpando alertas", description: "Use 'Limpar Tudo' para marcar todos como lidos de uma vez." },
      { title: "Filtrando alertas", description: "Filtre por críticos, operacionais, não lidos ou por veículo." },
    ],
    tips: [
      "Configure alertas com antecedência mínima de 7 dias para ter tempo de agir.",
      "Priorize sempre os alertas críticos — podem gerar multas ou prejuízos.",
      "Revise os alertas pelo menos uma vez ao dia.",
    ],
    keywords: ["critico", "operacional", "notificacao", "vencimento", "CNH", "documento"],
  },
  {
    route: "/ajuda/gestao/usuarios",
    module: "gestao",
    title: "Usuários",
    description: "Gerencie acessos, cargos e permissões dos usuários da plataforma. Controle quem pode visualizar, editar ou administrar cada recurso.",
    overview_text: "O módulo de Usuários permite gerenciar acessos com cargos pré-definidos: Admin, Gerente, Operador, Visualizador.",
    steps: [
      { title: "Acessando Usuários", description: "No menu lateral, clique em 'Usuários' ou navegue pela rota /usuarios." },
      { title: "Cadastrando novo usuário", description: "Clique em 'Novo Usuário'. Informe nome, email e selecione o cargo. O usuário recebe convite por email." },
      { title: "Definindo cargos e permissões", description: "Admin (acesso total), Gerente (operações e financeiro), Operador (checklists e veículos), Visualizador (apenas leitura)." },
      { title: "Bloqueando acesso", description: "Altere o status para 'Inativo' para remover temporariamente o acesso." },
    ],
    tips: [
      "Crie cargos com permissões mínimas necessárias (princípio do menor privilégio).",
      "Revise periodicamente a lista de usuários ativos.",
      "Mantenha sempre ao menos dois usuários Admin para contingência.",
    ],
    keywords: ["permissoes", "cargos", "admin", "gerente", "operador", "visualizador", "acesso"],
  },
  {
    route: "/ajuda/gestao/perfil",
    module: "gestao",
    title: "Perfil",
    description: "Configure seus dados pessoais, preferências do sistema e personalize sua experiência na plataforma.",
    overview_text: "A página de Perfil centraliza todas as configurações da sua conta: dados pessoais, segurança, preferências, assinatura.",
    steps: [
      { title: "Acessando o Perfil", description: "No menu lateral, clique em 'Meu Perfil' ou navegue pela rota /perfil." },
      { title: "Editando dados pessoais", description: "Edite nome, email e telefone na seção 'Dados Pessoais'." },
      { title: "Configurando o tema", description: "Escolha entre tema Claro, Escuro ou Automático." },
      { title: "Alterando a senha", description: "Informe a senha atual, nova senha e confirme. Mínimo 8 caracteres." },
    ],
    tips: [
      "Mantenha email e telefone atualizados para notificações importantes.",
      "Altere sua senha periodicamente para manter a segurança.",
      "Use o tema escuro à noite para reduzir cansaço visual.",
    ],
    keywords: ["senha", "tema", "claro", "escuro", "notificacoes", "assinatura", "avatar"],
  },
  {
    route: "/ajuda/lojista",
    module: "lojista",
    title: "Lojista",
    description: "Aprenda a utilizar todas as ferramentas do Portal do Lojista. Selecione um tema para ver o guia completo.",
    overview_text: "O Portal do Lojista oferece ferramentas para gerenciar oportunidades, estoque, analytics e assinatura.",
    steps: [],
    tips: [],
    keywords: ["lojista", "portal", "estoque", "oportunidades", "vendas"],
  },
  {
    route: "/ajuda/lojista/hub",
    module: "lojista",
    title: "Portal do Lojista",
    description: "O hub central do lojista reúne KPIs, oportunidades e acesso rápido a todas as ferramentas do portal.",
    overview_text: "O Portal do Lojista é o ponto de partida para todas as operações. KPIs: oportunidades, interações, leads ativados, vendas, taxa de conversão.",
    steps: [
      { title: "Acessando o Portal do Lojista", description: "Clique em 'Portal do Lojista' ou navegue para /lojista/hub." },
      { title: "Entendendo os KPIs", description: "Oportunidades disponíveis, interações realizadas, leads ativados, vendas e taxa de conversão." },
      { title: "Navegando pelas oportunidades", description: "Tabela com locadora, modelo, quantidade e orçamento." },
      { title: "Acessando ferramentas", description: "Menu de navegação para estoque, analytics e configurações." },
    ],
    tips: [
      "Acesse o hub diariamente para não perder novas oportunidades.",
      "A taxa de conversão é o KPI mais importante.",
      "Mantenha seu estoque atualizado para gerar mais oportunidades.",
    ],
    keywords: ["hub", "KPI", "oportunidades", "taxa de conversao", "dashboard"],
  },
  {
    route: "/ajuda/lojista/oportunidades",
    module: "lojista",
    title: "Oportunidades",
    description: "Encontre leads e oportunidades de negócio com filtros avançados. Conecte seu estoque à demanda certa.",
    overview_text: "O módulo de Oportunidades conecta locadoras que precisam de veículos com lojistas que têm estoque disponível.",
    steps: [
      { title: "Acessando Oportunidades", description: "No menu do lojista, clique em 'Oportunidades' ou navegue para /lojista/oportunidades." },
      { title: "Visualizando as oportunidades", description: "Cada card mostra locadora, cidade, modelo desejado, quantidade e orçamento." },
      { title: "Usando os filtros", description: "Filtre por estado, cidade, modelo, faixa de preço e data." },
      { title: "Manifestando interesse", description: "Ao encontrar uma oportunidade compatível, manifeste interesse." },
    ],
    tips: [
      "Ative filtros de localização para encontrar oportunidades próximas.",
      "Oportunidades recentes têm maior chance de conversão.",
      "Mantenha estoque diversificado para atender mais perfis de demanda.",
    ],
    keywords: ["leads", "oportunidades", "demanda", "orcamento", "filtros"],
  },
  {
    route: "/ajuda/lojista/estoque",
    module: "lojista",
    title: "Meu Estoque",
    description: "Gerencie o estoque de veículos com listagem completa, status e ações rápidas.",
    overview_text: "O Meu Estoque é o centro de controle dos veículos que você oferece. Status: Disponível, Vendido, Reservado.",
    steps: [
      { title: "Acessando Meu Estoque", description: "No menu do lojista, clique em 'Meu Estoque' ou navegue para /lojista/estoque." },
      { title: "Entendendo os status", description: "Disponível (verde), Vendido (azul) ou Reservado (amarelo)." },
      { title: "Adicionando novo veículo", description: "Clique em 'Adicionar Veículo' para cadastrar um novo item." },
      { title: "Ações rápidas", description: "Editar, visualizar detalhes ou remover do estoque." },
    ],
    tips: [
      "Atualize o status imediatamente após uma venda.",
      "Veículos com fotos de qualidade geram até 3x mais visualizações.",
      "Revise o estoque semanalmente.",
    ],
    keywords: ["estoque", "disponivel", "vendido", "reservado", "anuncio"],
  },
  {
    route: "/ajuda/lojista/novo-veiculo",
    module: "lojista",
    title: "Novo Veículo",
    description: "Cadastre um novo veículo no estoque com fotos, informações técnicas e preço para publicar no marketplace.",
    overview_text: "O formulário de Novo Veículo guia por todas as etapas para cadastrar um veículo no marketplace.",
    steps: [
      { title: "Informações básicas", description: "Preencha modelo, marca, ano, quilometragem, combustível, cor e placa." },
      { title: "Adicionando fotos", description: "Upload de fotos de vários ângulos: frente, lateral, interior, painel, porta-malas." },
      { title: "Definindo preço", description: "Informe o preço de venda. O sistema sugere preços com base em veículos similares." },
      { title: "Publicando o anúncio", description: "Revise as informações e clique em 'Salvar' ou 'Publicar'." },
    ],
    tips: [
      "Fotos com boa iluminação e fundo neutro valorizam o veículo.",
      "Preencha todos os campos — anúncios completos vendem mais.",
      "Pesquise preços de veículos similares antes de definir o valor.",
    ],
    keywords: ["cadastro", "fotos", "preco", "quilometragem", "anuncio", "publicar"],
  },
  {
    route: "/ajuda/lojista/veiculo-detalhe",
    module: "lojista",
    title: "Veículo Detalhe",
    description: "Visualize e gerencie informações completas de um veículo do estoque incluindo fotos, propostas e métricas.",
    overview_text: "A página de detalhes consolida galeria de fotos, dados, métricas de desempenho e propostas recebidas.",
    steps: [
      { title: "Acessando os detalhes", description: "No estoque, clique no ícone de olho ou no nome do veículo." },
      { title: "Editando informações", description: "Clique em 'Editar' para alterar dados, fotos ou preço." },
      { title: "Acompanhando propostas", description: "Histórico de propostas recebidas com status de negociação." },
      { title: "Métricas do anúncio", description: "Visualizações, propostas recebidas e tempo de publicação." },
    ],
    tips: [
      "Mantenha fotos e informações sempre atualizadas.",
      "Responda rapidamente às propostas recebidas.",
      "Compartilhe anúncios em grupos e redes sociais.",
    ],
    keywords: ["detalhes", "propostas", "metricas", "visualizacoes", "galeria"],
  },
  {
    route: "/ajuda/lojista/analytics",
    module: "lojista",
    title: "Analytics",
    description: "Dashboard completo com métricas de vendas, desempenho de anúncios e análises.",
    overview_text: "O Analytics reúne todas as métricas em dashboards interativos: vendas, desempenho de anúncios e oportunidades.",
    steps: [
      { title: "Acessando Analytics", description: "No menu do lojista, clique em 'Analytics' ou navegue para /lojista/analytics." },
      { title: "Visão geral de vendas", description: "Total de vendas, faturamento, ticket médio e veículos vendidos." },
      { title: "Desempenho do estoque", description: "Visualizações, taxa de conversão e tempo médio até venda." },
      { title: "Exportando relatórios", description: "Exporte relatórios em PDF ou CSV." },
    ],
    tips: [
      "Analise semanalmente suas métricas para identificar tendências.",
      "O ticket médio ajuda a entender o perfil dos compradores.",
      "Compare períodos para identificar sazonalidade.",
    ],
    keywords: ["analytics", "metricas", "vendas", "conversao", "relatorio"],
  },
  {
    route: "/ajuda/lojista/assinatura",
    module: "lojista",
    title: "Assinatura",
    description: "Gerencie seu plano, veja detalhes e faça upgrade para acessar mais recursos.",
    overview_text: "Centraliza a gestão do plano contratado. Compare planos e faça upgrade/downgrade.",
    steps: [
      { title: "Conhecendo os planos", description: "Compare limites de veículos, funcionalidades e benefícios." },
      { title: "Fazendo upgrade", description: "Clique em 'Fazer Upgrade'. Diferença calculada proporcionalmente." },
      { title: "Histórico de pagamentos", description: "Acesse faturas anteriores e comprovantes." },
    ],
    tips: [
      "Escolha um plano compatível com seu estoque atual e crescimento.",
      "Upgrade tem valor calculado proporcionalmente.",
      "Planos superiores oferecem maior visibilidade no marketplace.",
    ],
    keywords: ["assinatura", "plano", "upgrade", "fatura", "limite"],
  },
  {
    route: "/ajuda/lojista/perfil",
    module: "lojista",
    title: "Perfil",
    description: "Gerencie as informações da sua loja, dados de contato e foto do perfil.",
    overview_text: "Permite gerenciar todos os dados da loja: nome fantasia, CNPJ, endereço, contato e logotipo.",
    steps: [
      { title: "Dados da loja", description: "Edite nome fantasia, razão social, CNPJ e endereço." },
      { title: "Informações de contato", description: "Mantenha email e telefone atualizados." },
      { title: "Foto do perfil", description: "Upload de foto ou logotipo da loja." },
    ],
    tips: [
      "Mantenha dados sempre atualizados para passar credibilidade.",
      "Use logotipo da loja como foto de perfil.",
      "Um perfil completo gera mais confiança.",
    ],
    keywords: ["loja", "CNPJ", "logotipo", "contato", "endereco"],
  },
  {
    route: "/ajuda/lojista/configuracoes",
    module: "lojista",
    title: "Configurações",
    description: "Personalize sua experiência no portal com notificações, segurança e preferências.",
    overview_text: "Configure notificações, privacidade, segurança (2FA), senha e preferências regionais.",
    steps: [
      { title: "Notificações", description: "Configure quais notificações receber: oportunidades, propostas, comunicados." },
      { title: "Privacidade do perfil", description: "Defina visibilidade de telefone e email no marketplace." },
      { title: "Segurança", description: "Altere senha e configure autenticação de dois fatores." },
      { title: "Preferências regionais", description: "Configure moeda, formato de data e idioma." },
    ],
    tips: [
      "Ative notificações de novas oportunidades para não perder leads.",
      "Use autenticação de dois fatores para aumentar a segurança.",
      "Revise configurações de privacidade regularmente.",
    ],
    keywords: ["notificacoes", "privacidade", "seguranca", "2FA", "idioma", "preferencias"],
  },
  {
    route: "/ajuda/marketplace",
    module: "marketplace",
    title: "Ajuda do Marketplace",
    description: "Tire o máximo proveito do Marketplace DashiDrive. Confira as ferramentas disponíveis.",
    overview_text: "O Marketplace DashiDrive conecta compradores e vendedores de veículos. Ferramentas: busca, anúncios, favoritos, inspeções.",
    steps: [],
    tips: [],
    keywords: ["marketplace", "comprar", "vender", "veiculos", "anuncios"],
  },
  {
    route: "/ajuda/marketplace/home",
    module: "marketplace",
    title: "Início",
    description: "A vitrine principal com banner, categorias e veículos em destaque para explorar.",
    overview_text: "A página Início é a porta de entrada do Marketplace com banner promocional, categorias e veículos em destaque.",
    steps: [
      { title: "Acessando o Marketplace", description: "No menu principal, clique em 'Marketplace' ou navegue para /marketplace/home." },
      { title: "Navegando pelas categorias", description: "SUV, Sedan, Hatch, Picape e mais. Clique para filtrar." },
      { title: "Explorando veículos em destaque", description: "Seção 'Destaques' mostra veículos em evidência." },
      { title: "Usando a busca rápida", description: "Campo de busca com autocomplete por modelo, marca ou cidade." },
    ],
    tips: [
      "A vitrine é personalizada com base na sua localização e histórico.",
      "Veículos em destaque têm prioridade na vitrine.",
      "O marketplace é mobile-first.",
    ],
    keywords: ["vitrine", "categorias", "SUV", "Sedan", "Hatch", "destaques"],
  },
  {
    route: "/ajuda/marketplace/buscar",
    module: "marketplace",
    title: "Buscar",
    description: "Encontre o veículo ideal com busca inteligente, autocomplete e filtros avançados.",
    overview_text: "A busca combina texto, localização e filtros avançados. Autocomplete agiliza a pesquisa.",
    steps: [
      { title: "Pesquisando por texto", description: "Digite modelo, marca ou palavra-chave. Autocomplete sugere resultados." },
      { title: "Filtrando por cidade", description: "Use o campo de cidade para encontrar veículos em localização específica." },
      { title: "Usando filtros avançados", description: "Filtre por faixa de preço, ano, quilometragem, combustível, cor e categoria." },
      { title: "Ordenando resultados", description: "Ordene por menor preço, maior preço, ano ou quilometragem." },
    ],
    tips: [
      "Use termos específicos para resultados mais precisos.",
      "Combine filtros de cidade e preço.",
      "Limpe os filtros para recomeçar uma nova busca.",
    ],
    keywords: ["busca", "autocomplete", "filtros", "cidade", "preco", "ano"],
  },
  {
    route: "/ajuda/marketplace/detalhes",
    module: "marketplace",
    title: "Detalhes do Anúncio",
    description: "Visualize fotos, dados técnicos, preço e contato do vendedor.",
    overview_text: "Reúne galeria de fotos, dados completos, preço, localização e contato com o vendedor.",
    steps: [
      { title: "Galeria de fotos", description: "Navegue pelas fotos: frente, lateral, interior, painel e detalhes." },
      { title: "Informações do veículo", description: "Modelo, ano, quilometragem, combustível, cor, opcionais." },
      { title: "Entrando em contato", description: "Clique em 'Falar com Vendedor' ou 'Enviar Proposta' via WhatsApp." },
    ],
    tips: [
      "Veja todas as fotos antes de entrar em contato.",
      "Compare o preço com veículos similares.",
      "Desconfie de preços muito abaixo da média.",
    ],
    keywords: ["detalhes", "galeria", "fotos", "preco", "vendedor", "whatsapp"],
  },
  {
    route: "/ajuda/marketplace/anunciar",
    module: "marketplace",
    title: "Anunciar Veículo",
    description: "Publique seu veículo para venda com fotos, informações e preço.",
    overview_text: "Formulário que guia por todas as etapas para publicar um veículo no marketplace.",
    steps: [
      { title: "Acessando o formulário", description: "No bottom nav, clique em 'Anunciar' ou navegue para /marketplace/sell." },
      { title: "Informações do veículo", description: "Modelo, marca, ano, quilometragem, combustível, cor e opcionais." },
      { title: "Adicionando fotos", description: "Upload de fotos de vários ângulos. Fotos de qualidade aumentam o interesse." },
      { title: "Publicando o anúncio", description: "Revise as informações e clique em 'Publicar'." },
    ],
    tips: [
      "Fotos com boa iluminação valorizam o anúncio.",
      "Preencha todos os campos para gerar mais confiança.",
      "Pesquise preços de veículos similares.",
    ],
    keywords: ["anunciar", "publicar", "fotos", "preco", "venda", "formulario"],
  },
  {
    route: "/ajuda/marketplace/favoritos",
    module: "marketplace",
    title: "Favoritos",
    description: "Salve e gerencie veículos favoritos para acompanhar oportunidades.",
    overview_text: "A lista de favoritos permite salvar veículos para acessar rapidamente e comparar.",
    steps: [
      { title: "Adicionando aos favoritos", description: "Na página de detalhes, clique no ícone de coração." },
      { title: "Visualizando itens salvos", description: "Lista com foto, modelo, preço e localização." },
      { title: "Removendo itens", description: "Clique no coração preenchido ou lixeira para remover." },
    ],
    tips: [
      "Use favoritos para comparar veículos antes de decidir.",
      "Veículos favoritados recebem notificação de alteração de preço.",
      "A lista é pessoal e visível apenas para você.",
    ],
    keywords: ["favoritos", "salvar", "comparar", "notificacao de preco"],
  },
  {
    route: "/ajuda/marketplace/perfil",
    module: "marketplace",
    title: "Perfil",
    description: "Gerencie informações de vendedor, foto e avaliações no marketplace.",
    overview_text: "O Perfil do vendedor reúne contato, foto e avaliações para transmitir confiança.",
    steps: [
      { title: "Dados do vendedor", description: "Edite nome, foto, telefone e email." },
      { title: "Avaliações", description: "Veja avaliações recebidas de compradores." },
    ],
    tips: [
      "Use foto profissional ou logotipo.",
      "Boas avaliações aumentam a confiança.",
      "Um perfil completo gera mais credibilidade.",
    ],
    keywords: ["vendedor", "avaliacoes", "reputacao", "credibilidade"],
  },
  {
    route: "/ajuda/marketplace/meus-anuncios",
    module: "marketplace",
    title: "Meus Anúncios",
    description: "Gerencie anúncios ativos e inativos, edite informações e acompanhe leads.",
    overview_text: "Centro de controle dos veículos publicados. Ative/desative, edite e acompanhe desempenho.",
    steps: [
      { title: "Gerenciando status", description: "Ative ou desative anúncios com toggle." },
      { title: "Editando anúncios", description: "Altere fotos, preço ou descrição." },
      { title: "Acompanhando leads", description: "Veja quantos leads cada anúncio gerou." },
    ],
    tips: [
      "Desative anúncios de veículos vendidos.",
      "Acompanhe visualizações para saber desempenho.",
      "Edite o preço se tiver muitas visualizações mas poucos leads.",
    ],
    keywords: ["anuncios", "ativo", "inativo", "leads", "visualizacoes"],
  },
  {
    route: "/ajuda/marketplace/propostas",
    module: "marketplace",
    title: "Propostas",
    description: "Visualize e responda propostas recebidas nos seus anúncios.",
    overview_text: "Centraliza todos os leads gerados pelos seus anúncios. Cada proposta representa um comprador interessado.",
    steps: [
      { title: "Visualizando leads", description: "Comprador, veículo, data e status do contato." },
      { title: "Respondendo propostas", description: "Use 'Responder via WhatsApp' para contato direto." },
      { title: "Acompanhando histórico", description: "Histórico de interações com cada lead." },
    ],
    tips: [
      "Responda leads rapidamente para maior chance de conversão.",
      "Leads não respondidos em 48h têm baixa chance.",
      "Marque leads como concluídos após a venda.",
    ],
    keywords: ["propostas", "leads", "whatsapp", "conversao", "funil"],
  },
  {
    route: "/ajuda/marketplace/inspecao",
    module: "marketplace",
    title: "Inspeção",
    description: "Realize inspeções veiculares detalhadas com checklist, fotos e laudo final.",
    overview_text: "Avaliação detalhada do veículo item por item com fotos. O laudo serve como documentação oficial.",
    steps: [
      { title: "Iniciando a vistoria", description: "Dados do veículo pré-preenchidos." },
      { title: "Preenchendo itens", description: "Motor, câmbio, suspensão, freios, elétrica, carroceria, pneus, interior." },
      { title: "Adicionando fotos", description: "Tire fotos de cada item inspecionado." },
      { title: "Finalizando a inspeção", description: "Revise e clique em 'Finalizar'. Laudo gerado automaticamente." },
    ],
    tips: [
      "Realize em local bem iluminado para fotos de qualidade.",
      "Seja criterioso na avaliação de cada item.",
      "O laudo pode ser usado como garantia para o comprador.",
    ],
    keywords: ["inspecao", "vistoria", "laudo", "motor", "cambio", "suspensao", "pneus"],
  },
  {
    route: "/ajuda/marketplace/lista-inspecoes",
    module: "marketplace",
    title: "Lista de Inspeções",
    description: "Acompanhe todas as inspeções realizadas com histórico e acesso aos laudos.",
    overview_text: "Histórico completo de todas as vistorias: data, responsável, itens verificados e laudo final.",
    steps: [
      { title: "Visualizando inspeções", description: "Data, responsável e status (pendente, concluída, aprovada)." },
      { title: "Filtrando inspeções", description: "Filtre por data, status ou responsável." },
      { title: "Acompanhando cronograma", description: "Histórico cronológico para acompanhar evolução do veículo." },
    ],
    tips: [
      "Mantenha histórico para comprovar procedência.",
      "Inspeções recentes geram mais confiança.",
      "Compartilhe laudos com compradores para agilizar a venda.",
    ],
    keywords: ["inspecoes", "historico", "laudo", "vistoria", "cronograma"],
  },
  {
    route: "/ajuda/motorista",
    module: "motorista",
    title: "Ajuda do Motorista",
    description: "Tire o máximo proveito do aplicativo mobile DashiDrive.",
    overview_text: "O aplicativo mobile DashiDrive oferece checklists, frota, pagamentos, aluguéis, manutenção e alertas.",
    steps: [],
    tips: [],
    keywords: ["motorista", "aplicativo", "mobile", "frota"],
  },
  {
    route: "/ajuda/motorista/inicio",
    module: "motorista",
    title: "Início",
    description: "Dashboard com KPIs financeiros e atalhos rápidos para as principais funcionalidades.",
    overview_text: "Tela inicial com saudação personalizada, KPIs (Recebimento Previsto, Valores Recebidos, A Receber, Atrasados) e atalhos.",
    steps: [
      { title: "Entendendo os KPIs", description: "Recebimento Previsto, Valores Recebidos, A Receber e Valores Atrasados." },
      { title: "Usando os atalhos rápidos", description: "Acesso direto a Checklists, Frota, Motoristas e Veículos." },
      { title: "Navegando pelo bottom nav", description: "Alterna entre Início, Checklists, Frota, Alertas e Perfil." },
    ],
    tips: [
      "KPIs são atualizados automaticamente em tempo real.",
      "Use atalhos para economizar tempo.",
      "Monitore valores atrasados para ações preventivas.",
    ],
    keywords: ["inicio", "dashboard", "KPI", "atalhos", "bottom nav"],
  },
  {
    route: "/ajuda/motorista/checklists",
    module: "motorista",
    title: "Checklists",
    description: "Realize vistorias de check-in e check-out com fotos e PDF.",
    overview_text: "Vistorias completas com checklist, fotos e geração automática de PDF.",
    steps: [
      { title: "Criando nova vistoria", description: "Toque no botão '+' e escolha check-in ou check-out." },
      { title: "Preenchendo itens", description: "Lataria, pneus, vidros, luzes, interior, documentos." },
      { title: "Adicionando fotos", description: "Fotos de cada item vistoriado como comprovante." },
      { title: "Finalizando e compartilhando", description: "Laudo PDF gerado automaticamente. Compartilhe via WhatsApp." },
    ],
    tips: [
      "Tire fotos em local bem iluminado.",
      "Use comparação check-in/check-out para identificar danos.",
      "Compartilhe o laudo para transparência total.",
    ],
    keywords: ["check-in", "check-out", "vistoria", "fotos", "PDF"],
  },
  {
    route: "/ajuda/motorista/frota",
    module: "motorista",
    title: "Frota",
    description: "Gerencie veículos e motoristas com busca, cards e ações rápidas.",
    overview_text: "Unifica gestão de veículos e motoristas em abas alternáveis. Cards com informações resumidas.",
    steps: [
      { title: "Alternando entre abas", description: "Toque em 'Veículos' ou 'Motoristas' para alternar." },
      { title: "Buscando na frota", description: "Busca em tempo real por placa, modelo ou motorista." },
      { title: "Visualizando cards", description: "Foto, nome/modelo, status e score. Problemas são destacados." },
      { title: "Acessando detalhes", description: "BottomSheet com ações rápidas: ligar, WhatsApp, ver histórico." },
    ],
    tips: [
      "O score ajuda a identificar motoristas com problemas.",
      "Cards vermelhos indicam atenção imediata.",
      "BottomSheet oferece ações sem sair da página.",
    ],
    keywords: ["frota", "abas", "veiculos", "motoristas", "score", "bottomsheet"],
  },
  {
    route: "/ajuda/motorista/motoristas",
    module: "motorista",
    title: "Motoristas",
    description: "Lista completa de motoristas com busca, status e acesso a detalhes.",
    overview_text: "Lista todos os motoristas com busca por nome ou CPF e status visual.",
    steps: [
      { title: "Buscando motoristas", description: "Busca em tempo real por nome ou CPF." },
      { title: "Entendendo os status", description: "Ativo (verde), Inativo (cinza), Suspenso (vermelho)." },
      { title: "Acessando detalhes", description: "Perfil, financeiro, documentos e pagamentos." },
    ],
    tips: [
      "Mantenha CNH sempre atualizada.",
      "Verifique status antes de vincular motorista a veículo.",
      "Motoristas 'Suspenso' não podem realizar novas locações.",
    ],
    keywords: ["motoristas", "CNH", "CPF", "ativo", "inativo", "suspenso"],
  },
  {
    route: "/ajuda/motorista/pagamentos",
    module: "motorista",
    title: "Pagamentos",
    description: "Acompanhe pagamentos de motoristas com histórico e filtros.",
    overview_text: "Centraliza o histórico financeiro dos motoristas. Status: Pago (verde), Pendente (amarelo), Atrasado (vermelho).",
    steps: [
      { title: "Visualizando o histórico", description: "Lista com data, valor, motorista e status." },
      { title: "Entendendo os status", description: "Pago, Pendente ou Atrasado." },
      { title: "Detalhes do pagamento", description: "Comprovante, vencimento, valor e forma de pagamento." },
    ],
    tips: [
      "Acompanhe pagamentos semanalmente.",
      "Pagamentos atrasados geram alertas automáticos.",
      "Configure lembretes de vencimento.",
    ],
    keywords: ["pagamentos", "pago", "pendente", "atrasado", "comprovante"],
  },
  {
    route: "/ajuda/motorista/alugueis",
    module: "motorista",
    title: "Aluguéis",
    description: "Gerencie contratos de aluguel com histórico e controle de parcelas.",
    overview_text: "Centraliza todos os contratos de locação. Acompanhe ativos, parcelas e alertas de vencimento.",
    steps: [
      { title: "Visualizando contratos", description: "Veículo, motorista, valor e data de vencimento." },
      { title: "Detalhes do contrato", description: "Período, parcelas, valor total e status." },
      { title: "Gerenciando parcelas", description: "Status de cada parcela: paga, pendente ou atrasada." },
    ],
    tips: [
      "Renove contratos antes do vencimento.",
      "Acompanhe parcelas pendentes para não acumular dívidas.",
      "Use notificações para não perder prazos de renovação.",
    ],
    keywords: ["alugueis", "contratos", "parcelas", "vencimento", "locacao"],
  },
  {
    route: "/ajuda/motorista/manutencao",
    module: "motorista",
    title: "Manutenção",
    description: "Registre e acompanhe manutenções com notificações preventivas.",
    overview_text: "Registre e acompanhe serviços da frota. Tipos: preventiva, corretiva, revisão, troca de pneus, funilaria.",
    steps: [
      { title: "Registrando nova manutenção", description: "Toque em '+' e informe veículo, tipo, data e valor." },
      { title: "Tipos de manutenção", description: "Preventiva, corretiva, revisão, troca de pneus, funilaria, elétrica." },
      { title: "Notificações preventivas", description: "Alertas quando veículo está próximo da revisão." },
    ],
    tips: [
      "Registre toda manutenção imediatamente após o serviço.",
      "Preventivas reduzem custos com reparos emergenciais.",
      "Acompanhe gastos por veículo.",
    ],
    keywords: ["manutencao", "preventiva", "corretiva", "revisao", "pneus"],
  },
  {
    route: "/ajuda/motorista/alertas",
    module: "motorista",
    title: "Alertas",
    description: "Central de notificações com alertas de documentos, manutenção e pagamentos.",
    overview_text: "Reúne notificações sobre documentos vencendo, manutenções programadas e pagamentos pendentes.",
    steps: [
      { title: "Tipos de alertas", description: "Documentos vencendo, manutenção programada, pagamentos atrasados." },
      { title: "Alertas de documentos", description: "CNH, CRLV próximos do vencimento." },
      { title: "Alertas de pagamento", description: "Pagamentos pendentes e atrasados." },
    ],
    tips: [
      "Configure quais alertas deseja receber.",
      "Alertas de documentos evitam multas.",
      "Resolva alertas de manutenção preventiva.",
    ],
    keywords: ["alertas", "documentos", "CNH", "CRLV", "manutencao", "pagamentos"],
  },
  {
    route: "/ajuda/motorista/perfil",
    module: "motorista",
    title: "Perfil",
    description: "Gerencie informações pessoais, foto, preferências e segurança.",
    overview_text: "Edite dados pessoais, preferências do app e segurança (senha, biometria).",
    steps: [
      { title: "Editando dados pessoais", description: "Nome, email, telefone e foto." },
      { title: "Preferências do app", description: "Notificações, tema (claro/escuro), idioma." },
      { title: "Segurança", description: "Senha e autenticação biométrica (digital ou facial)." },
    ],
    tips: [
      "Use autenticação biométrica para acesso rápido.",
      "Configure tema escuro para economizar bateria OLED.",
      "Preferências são sincronizadas entre dispositivos.",
    ],
    keywords: ["perfil", "biometria", "tema", "claro", "escuro", "preferencias"],
  },
];

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function scoreEntry(entry: AjudaEntry, queryTokens: string[]): number {
  let score = 0;
  const titleNorm = normalize(entry.title);
  const descNorm = normalize(entry.description);
  const overviewNorm = normalize(entry.overview_text);
  const allStepText = entry.steps.map((s) => normalize(s.title + " " + s.description)).join(" ");
  const allTipText = entry.tips.map(normalize).join(" ");
  const allKeywords = entry.keywords.map(normalize).join(" ");

  const searchable = [
    titleNorm,
    descNorm,
    overviewNorm,
    allStepText,
    allTipText,
    allKeywords,
  ].join(" ");

  for (const token of queryTokens) {
    const tokenLen = token.length;
    if (tokenLen < 2) continue;

    let count = 0;
    let pos = 0;
    while ((pos = searchable.indexOf(token, pos)) !== -1) {
      count++;
      pos += tokenLen;
    }

    if (count > 0) {
      score += count * 2;
      if (titleNorm.includes(token)) score += 10;
      if (entry.keywords.some((k) => normalize(k).includes(token))) score += 5;
    }
  }

  return score;
}

export function searchKnowledgeBase(query: string, topK = 3): AjudaEntry[] {
  if (!query.trim()) return [];

  const queryTokens = normalize(query).split(/\s+/).filter(Boolean);
  if (queryTokens.length === 0) return [];

  const scored = knowledgeBase
    .map((entry) => ({ entry, score: scoreEntry(entry, queryTokens) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map((item) => item.entry);
}

export function getPageByRoute(route: string): AjudaEntry | undefined {
  return knowledgeBase.find((entry) => entry.route === route);
}

export function getContextForRoutes(routes: string[]): string {
  const pages = routes.map((r) => getPageByRoute(r)).filter(Boolean) as AjudaEntry[];
  if (pages.length === 0) return "";

  return pages
    .map((page) => {
      let ctx = `--- Página: ${page.route} ---\n`;
      ctx += `Título: ${page.title}\n`;
      ctx += `Descrição: ${page.description}\n`;
      ctx += `Visão Geral: ${page.overview_text}\n`;
      if (page.steps.length > 0) {
        ctx += "Passos:\n";
        page.steps.forEach((s, i) => {
          ctx += `  ${i + 1}. ${s.title}: ${s.description}\n`;
        });
      }
      if (page.tips.length > 0) {
        ctx += "Dicas:\n";
        page.tips.forEach((t) => {
          ctx += `  - ${t}\n`;
        });
      }
      return ctx;
    })
    .join("\n");
}
