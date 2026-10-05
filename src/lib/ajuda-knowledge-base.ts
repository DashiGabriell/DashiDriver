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
