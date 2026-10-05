# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: the owner of a small-to-mid car rental company ("locadora", roughly 5 to 100 vehicles), frequently renting cars weekly to ride-hailing drivers (Uber/99). Today they run the business on spreadsheets, notebooks, and WhatsApp threads: who has which car, who paid this week, when the oil change is due, what the car looked like when it left. Their job is to keep cars on the street earning, get paid on time, and avoid losses from damage, missed payments, and expired documents.

Secondary (served elsewhere, not the focus of the `/` landing): drivers and owners in the marketplace (`/lp-marketplace`), parts sellers in the lojista portal, and the rental company's own team (GERENTE, OPERACIONAL, AUDITOR roles).

## Product Purpose

DashiDrive replaces the spreadsheet-and-WhatsApp operation of a rental company with one system: fleet, drivers, recurring payments, inspections, maintenance, insurance/financing installments, alerts, and profitability per vehicle. Success means the owner knows, at any moment, which cars are earning, who owes what, and what needs attention, without chasing it by hand.

## Positioning

Built specifically for rental companies that rent to app drivers: recurring weekly/daily charging per driver, guided photo inspections in the field that become a PDF sent by WhatsApp, side-by-side comparison of check-out vs check-in inspections, and profitability per car (revenue minus maintenance, insurance, and financing). A generic fleet tool or ERP does not model the "car rented weekly to an app driver" loop.

## Operating Context

- Web dashboard for the owner/manager (`/dashboard`, `/veiculos`, `/motoristas`, `/pagamentos`, `/manutencao`, `/lucratividade`, `/controle-km`, `/financiamento-seguro`, `/alertas`).
- Mobile field app (`/mobile/*`) for the rental company's own team: inspections, fleet, maintenance, payments, alerts. It is not a driver app.
- Inspections: 7-step guided photo capture with watermark, PDF sent via WhatsApp and e-mail, public share link (`/vistoria/:token`), comparison of two inspections.
- Vehicle statuses: Disponível, Alugado, Oficina, Inativo. Driver data: CPF, CNH category and expiry, rental history, delinquency.
- Subscription billing through Asaas (credit card, PIX, boleto).

## Capabilities and Constraints

Management plans (source of truth: `src/pages/checkout/PlanosPage.tsx`, `src/lib/billing/plans.ts`), monthly only:

- Básico, `gestao-basico`, R$199/mês: 5 vehicles, 10 drivers, 1 user.
- Pro, `gestao-pro`, R$399/mês: 20 vehicles, 40 drivers, 3 users.
- Master, `gestao-master`, R$799/mês: 100 vehicles, 200 drivers, 200 users.

Checkout links: `/checkout/<slug>`. Login: `/login`; logged-in users go to `/dashboard`.

Constraints:
- No annual pricing exists in checkout; do not show it.
- Per `planejamento/demais/roles-acesso.md`, Básico does not include Maintenance or Alerts; do not promise features per plan beyond what checkout and plan config state.
- A 7-day trial (`free7dias`) exists in onboarding, but the owner did not choose it as the landing's message; the landing sells the three plans.
- Brand name is spelled **DashiDrive** (the repo is "DashiDriver").
- Stack: Vite, React, TypeScript, Tailwind, shadcn/ui, framer-motion, Supabase.

## Brand Commitments

- Name: DashiDrive. Footer signature "Squad Dashi".
- Voice: Brazilian Portuguese, direct, operational, owner-to-owner. No hype numbers.
- The rabbit mascot (`public/assets/loading-carcontrol-coelho.gif`) is not a binding commitment for this landing.

## Evidence on Hand

- Real product screens and flows (the app itself), plus `public/assets/pc-smartphone.png` mockup.
- Car illustrations in `public/assets/` (carro*.png, comfort.png, utilitario.png, etc).
- No testimonials, no customer names or logos, no case studies, no verified usage numbers. The figures in the old landing ("+240%", "100+ veículos", "Muitas locadoras", "+2Mil horas", "centenas de locadoras", "RLS 2.0") are placeholders and must not be reused. Demonstration data in product illustrations must be labeled as example.

## Product Principles

1. Show the operation, not adjectives: the product earns trust by visibly running a rental company's week.
2. Speak the owner's vocabulary: carro, motorista, semanal, vistoria, oficina, inadimplente.
3. Honest pricing: limits by vehicles, drivers, users; no hidden tiers, no invented discounts.
4. Field-first: inspections and payments happen on the street, on a phone.
