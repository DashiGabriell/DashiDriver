# Plano de Ação: Aprimoramento do Marketplace DashiDrive (Foco Exclusivo: Locação de Veículos)

## 1. Compreensão da Solicitação
O objetivo é elevar o marketplace da DashiDrive para um nível profissional, competitivo e confiável, utilizando referências de mercado de alta conversão (como WebMotors).

**ATENÇÃO: ESCOPO ESTRITAMENTE LIMITADO À LOCAÇÃO DE VEÍCULOS.**
Esta feature destina-se **EXCLUSIVAMENTE** à locação de veículos. **ESTÁ PROIBIDA** a inclusão de suporte a serviços extras, peças, acessórios, serviços de mecânica ou qualquer outro produto que não seja um veículo para locação. O marketplace será 100% voltado para a oferta e busca de veículos para aluguel.

As melhorias visam:
- **Cadastro Detalhado de Veículos:** Inclusão de campos técnicos essenciais (marca, modelo, câmbio, ar condicionado, direção, cor, quilometragem, tipo de combustível, caução, etc.) para garantir clareza absoluta nas ofertas de locação.
- **Busca Avançada de Veículos:** Implementação de filtros inteligentes baseados nestes novos campos de veículos para facilitar a descoberta do veículo ideal pelo motorista.
- **Foco Mobile:** UX/UI otimizada para dispositivos móveis, priorizando performance e facilidade de interação (thumb-friendly), seguindo as diretrizes de mobile-design.

## 2. Princípios de Design (Baseado em `mobile-design` e `squaddashi`)
- **Performance-First:** Listagens otimizadas (evitar renderização desnecessária, `FlatList` se necessário).
- **Touch-Friendly:** Targets de toque (48dp+), espaçamento adequado, hierarquia clara na "thumb zone".
- **Confiança Visual:** Layout limpo, corporativo e sério, eliminando a aparência de "classificados improvisados". Foco exclusivo no mercado de locação de veículos.
- **Adaptabilidade:** Design consistente em diferentes tamanhos de tela.

## 3. Plano de Ação Detalhado

### Fase 1: Análise e Modelagem (Restrita a Veículos)
- [ ] Mapear todos os novos campos técnicos necessários para veículos no esquema do Supabase (revisar `supabase/schema.md`).
- [ ] Desenhar o fluxo de cadastro focado **apenas** em veículos, para suportar campos técnicos adicionais sem sobrecarregar o motorista (UX progressiva).
- [ ] Definir a estrutura dos filtros de busca de veículos para ser intuitiva e rápida.

### Fase 2: Backend (Modelagem de Dados)
- [ ] Atualizar o esquema do Supabase para refletir os novos campos técnicos (marca, modelo, câmbio, caução, ar condicionado, direção, combustível, etc.).
- [ ] Criar/atualizar migrações para suporte aos novos dados de veículos, garantindo que NÃO haja suporte, campos ou filtros para serviços, peças ou produtos extras.

### Fase 3: Cadastro de Veículo (Formulário)
- [ ] Refatorar `src/pages/marketplace/MarketplaceSell.tsx` para incluir novos inputs e seções de veículos.
- [ ] Implementar validações robustas (Zod) para garantir que campos obrigatórios do veículo (marca, modelo, placa, valor, caução, etc.) sejam preenchidos corretamente.
- [ ] Garantir que o upload de fotos do veículo mantenha a qualidade visual exigida.

### Fase 4: Busca & Filtros (UX/UI)
- [ ] Implementar a drawer/sidebar de filtros de veículos em `src/pages/marketplace/MarketplaceSearch.tsx`.
- [ ] Garantir que o estado dos filtros de veículos seja performático e persista corretamente durante a navegação.

### Fase 5: Validação e QA
- [ ] Rodar o script `.agent/scripts/mobile_audit.py` para validar UX/Touch focada na locação de veículos.
- [ ] Testar fluxos de cadastro de veículos e busca em simulador/dispositivo real.
- [ ] Validar acessibilidade e contraste das cores.

## 4. Agentes Especializados Envolvidos
- **frontend-specialist:** Implementação dos novos componentes de formulário e filtros (shadcn/ui + Tailwind), estritamente voltados para veículos.
- **database-architect:** Garantir a integridade e escalabilidade dos dados de veículos no Supabase, removendo qualquer resquício de suporte a serviços ou produtos.
- **performance-optimizer:** Garantir que a busca e listagem de veículos sejam instantâneas.
