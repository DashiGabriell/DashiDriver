import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { GESTAO_PLANS } from "@/lib/billing/plans";
import { useSwing } from "@/components/landing/KeyTag";

type GestaoPlan = (typeof GESTAO_PLANS)[number];

const PLAN_LOOK = [
  { status: "plano", wire: 30, button: "bg-[var(--qc-tape)] text-white" },
  { status: "alugado", wire: 78, button: "bg-white text-[var(--qc-azul)]" },
  { status: "grafite", wire: 46, button: "bg-white text-[var(--qc-tape)]" },
] as const;

type PricingProps = {
  headingAs?: "h1" | "h2";
  footnote?: ReactNode;
};

export const Pricing = ({ headingAs: Heading = "h2", footnote }: PricingProps) => {
  const [cars, setCars] = useState(12);
  const fit = GESTAO_PLANS.find((p) => cars <= p.cars) ?? GESTAO_PLANS[GESTAO_PLANS.length - 1];
  const fill = `${((cars - 1) / 99) * 100}%`;

  return (
    <section id="planos" className="qc-board scroll-mt-16 overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="qc-quiet lg:col-span-6">
            <Heading className="qc-display text-[clamp(1.95rem,4.1vw,3.6rem)]">Quantos carros tem no seu quadro?</Heading>
            <p className="mt-6 max-w-[32rem] text-[1.1rem] leading-relaxed">
              Os planos mudam pelo tamanho da frota e da equipe. Diga quantos carros você tem e veja qual cabe.
            </p>
          </div>

          <div className="qc-steel rounded-xl p-5 shadow-[0_14px_30px_-14px_rgba(40,20,5,0.75)] lg:col-span-6">
            <label htmlFor="qc-cars" className="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-[var(--qc-steel-soft)]" style={{ fontStretch: "115%" }}>
              Carros na frota
            </label>
            <div className="mt-2 flex items-center gap-4">
              <button
                type="button"
                className="qc-step-btn"
                onClick={() => setCars((n) => Math.max(1, n - 1))}
                disabled={cars <= 1}
                aria-label="Menos um carro"
              >
                <Minus className="h-5 w-5" aria-hidden="true" />
              </button>
              <output htmlFor="qc-cars" className="qc-num w-[4.5rem] text-center text-[3rem] font-bold leading-none text-white">
                {cars}
              </output>
              <button
                type="button"
                className="qc-step-btn"
                onClick={() => setCars((n) => Math.min(100, n + 1))}
                disabled={cars >= 100}
                aria-label="Mais um carro"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="ml-auto text-right text-[0.95rem] text-[var(--qc-steel-soft)]">
                Cabe no <strong className="text-white">{fit.name}</strong>
              </div>
            </div>
            <input
              id="qc-cars"
              type="range"
              min={1}
              max={100}
              value={cars}
              onChange={(e) => setCars(Number(e.target.value))}
              className="qc-range mt-5"
              style={{ ["--fill" as string]: fill }}
            />
          </div>
        </div>

        <div className="qc-rail mt-16 hidden md:block" aria-hidden="true" />
        <div className="mt-14 grid gap-x-8 gap-y-12 md:mt-[-7px] md:grid-cols-3">
          {GESTAO_PLANS.map((plan, i) => (
            <PlanTag key={plan.slug} plan={plan} index={i} active={plan.slug === fit.slug} />
          ))}
        </div>

        <div className="qc-quiet mt-12 inline-block text-[0.98rem] font-semibold text-[var(--qc-ink)]">
          <p>Valores mensais. Pagamento no cartão de crédito, Pix ou boleto.</p>
          {footnote}
        </div>
      </div>
    </section>
  );
};

const PlanTag = ({ plan, index, active }: { plan: GestaoPlan; index: number; active: boolean }) => {
  const controls = useSwing(0.1 + index * 0.08, active);
  const look = PLAN_LOOK[index];

  return (
    <div className="qc-hook mx-auto w-full max-w-[19rem]" style={{ ["--wire" as string]: `${look.wire}px` }}>
      <motion.div className="qc-swing" animate={controls}>
        <div className="qc-tag !rounded-[18px_18px_34px_34px] !px-3.5 !pb-4 !pt-11" data-status={look.status}>
          {active && (
            <span className="qc-tape qc-tape--vermelho absolute -right-3 top-5 !text-[0.72rem]">Cabe na sua frota</span>
          )}
          <div className="qc-insert !rounded-[10px] !px-4 !pb-4 !pt-3.5">
            <div className="text-[1.5rem] font-[820]" style={{ fontStretch: "120%" }}>
              {plan.name}
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-[1.1rem] font-semibold">R$</span>
              <span className="qc-num text-[3.6rem] font-bold leading-[0.9]">{plan.price}</span>
              <span className="text-[0.98rem] text-black/60">/mês</span>
            </div>
            <dl className="mt-4 space-y-1.5 border-t border-black/10 pt-3 text-[0.98rem]">
              {[
                ["Carros", `até ${plan.cars}`],
                ["Motoristas", `até ${plan.drivers}`],
                ["Equipe", plan.users],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline gap-2">
                  <dt className="text-black/60">{k}</dt>
                  <span className="qc-leader" aria-hidden="true" />
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Link
            to={`/checkout/${plan.slug}`}
            className={cn("qc-btn mt-3.5 w-full hover:-translate-y-0.5", look.button)}
          >
            Assinar o {plan.name}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
