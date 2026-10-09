---
target: paginas de checkout
total_score: 14
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\Gabriell\\Documents\\Projects\\DashiDriver\\src\\pages\\checkout"
timestamp: 2026-10-05T19-55-18Z
slug: src-pages-checkout
---
⚠️ DEGRADED: browser indisponível (cursor-ide-browser não abriu aba); avaliação A por código-fonte, avaliação B só CLI.
Method: dual-agent (A: 56b04238-82aa-4fe4-aa79-df3af97029e1 · B: 26296df7-4529-4389-a365-e1851571d61f)

Alvo: /planos (PlanosPage.tsx) e /checkout/:plano (Checkout.tsx + CheckoutLayout.tsx + CheckoutForm.tsx + CheckoutMarketplaceFree.tsx)

| # | Heurística | Nota | Problema |
|---|---|---|---|
| 1 | Status do sistema | 2 | "(3/30)" no polling; CEP sem loading; PIX exige clique manual |
| 2 | Mundo real | 2 | Só CPF (sem CNPJ); "R$ 399.00"; rótulos "Boleto / Boleto" |
| 3 | Controle e liberdade | 1 | Sem voltar/trocar plano; boleto vira beco sem saída |
| 4 | Consistência | 1 | Três azuis; nem sistema da landing nem do app |
| 5 | Prevenção de erros | 1 | CPF só por tamanho; cartão sem Luhn; validade vencida aceita; CVV aceita letras |
| 6 | Reconhecimento | 2 | Plano/limites/preço não aparecem (só no botão) |
| 7 | Eficiência | 1 | autoComplete="new-password"/"off"; sem inputMode |
| 8 | Minimalismo | 1 | Carrossel, letreiro, cupom aberto, 6 planos |
| 9 | Recuperação de erros | 2 | Erros de pagamento só em toast; CEP não encontrado silencioso |
| 10 | Ajuda | 1 | Sem renovação/cancelamento, sem Asaas, sem WhatsApp |
| Total | | 14/40 | Ruim |

Prioridades:
- P0 Carrossel com botão falso "TESTE GRÁTIS AGORA" e números inventados (CheckoutLayout.tsx:28-60)
- P1 Sem resumo do pedido nem termos de cobrança
- P1 Fricção no formulário (autofill bloqueado, sem CNPJ, ordem dos campos, validações)
- P2 /planos mistura dois produtos, 6 cartões, não avisa limitação do Básico
- P2 Estados de confirmação (PIX manual, boleto sem saída, cartão PENDING redireciona)

Outros: 10 arquivos de checkout não roteados; cupons lidos direto da tabela coupons no cliente; marquee sem prefers-reduced-motion; seleção de pagamento só por cor; acentos faltando.
Detector CLI: 0 achados (exit 0) nos 5 arquivos.
