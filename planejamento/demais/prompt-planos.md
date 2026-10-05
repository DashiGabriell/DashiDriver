## Contexto do Projeto
DashiDrive é um SaaS de gestão de frotas que oferece planos mensais. O objetivo deste projeto é implementar um sistema de checkout transparente utilizando a API do Asaas para processar pagamentos via cartão de crédito e pix, garantindo uma experiência fluida e segura para os usuários.

## Objetivo
Implementar checkout transparente com integração Asaas para processamento de pagamentos via cartão de crédito.

## Planos e Preços

### Planos de Gestão (SaaS)
| Plano    | Valor       | Limite Veículos | Limite Motoristas | Limite Usuários | Limite Checklists |
|----------|-------------|-----------------|-------------------|-----------------|-------------------|
| Básico   | R$ 199/mês  | 5               | 10                | 1               | 10/mês            |
| Pro      | R$ 399/mês  | 20              | 40                | 3               | 40/mês            |
| Master   | R$ 799/mês  | 100             | 200               | 200             | 400/mês           |

### Planos de Marketplace
| Plano    | Valor       | Anúncios Ativos | Recursos Principais                                  |
|----------|-------------|-----------------|------------------------------------------------------|
| Free     | R$ 0/mês    | 1               | Perfil básico, recebimento de propostas              |
| Pro      | R$ 119/mês  | 10              | Painel "Meus Anúncios", métricas, selo verificado    |
| Elite    | R$ 299/mês  | 25              | Destaque, prioridade na busca, relatórios completos  |

## Requisitos Técnicos Obrigatórios

### 1. Secrets (Variáveis de Ambiente)
Preciso configurar os seguintes secrets no Supabase:
- `ASAAS_API_KEY` - Chave de API do Asaas (production ou sandbox)
- `https://sandbox.asaas.com/api/v3` - URL base da API:
  - Sandbox: `https://sandbox.asaas.com/api/v3`
  - Produção: `https://api.asaas.com/api/v3`

### 2. Tabelas do Banco de Dados
Preciso das seguintes tabelas com RLS:

**Tabela `users`** (campos mínimos para checkout):
- id (uuid, PK)
- name (text)
- email (text)
- whatsapp (text) - formato E.164 ex: +5511999999999
- cpf (text)
- billing_name (text)
- cep, endereco, numero, complemento, bairro, cidade, estado (text)
- plano_ativo (text)
- data_expiracao (timestamptz)
- asaas_customer_id (text)
- status (text) - 'pending', 'ativo', 'cancelled', 'inactive'

**Tabela `payments`**:
- id (uuid, PK)
- user_id (uuid, FK)
- plan (text)
- amount (numeric)
- status (text)
- asaas_payment_id (text)
- asaas_subscription_id (text, nullable)
- paid_at (timestamptz)
- created_at (timestamptz)

### 3. Edge Functions Necessárias

**`process-payment`** (verify_jwt = true):
- Recebe dados do cartão, endereço, CPF, plano
- Cria/busca customer no Asaas
- Processa pagamento:
  - Plano mensal: criar subscription (cycle: MONTHLY)
  - Planos parcelados: criar payment com installmentCount e installmentValue
- Salva dados no banco
- Implementa rollback se falhar após criar cobrança no Asaas

**`check-payment-status`** (verify_jwt = true):
- Consulta status do pagamento/assinatura no Asaas
- Mapeia status para: APPROVED, REJECTED, PENDING


### 4. Página de Checkout (Frontend)

Campos obrigatórios do formulário:
- CPF (com validação de dígitos verificadores)
- Nome completo para faturamento
- CEP (com auto-complete de endereço via ViaCEP)
- Endereço completo (logradouro, número, complemento, bairro, cidade, estado)
- Dados do cartão:
  - Nome no cartão
  - Número do cartão (validação Luhn)
  - Validade MM/AA
  - CVV (3 ou 4 dígitos)

Funcionalidades:
- Validação em tempo real de todos os campos
- Máscaras de formatação (CPF, cartão, CEP)
- Loading state durante processamento
- Polling de status do pagamento (a cada 2s por até 60s)
- Tratamento de erros amigável

### 5. Segurança Obrigatória

- [ ] JWT obrigatório em todas as edge functions de pagamento
- [ ] Verificar que userId do JWT corresponde ao userId da requisição
- [ ] Sanitizar CPF (apenas dígitos)
- [ ] Sanitizar número do cartão (remover espaços)
- [ ] Logs seguros (nunca logar dados sensíveis completos)
- [ ] RLS em todas as tabelas
- [ ] Rollback automático se falhar após criar cobrança no Asaas

### 6. Estrutura dos Dados para Asaas

Criar Customer:
```json
{
  "name": "Nome Completo",
  "cpfCnpj": "12345678901",
  "email": "email@example.com",
  "mobilePhone": "11999999999",
  "postalCode": "01310100",
  "address": "Av Paulista",
  "addressNumber": "1000",
  "complement": "Sala 101",
  "province": "Bela Vista",
  "city": "São Paulo",
  "state": "SP",
  "externalReference": "customer_uuid",
  "notificationDisabled": true
}
 
Criar Subscription (plano mensal):

{
  "customer": "cus_xxx",
  "billingType": "CREDIT_CARD",
  "value": 39.90,
  "cycle": "MONTHLY",
  "description": "Assinatura Mensal",
  "externalReference": "ref_uuid_plan_timestamp",
  "creditCard": {
    "holderName": "Nome no Cartão",
    "number": "4444444444444444",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "ccv": "123"
  },
  "creditCardHolderInfo": {
    "name": "Nome Completo",
    "email": "email@example.com",
    "cpfCnpj": "12345678901",
    "phone": "11999999999",
    "postalCode": "01310100",
    "addressNumber": "1000",
    "address": "Av Paulista",
    "province": "Bela Vista",
    "city": "São Paulo",
    "complement": "Sala 101"
  }
}

Criar Payment Parcelado (semestral/anual):
{
  "customer": "cus_xxx",
  "billingType": "CREDIT_CARD",
  "installmentCount": 6,
  "installmentValue": 29.90,
  "description": "Plano Semestral",
  "dueDate": "2024-01-15",
  "externalReference": "ref_uuid_plan_timestamp",
  "creditCard": { ... },
  "creditCardHolderInfo": { ... }
}

## Fluxo de Usuário Esperado

1. Usuário chega na página de checkout com plano selecionado
2. Preenche CPF, nome, endereço (CEP auto-completa)
3. Preenche dados do cartão
4. (Opcional) Aplica cupom de desconto
5. Clica em "Finalizar pagamento"
6. Sistema mostra loading enquanto:
    - Cria/busca customer no Asaas
    - Processa pagamento
    - Polling verifica status
7. Se aprovado: redireciona para dashboard
8. Se rejeitado: mostra erro e permite tentar novamente

## Considerações Especiais

- Ambiente: [SANDBOX ou PRODUÇÃO]
- WhatsApp é único por usuário (validar duplicidade)
- Mensagens de erro devem ser em português
- Implementar Facebook Pixel para tracking (opcional)
- Cartões de teste Asaas: 4444444444444444

---

## 📚 **Referências da API Asaas**

| Recurso | Documentação |
|---------|--------------|
| Criar Customer | https://docs.asaas.com/docs/criar-novo-cliente |
| Cobranças Cartão | https://docs.asaas.com/docs/cobrancas-via-cartao-de-credito |
| Assinaturas | https://docs.asaas.com/docs/subscriptions-via-credit-card |
| Parcelamentos | https://docs.asaas.com/docs/installment-payments |
| Eventos/Webhooks | https://docs.asaas.com/docs/subscription-events |
| Status de Pagamento | PENDING, CONFIRMED, RECEIVED, ACTIVE, REJECTED, REFUNDED |

---

## ✅ **Checklist de Implementação**

```markdown
### Pré-requisitos
- [ ] Supabase conectado ao projeto
- [ ] Conta Asaas criada (sandbox para teste)
- [ ] API Key do Asaas obtida

### Secrets
- [ ] ASAAS_API_KEY configurado
- [ ] ASAAS_BASE_URL configurado

### Banco de Dados
- [ ] Tabela users criada com campos de billing
- [ ] Tabela payments criada
- [ ] Tabela coupons criada (se necessário)
- [ ] RLS configurado em todas as tabelas

### Edge Functions
- [ ] process-payment implementada
- [ ] check-payment-status implementada
- [ ] validate-coupon implementada (se usar cupons)
- [ ] activate-free-plan implementada (se cupons 100%)
- [ ] config.toml atualizado com verify_jwt

### Frontend
- [ ] Página de Checkout criada
- [ ] Validações de CPF, cartão, CEP implementadas
- [ ] Máscaras de formatação funcionando
- [ ] Auto-complete CEP via ViaCEP
- [ ] Sistema de polling implementado
- [ ] Estados de loading/erro tratados
- [ ] Cupons funcionando (se aplicável)

### Segurança
- [ ] JWT validado em todas edge functions
- [ ] userId verificado contra token
- [ ] Dados sensíveis sanitizados
- [ ] Logs seguros (sem dados do cartão)
- [ ] Rollback implementado
- [ ] Cupons validados server-side

### Testes
- [ ] Teste em sandbox com cartão 4444444444444444
- [ ] Teste de pagamento aprovado
- [ ] Teste de pagamento rejeitado
- [ ] Teste de cupom válido/inválido
- [ ] Teste de timeout

## 🔒 **Pontos Críticos de Segurança**

1. **NUNCA armazene dados completos do cartão** - apenas referências do Asaas
2. **NUNCA exponha a API Key** - apenas em edge functions server-side
3. **Sempre valide JWT** - impede requests não autenticados
4. **Sempre verifique userId** - impede que usuário A pague como usuário B
5. **Implemente rollback** - se o banco falhar, cancele a cobrança no Asaas
7. **Sanitize inputs** - CPF, telefone, número do cartão
8. **Logs seguros** - mascare dados sensíveis nos logs