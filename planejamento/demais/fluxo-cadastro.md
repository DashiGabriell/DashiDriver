# Mapa Mental: Fluxo de Cadastro e Acesso - DashiDrive

Este documento descreve o caminho do usuário desde o cadastro inicial até o acesso ao sistema, destacando os pontos onde o controle de acesso é verificado.

---

## 1. Cadastro Inicial
- **Ação:** Usuário cria conta e fornece dados básicos.
- **Armazenamento:** Cria-se o perfil do usuário no banco de dados.

## 2. Escolha do Plano
- **Ação:** Usuário seleciona o plano:
    - **Teste Grátis:** O sistema marca uma "intenção de teste" no perfil do usuário.
    - **Plano Pago (Gestão):** O sistema guarda a escolha do plano.

## 3. Cadastro da Empresa (Locadora)
- **Ação:** Usuário preenche dados da empresa.
- **Processamento:**
    - Se a intenção era "Teste Grátis": O sistema ativa automaticamente o trial no perfil e na empresa recém-criada.
    - Se a intenção era "Plano Pago": A empresa é criada como "Inativa" (aguardando pagamento). Neste caso o usuário deverá ser redirecionado para a página de checkout para finalizar a compra com a opção do plano escolhido.

## 4. O "Motor" de Acesso (Onde o sistema decide)
Sempre que o usuário tenta acessar uma página, o sistema verifica:


1.  **Está em uma página de exceção?** (Onboarding, Cadastro de Empresa, Checkout, Página de Expiração)
    - **Sim:** O acesso é permitido imediatamente.
    - **Não:** Continua para a verificação abaixo.

2.  **O usuário tem permissão?**
    - **Tem Trial Ativo?** -> **Autoriza acesso**.
    - **A empresa está Ativa (Paga)?** -> **Autoriza acesso**.
    - **Nenhum dos dois?** -> **Bloqueia e redireciona para página de "Teste Expirado/Bloqueado"**.

## 5. Destino Final
- **Teste Grátis:** Redirecionado para a tela inicial (Dashboard/Home).
- **Plano Pago:** Redirecionado para o Checkout (pagamento).
- **Bloqueado:** Redirecionado para a página de aviso.

---

## 🚩 Pontos de Atenção (Possíveis causas de problemas)

*   **Loop de Redirecionamento:** Se uma página que o usuário precisa acessar (ex: Checkout ou Onboarding) não estiver na lista de "exceções" do motor de acesso, ele será bloqueado e jogado de volta para a tela de erro, criando um loop.
*   **Atraso na Sincronização:** Se o navegador tentar acessar o dashboard antes do Supabase processar a criação da empresa e a ativação do trial, o motor de acesso entenderá que o usuário não tem permissão e o bloqueará.
*   **Estado do Banco:** Se o status `ativo` ou `trial` não estiverem sincronizados entre o que o usuário escolheu e o que foi gravado no banco, o motor de acesso tomará a decisão errada.
