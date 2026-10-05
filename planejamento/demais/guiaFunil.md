Aqui está o detalhamento completo da página e da funcionalidade do seu **Funil Gamificado**, planejado especificamente para a stack técnica da **DashiDrive** (React, TailwindCSS e os componentes do `shadcn/ui` que você já utiliza).

Como o objetivo é criar uma página extremamente rápida e focada em conversão, estruturamos a experiência em um conceito de **Single Page Application (SPA) reativa**, controlada por estados do React (`useState`), eliminando completamente o tempo de carregamento entre as perguntas.

---

## 💻 1. Arquitetura da Página (UX/UI)

A página terá um layout limpo, focado no conteúdo centralizado e otimizado para celulares (Mobile-First), já que a maior parte do tráfego vindo de redes sociais ou anúncios acessa pelo smartphone.

* **Header (Topo):** Logo discreto da **DashiDrive** no canto superior esquerdo e um indicador sutil de segurança (ex: ícone de um cadeado com a frase "Diagnóstico Criptografado e Seguro"). Sem menu de navegação para o usuário não dispersar ou fugir da página.
* **Área Central Dinâmica:** Um card container (`<Card>` do shadcn) que muda o conteúdo dinamicamente com base no estado atual do funil (`passoAtual`).
* **Footer (Rodapé):** Selos de privacidade (LGPD), link de Termos de Uso e uma nota curta reforçando a autoridade da DashiDrive no mercado de locadoras de SP.

---

## ⚙️ 2. As Etapas e Funcionalidades (O Passo a Passo no Código)

O componente React controlará o fluxo através de um estado de índice (ex: `const [step, setStep] = useState(0)`).

### Passo 0: A Tela de Entrada (Landing Page)

Antes de começar a responder, o usuário precisa ser impactado pelo valor do que vai receber.

* **UI:** * Headline impactante: *"Sua locadora em SP está realmente protegida contra calotes e prejuízos com multas?"*
* Subheadline: *"Leve menos de 2 minutos para medir o Score de Saúde Operacional da sua frota e desbloqueie o Kit de Sobrevivência Jurídica e Operacional."*
* Um elemento visual mostrando o que vem no kit (ícones ilustrativos dos PDFs: Contrato Blindado, Tabela de Rodízio e Checklist de Entrada/Saída).
* Botão de Ação (`<Button>` com pulsação sutil em Tailwind): **[Iniciar Diagnóstico Gratuito ➔]**


* **Funcionalidade:** Ao clicar no botão, o Pixel do Facebook dispara o evento `ViewContent` e o estado muda para `step: 1`.

---

### Passos 1 a 4: O Quiz Interativo (A Gamificação)

Para manter o usuário engajado e não parecer um questionário chato, cada passo exibe apenas **uma pergunta por vez** com botões grandes e clicáveis.

* **Elementos Fixos na Tela do Quiz:**
* **Barra de Progresso:** Um componente `<Progress value={progresso} />` no topo do card, que aumenta em 25% a cada resposta selecionada.
* **Indicador Visual:** Um texto discreto dizendo *"Pergunta X de 4"*.


* **As Perguntas e a Lógica de Resposta:**
* **Pergunta 1 (Segurança Jurídica):** *"O contrato da sua locadora possui cláusula de responsabilidade solidária imediata para multas cometidas em SP?"* * Opções: `[Sim, está 100% atualizado]` ou `[Não tenho certeza / Não possui]`.
* **Pergunta 2 (Operação):** *"Como é feito o controle de rodízio de placas e alertas de manutenção da sua frota hoje?"*
* Opções: `[Uso planilha/papel]`, `[Faço de cabeça]`, `[Uso um software completo]`.


* **Pergunta 3 (Risco com Condutores):** *"Antes de entregar a chave, você faz uma varredura do motorista em sistemas de background check além do Serasa?"*
* Opções: `[Sim, analiso histórico completo]` ou `[Não, confio na CNH e Serasa padrão]`.


* **Pergunta 4 (Prevenção de Prejuízos):** *"Sua locadora já perdeu a garantia de fábrica de algum veículo por passar da quilometragem limite da revisão?"*
* Opções: `[Nunca perdi]` ou `[Infelizmente já aconteceu / Não tenho esse controle estrito]`.




* **Funcionalidade Técnica:** * Ao clicar em qualquer opção, o valor é armazenado em um objeto de estado (`respostas`) e o React executa um `setStep(step + 1)` de forma instantânea, com uma animação suave de transição (fading/slide).
* Na primeira resposta clicada, o código dispara uma requisição em segundo plano para salvar o "Lead Parcial" no banco (caso o usuário abandone o site na metade, você capturou o rastro dele e o Pixel disparou um evento personalizado de engajamento para fins de retargeting).



---

### Passo 5: O Form de Captura e Cálculo do Score (O "Unlock")

Antes de ver o gráfico do resultado, o usuário chega à tela de bloqueio. Ele já investiu tempo respondendo, então a taxa de conversão aqui é altíssima.

* **UI:**
* Mensagem: *"Obrigado pelas respostas! Seu Diagnóstico de Saúde Operacional foi gerado com sucesso."*
* Chamada para ação: *"Insira os dados abaixo para calcular sua porcentagem de segurança e liberar o download imediato do Kit de Sobrevivência do Locador."*
* **Campos do Formulário:**
1. **Nome do Responsável** (`<Input type="text" placeholder="Seu nome" />`)
2. **Nome da Locadora** (`<Input type="text" placeholder="Ex: Locadora São Paulo" />`)
3. **WhatsApp com DDD** (`<Input type="tel" placeholder="(11) 99999-9999" />`) — *Obrigatório e com máscara de validação.*
4. **Tamanho da Frota** (`<Select>` com opções: `1 a 5 carros`, `6 a 15 carros`, `Mais de 15 carros`).


* Botão final: **[Calcular Meu Score e Baixar Kit ➔]**


* **Funcionalidade Técnica:** * Ao submeter o formulário, os dados do lead e as respostas dadas no quiz são consolidados e enviados para a sua API da DashiDrive via POST.
* Um algoritmo simples no seu backend ou frontend calcula a pontuação dele. Por exemplo: cada resposta "Insegura" reduz o score. Se ele respondeu negativamente a tudo, o score dele é **25%**. Se respondeu positivamente a tudo, é **100%**.
* O Pixel do Facebook dispara o evento oficial de **`Lead`** (ativando seu público para geração de Look-a-like baseado em frotas maiores).



---

### Passo 6: A Página de Resultados (A Recompensa e o Gancho do SaaS)

Esta é a tela final, onde você entrega o prometido, mas aproveita o pico de atenção do usuário para apresentar a DashiDrive.

* **UI:**
* **O Gráfico de Score:** Um velocímetro visual ou uma barra circular bem grande indicando o resultado (ex: **"Seu Score de Proteção: 45% - Risco Moderado"**).
* **O Diagnóstico Rápido textual:** Gerado dinamicamente no React:
* *Se respondeu que controla rodízio no Excel:* "⚠️ Atenção: Gerenciar rodízio em planilhas em São Paulo causa uma média de R$ X em multas esquecidas por ano."


* **Botão de Download:** Um botão de destaque para baixar o Kit prometido (`.zip` ou `.pdf` contendo os modelos de contratos e checklists de SP).
* **O Gancho de Vendas (CTA do SaaS):** Logo abaixo do download, uma seção com design premium destaca:
* *"Você acabou de baixar os papéis, mas que tal automatizar tudo isso? A DashiDrive resolve os pontos fracos do seu diagnóstico enviando alertas automáticos de rodízio, gerando contratos digitais e fazendo a varredura do motorista no automático."*
* Botão de conversão para o produto: **[Testar a DashiDrive Grátis por 15 dias]** (Esse botão já envia o usuário para o onboarding da plataforma com o e-mail/WhatsApp dele pré-preenchido via parâmetros da URL, criando uma experiência de cadastro de 1 clique).

---