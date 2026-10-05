import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Pricing } from "@/components/landing/Pricing";
import { MKT_PLAN_LIMITS, PLAN_CATALOG } from "@/lib/billing/plans";
import "@/components/landing/landing.css";

const MKT_PLANS = [
  { slug: "marketplace-free", name: "Free", price: PLAN_CATALOG["marketplace-free"].price, listings: MKT_PLAN_LIMITS.FREE.listings },
  { slug: "marketplace-pro", name: "Pro", price: PLAN_CATALOG["marketplace-pro"].price, listings: MKT_PLAN_LIMITS.PRO.listings },
  { slug: "marketplace-elite", name: "Elite", price: PLAN_CATALOG["marketplace-elite"].price, listings: MKT_PLAN_LIMITS.ELITE.listings },
] as const;

const PlanosPage = () => (
  <div className="qc-root flex min-h-screen flex-col">
    <header className="qc-steel">
      <nav className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-3 md:px-8" aria-label="Planos">
        <Link to="/" className="qc-tape qc-tape--azul !text-[0.95rem]" aria-label="DashiDrive, página inicial">
          DashiDrive
        </Link>
        <Link to="/" className="qc-btn qc-btn--steel !min-h-[2.5rem] !px-4 !text-[0.92rem]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar ao site
        </Link>
      </nav>
    </header>

    <main className="flex-1">
      <Pricing
        headingAs="h1"
        footnote={<p className="mt-1">Manutenção e Alertas a partir do Pro.</p>}
      />

      <section className="qc-steel py-14" aria-labelledby="planos-marketplace">
        <div className="mx-auto max-w-[1240px] px-5 md:px-8">
          <h2 id="planos-marketplace" className="text-[1.6rem] font-[820] text-white" style={{ fontStretch: "118%" }}>
            Só quer anunciar carros no marketplace?
          </h2>
          <p className="mt-2 max-w-[38rem] text-[1.02rem] text-[var(--qc-steel-soft)]">
            Planos à parte da gestão, pelo número de anúncios ativos.{" "}
            <Link to="/lp-marketplace" className="font-semibold text-white underline underline-offset-4">
              Conheça o marketplace
            </Link>
          </p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-3">
            {MKT_PLANS.map((plan) => (
              <li key={plan.slug}>
                <Link
                  to={`/checkout/${plan.slug}`}
                  className="flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 shadow-[inset_0_0_0_1.5px_rgba(237,239,241,0.3)] transition-colors hover:bg-white/5"
                >
                  <span>
                    <span className="block font-bold text-white">Marketplace {plan.name}</span>
                    <span className="text-[0.92rem] text-[var(--qc-steel-soft)]">
                      até {plan.listings} {plan.listings === 1 ? "anúncio" : "anúncios"}
                    </span>
                  </span>
                  <span className="qc-num text-[1.5rem] font-bold text-white">
                    {plan.price === 0 ? "Grátis" : `R$ ${plan.price}`}
                    {plan.price > 0 && <span className="text-[0.9rem] font-normal text-[var(--qc-steel-soft)]">/mês</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>

    <footer className="qc-steel border-t border-white/10">
      <div className="mx-auto max-w-[1240px] px-5 py-6 text-[0.88rem] text-[var(--qc-steel-soft)] md:px-8">
        © 2026 DashiDrive · Feito pela Squad Dashi
      </div>
    </footer>
  </div>
);

export default PlanosPage;
