# Mapa Mental: Fluxo de Cadastro, Escolha de Plano e Acesso - DashiDrive

Este documento descreve a jornada do usuário desde o momento em que ele cria sua conta até o acesso às funcionalidades da plataforma, detalhando como a escolha do plano e o status do "teste grátis" influenciam a experiência.

---

## 1. Cadastro Inicial (Página de Login/Cadastro)
- **Ação:** O usuário preenche o formulário básico com e-mail, nome e senha.
- **Resultado:** Uma conta é criada e um perfil básico é gerado para o usuário no banco de dados.
- **Estado Inicial:** Neste momento, o status de "teste grátis" (`trial`) no perfil do usuário é `NULL` (ou seja, indefinido), aguardando uma decisão.

## 2. Funil de Onboarding Gameficado ("Quem é você?")
- **Ação:** Após o cadastro, o usuário é direcionado para um fluxo interativo (tipo um "jogo de perguntas") para que o sistema entenda suas necessidades.
- **Objetivo:** Identificar se o usuário é:
    - **Motorista:** Busca veículos para trabalhar.
    - **Locador Marketplace:** Deseja anunciar veículos para alugar.
    - **Locador Gestão Completa:** Precisa gerenciar uma frota inteira.
- **Resultado:** Esta etapa ajuda a personalizar a experiência e direcionar o usuário para a oferta de plano mais adequada.

## 3. Escolha do Plano e Ativação do Trial
- **Ação:** Com base no perfil identificado, o usuário terá opções para escolher como deseja continuar:

    -   **Opção: Teste Grátis de 7 dias (`free7dias`)**
        *   **Usuário:** Escolhe ativar o teste gratuito.
        *   **Sistema:** Uma função interna (RPC `activate_trial_onboarding`) é chamada para marcar o `trial` do perfil do usuário como 'ativo'. Se o usuário já tiver uma empresa associada, o `trial` da empresa também é ativado.
        *   **Acesso:** O usuário tem acesso às funcionalidades do **Plano Gestão - Básico** por 7 dias.

    -   **Opção: Planos Pagos de Gestão (`gestão-BASICO`, `gestão-PRO`, `gestão-MASTER`)**
        *   **Usuário:** Escolhe um dos planos de gestão (Básico, PRO ou MASTER, dependendo das necessidades ou do tamanho da frota).
        *   **Sistema:** O tipo de plano escolhido é registrado no perfil do usuário. O usuário é então direcionado para uma página de checkout para finalizar o pagamento.
        *   **Acesso:** Após a confirmação do pagamento, o perfil do usuário e a empresa (se houver) são marcados como ativos com o plano correspondente. O acesso às funcionalidades será conforme o plano contratado.

## 4. Cadastro da Empresa (Para Locadores)
- **Ação:** Se o usuário se identificou como Locador (Marketplace ou Gestão), ele precisará preencher os dados da sua locadora.
- **Processamento:**
    -   Se o usuário optou pelo **Teste Grátis (`free7dias`)**, e a empresa for criada neste momento, o `trial` da empresa também será definido como 'ativo'.
    -   Se o usuário escolheu um **Plano Pago**, a empresa é criada, mas seu status de "ativo" e o plano escolhido só serão confirmados após o pagamento ser processado.

## 5. O "Motor" de Acesso (Decidindo o que o usuário pode ver)
Sempre que o usuário tenta acessar uma página, o sistema verifica suas permissões:

1.  **Páginas de Exceção:** Algumas páginas (como o Funil de Onboarding, Cadastro da Empresa, todas as páginas de Checkout ou a Página de Expiração do Trial) são sempre acessíveis, independentemente do status do plano.
2.  **Verificação de Permissão:** Para todas as outras páginas, o sistema verifica:
    -   **Tem "Teste Grátis" (`free7dias`) Ativo?** (ou seja, `carcontrol_profiles.trial = 'ativo'` e ainda não expirou):
        *   **SIM:** Autoriza o acesso às funcionalidades do **Plano Gestão - Básico**.
    -   **Tem Empresa com Plano Pago Ativo?** (ou seja, `carcontrol_companies.active = TRUE` e o `plan_id` corresponde a um plano pago):
        *   **SIM:** Autoriza o acesso às funcionalidades completas do plano contratado (`gestão-BASICO`, `gestão-PRO` ou `gestão-MASTER`).
    -   **NÃO (Nenhum dos dois acima)?**
        *   **Bloqueia:** Redireciona o usuário para a `Página de Expiração`, informando que o acesso está bloqueado e oferecendo opções para clicar no botão 'Ver planos e Assinar' qque o redirecionará para a página de landing page.

## 6. Destino Final (Páginas Iniciais)
-   **Motorista:** Direcionado para o dashboard específico do motorista ou para o Marketplace de veículos.
-   **Locador Marketplace:** Direcionado para a área de gerenciamento de anúncios ou venda de veículos.
-   **Locador Gestão Completa (Trial ou Plano Básico):** Acessa o Dashboard principal com funcionalidades do Plano Básico.
-   **Locador Gestão Completa (Plano PRO ou MASTER):** Acessa o Dashboard completo com todas as funcionalidades avançadas do plano.
-   **Acesso Bloqueado:** É levado para a `Página de Expiração` (`TrialExpirado.tsx`).

---

## 🚩 Pontos de Atenção (Possíveis causas de problemas)

*   **Loops de Redirecionamento:** Se uma página crucial para o usuário (ex: Checkout, Onboarding de Empresa) não estiver na lista de exceções do "Motor de Acesso", o usuário pode ser bloqueado e redirecionado indefinidamente.
*   **Atraso na Sincronização:** Se o frontend tentar acessar um dashboard antes que o banco de dados tenha processado a ativação de um trial ou a confirmação de um pagamento, o "Motor de Acesso" pode bloquear o usuário indevidamente por um breve período.
*   **Dados Inconsistentes:** Se o status do `trial` ou do `plano` no banco de dados não refletir a escolha real do usuário (por exemplo, devido a um erro na gravação), o "Motor de Acesso" tomará decisões erradas sobre as permissões.

---

## ✅ Resolução para os Pontos de Atenção

Aqui estão as estratégias para mitigar os possíveis problemas identificados:

### 1. Resolução para "Loops de Redirecionamento"
*   **Ação:** Mantenha uma lista explícita e abrangente de "Páginas de Exceção" no "Motor de Acesso".
*   **Detalhamento:** Qualquer rota necessária para o onboarding, processo de pagamento (todas as etapas do checkout), recuperação de conta ou aviso de expiração deve ser configurada para ser sempre acessível, independentemente do status do usuário. Essa lista deve ser revisada a cada nova funcionalidade que afete o fluxo de acesso.

### 2. Resolução para "Atraso na Sincronização"
*   **Ação:** Implementar estados de carregamento robustos e mecanismos de re-tentativa no frontend, além de considerar a re-busca de dados ou Realtime.
*   **Detalhamento:**
    *   **Feedback Visual:** Após ações críticas (ex: ativação de trial, conclusão de pagamento), exiba um spinner ou uma mensagem de "processando" no frontend, UTILIZE A ANIMAÇÃO → C:\Projects\dashidrive2026\public\assets\loading-carcontrol-coelho.gif COMO SPINNER .
    *   **Re-fetch de Dados:** Após uma ação que altera o status de acesso do usuário (ex: RPC `activate_trial_onboarding` bem-sucedida, confirmação de pagamento), o frontend deve fazer uma nova busca dos dados de perfil/empresa do usuário. Isso garante que a aplicação tenha o estado mais atualizado antes de tentar navegar para rotas protegidas.
    *   **Supabase Realtime:** Explore o uso do Supabase Realtime para ouvir mudanças no `trial` ou no status `active` das tabelas `carcontrol_profiles` e `carcontrol_companies`. Isso pode fornecer atualizações quase instantâneas, reduzindo a chance de bloqueios temporários.

### 3. Resolução para "Dados Inconsistentes"
*   **Ação:** Garantir a atomicidade das transações no banco de dados e validações em todas as camadas.
*   **Detalhamento:**
    *   **Transações Atômicas:** Sempre que o `trial` ou `plan` for atualizado, agrupe as operações em uma transação SQL. Isso garante que todas as etapas sejam concluídas com sucesso ou, em caso de falha, que nenhuma alteração seja salva, evitando estados inconsistentes.
    *   **Validação Frontend/Backend:** Utilize validações robustas (ex: Zod no frontend e triggers/constraints no banco de dados) para garantir que os dados de plano e trial sejam sempre válidos antes de serem persistidos.
    *   **Logs e Monitoramento:** Mantenha logs detalhados de todas as alterações críticas de status de usuário/plano. Implemente monitoramento para alertar sobre falhas em transações ou inconsistências nos dados, facilitando a depuração e correção.
    *   **Reconciliação Periódica:** Em casos de alta complexidade, pode-se considerar a implementação de um job periódico que verifique a consistência entre dados relacionados (ex: `profiles.trial` vs `companies.trial` e `companies.active` vs. pagamentos).

