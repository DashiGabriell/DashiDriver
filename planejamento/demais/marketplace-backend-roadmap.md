# Roadmap de Implementação: Backend do Marketplace

Este documento resume os requisitos técnicos necessários para tornar o módulo de **Marketplace** da DashiDrive funcional, seguro e performático, seguindo os padrões do **Squad Dashi**.

---

## 1. Modelo de Dados (Supabase/PostgreSQL)
Implementação de tabelas com RLS estrito.

### Tabelas a Criar:
- `marketplace_listings`: Anúncios vinculados a `carcontrol_vehicles`.
- `marketplace_proposals`: Propostas de motoristas para anúncios.
- `marketplace_wishlist`: Favoritos dos motoristas.

### Segurança (RLS Obrigatório):
- Políticas de acesso baseadas em `user_id` e roles (Locador vs. Motorista).
- Garantia de que dados sensíveis do locador não sejam expostos a motoristas.

---

## 2. Camada de API e Hooks (Frontend)
Encapsulamento de chamadas para manter a integridade.

- **Serviços (`api/marketplace.ts`):** Funções encapsuladas para interagir com as novas tabelas.
- **Hooks (`hooks/marketplace/`):** Implementação de `useQuery` e `useMutation` (React Query) para busca, envio de propostas e gestão de wishlist.

---

## 3. Lógica de Negócio e Backend
Funcionalidades server-side para um marketplace real.

- **Busca Avançada:** Views ou Functions SQL para busca performática (localização, preço, tipo).
- **Notificações:** Integração com o sistema de alertas para notificar locadores sobre propostas recebidas.
- **Fluxo de Reserva:** Triggers para automação de status de veículo (ex: ao aceitar proposta, mudar veículo para 'alugado').

---

## 4. Checklist de Qualidade (Squad Dashi)

Antes da implementação, garantir:
- [ ] RLS habilitado em todas as novas tabelas.
- [ ] Validação de input com Zod.
- [ ] Performance de busca otimizada (índices).
- [ ] Testes unitários para hooks e validadores.
- [ ] Sem vazamento de dados entre tenants.

---

**Nota:** Este documento serve como guia para a implementação da versão funcional do módulo. Consulte `squaddashi.md` para padrões técnicos.
