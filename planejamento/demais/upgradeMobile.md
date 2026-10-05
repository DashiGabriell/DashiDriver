# Roadmap — Mobile Native Experience (DashiDrive)

Objetivo:
Criar uma experiência mobile totalmente separada do desktop, com sensação de app nativo, focada em operação rápida de locadoras.

A ideia NÃO é adaptar o desktop.
A ideia é criar um “mini sistema operacional da locadora, mas com foco no mobile”.

---

# Estrutura Geral

## Novo grupo de rotas

Criar uma árvore de páginas exclusiva:

```txt
/mobile
/mobile/home
/mobile/operacoes
/mobile/frota
/mobile/alertas
/mobile/perfil
```

Todas independentes das páginas desktop, que serão utilizadas quando o usuário estiver acessando a plataforma através do smartphone.

---

# 1. Criar Layout Mobile Base

## Página/estrutura:

```txt
src/layouts/mobile/
```

Criar[sempre atento ao estilo original do projeto, cores e efeitos, o estilo deve ser consistente com o design atual, mas adaptado para uma experiência mobile fluida e moderna]:

```txt
MobileLayout.tsx
MobileBottomNav.tsx
MobileHeader.tsx
MobileContainer.tsx
```

---

## Objetivos

Separar COMPLETAMENTE:

* UX desktop
* UX mobile

Sem condicionais gigantes tipo:

```tsx
isMobile ? ... : ...
```

---

## MobileLayout.tsx

Responsável por:

* navbar inferior fixa
* safe area do iPhone e Android
* scroll otimizado para mobile
* padding inferior automático
* animações de transição

### Deve conter:

* `<Outlet />`
* Bottom navigation fixa
* Área scrollável
* suporte ao keyboard mobile

---

# 2. Criar Sistema de Rotas Mobile

## Alterar com cuidado:

App.tsx

Adicionar:

```tsx
<Route path="/mobile" element={<MobileLayout />}>
  <Route path="home" element={<MobileHome />} />
  <Route path="operacoes" element={<MobileOperacoes />} />
  <Route path="frota" element={<MobileFrota />} />
  <Route path="alertas" element={<MobileAlertas />} />
  <Route path="perfil" element={<MobilePerfil />} />
</Route>
```

---

# 3. Criar Navegação Inferior (Bottom Navbar)

## Arquivo:

```txt
src/components/mobile/MobileBottomNav.tsx
```

---

## Itens:

| Ícone    | Rota              |
| -------- | ----------------- |
| Activity | /mobile/operacoes |
| Car      | /mobile/frota     |
| Home     | /mobile/home      |
| Bell     | /mobile/alertas   |
| User     | /mobile/perfil    |

---

## UX desejada

### Deve ter:

* efeito iOS/modern Android
* active state animado
* ícone maior ao selecionar
* o ícone 'Home' deve ser o mais destacado, levemente elevado (mais ou menos 15px)
* haptic feeling visual

### NÃO usar:

* sidebar
* menu hamburguer principal

---

# 4. Criar Mobile Home

## Página:

```txt
src/pages/mobile/MobileHome.tsx
```

---

# Objetivo

Dashboard operacional.

NÃO usar gráficos complexos.

---

## Criar componentes:

```txt
src/components/mobile/home/
```

### Componentes:

```txt
KpiCard.tsx
QuickActions.tsx
RevenueMiniChart.tsx
PendingDriversCard.tsx
FleetStatusCard.tsx
RecentActivity.tsx
```

---

## Conteúdo da tela

### Header

* saudação
* nome da locadora
* avatar
* notificações

---

### KPIs principais

* Receber hoje
* Inadimplentes
* Veículos ativos
* Em manutenção

---

### Quick Actions

Botões grandes:

* Registrar pagamento
* Nova manutenção
* Novo motorista
* Novo veículo

---

### Atividades recentes

Feed curto:

* pagamentos
* oficina
* alertas
* novos contratos

---

# 5. Criar Mobile Operações

## Página:

```txt
src/pages/mobile/MobileOperacoes.tsx
```

---

# Objetivo

Virar o “centro operacional diário”.

---

## Criar componentes:

```txt
src/components/mobile/operacoes/
```

### Componentes:

```txt
OperationFeed.tsx
OperationCard.tsx
OperationsFilter.tsx
FloatingCreateButton.tsx
QuickConfirmButton.tsx
```

---

# Funcionalidades

## Feed operacional

Exemplos:

* pagamento confirmado
* parcela vencendo
* veículo em oficina
* seguro vencendo
* motorista inadimplente

---

## Floating Action Button

Botão:

```txt
+
```

Ao abrir:

* Novo pagamento
* Nova manutenção

---

## Swipe Actions

Exemplo:

* marcar como pago
* resolver alerta
* abrir whatsapp

---

# 6. Criar Mobile Frota

## Página:

```txt
src/pages/mobile/MobileFrota.tsx
```

---

# Objetivo

Substituir:

* veículos
* motoristas

por uma única experiência operacional.

---

## Criar componentes:

```txt
src/components/mobile/frota/
```

### Componentes:

```txt
FleetTabs.tsx
VehicleCard.tsx
DriverCard.tsx
VehicleBottomSheet.tsx
DriverBottomSheet.tsx
FleetSearch.tsx
FleetFilters.tsx
```

---

# Estrutura

## Tabs:

* Veículos
* Motoristas

---

## Cada card deve mostrar:

### Veículo:

* foto
* placa
* status
* motorista atual
* valor semanal
* dias sem pagar

### Motorista:

* nome
* score
* veículo
* pagamentos
* status

---

# UX importante

## NÃO abrir página nova

Ao clicar:
→ abrir Bottom Sheet

Isso deixa:

* rápido
* fluido
* sensação nativa

---

# 7. Criar Mobile Alertas

## Página:

```txt
src/pages/mobile/MobileAlertas.tsx
```

---

# Objetivo

Virar central de problemas.

---

## Criar componentes:

```txt
src/components/mobile/alertas/
```

### Componentes:

```txt
AlertCard.tsx
AlertFilters.tsx
CriticalAlerts.tsx
AlertActionBar.tsx
```

---

# Funcionalidades

## Tipos:

* inadimplência
* manutenção
* seguro
* oficina
* documentação

---

## Cada card:

* severidade
* veículo
* motorista
* ação recomendada

---

## Ações rápidas:

* cobrar
* abrir whatsapp
* marcar resolvido
* registrar pagamento

---

# 8. Criar Mobile Perfil

## Página:

```txt
src/pages/mobile/MobilePerfil.tsx
```

---

# Objetivo

Centralizar:

* conta
* empresa
* equipe
* plano
* configurações

---

## Criar componentes:

```txt
src/components/mobile/perfil/
```

### Componentes:

```txt
CompanyCard.tsx
SubscriptionCard.tsx
TeamMembers.tsx
SettingsList.tsx
ProfileHeader.tsx
```

---

# Deve conter:

* foto da empresa
* plano atual
* usuários da equipe
* permissões
* logout
* notificações

---

# 9. Criar Sistema de Bottom Sheet

## MUITO IMPORTANTE

Criar:

```txt
src/components/mobile/ui/
```

### Componentes:

```txt
BottomSheet.tsx
MobileModal.tsx
SwipeableCard.tsx
PullToRefresh.tsx
```

---

# BottomSheet deve:

* deslizar de baixo
* ter drag gesture
* backdrop blur
* snap points
* animações suaves para sensação premium

---

# 10. Criar Hooks Mobile

## Pasta:

```txt
src/hooks/mobile/
```

### Hooks:

```txt
useMobile.ts
useBottomNav.ts
usePullToRefresh.ts
useHaptics.ts
useMobileKeyboard.ts
```

---

# 11. Criar Design System Mobile

## Pasta:

```txt
src/styles/mobile/
```

---

# Criar:

* espaçamentos próprios
* altura de touch targets
* tipografia mobile
* animações nível premium
* shadows suaves
* neumorphism DO PROJETO, NÃO ALTERAR ESTILO

---

# 12. Criar Responsividade Inteligente

## Estratégia

### Desktop:

```txt
>= 1024px
```

### Mobile app:

```txt
< 768px
```

---

# Fluxo recomendado

## Mobile:

usuário acessa:

```txt
app.dashidrive.com
```

automaticamente:

```txt
/mobile/home
```

---

# 13. Criar Transições Nativas

## Implementar:

* page slide
* fade transitions
* bottom sheet animations
* skeleton loading
* pull to refresh

---

# 14. Melhorar Performance Mobile

## Prioridade alta

Implementar:

* lazy loading
* code splitting
* virtualização
* imagens otimizadas
* suspense loading

---

# 15. Criar Experiência “App”

## Adicionar:

* splash screen
* fullscreen mobile para essas novas páginas
* theme-color baseada nas cores do projeto atual

---

# Resultado Final Esperado

O usuário NÃO deve sentir:
❌ “estou usando um site”

Ele deve sentir:
✅ “estou usando um app de gestão de frota”

Essa separação entre:

* Desktop = administrativo
* Mobile = operacional

é exatamente o que diferencia SaaS comum de produto premium.
