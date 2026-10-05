import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import "@/components/landing/landing.css";

type CheckoutLayoutProps = {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
};

export const CheckoutLayout = ({ title, subtitle, children }: CheckoutLayoutProps) => (
  <div className="qc-root qc-board flex min-h-screen flex-col">
    <header className="qc-steel shadow-[0_8px_20px_-10px_rgba(0,0,0,0.6)]">
      <nav
        className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-3 sm:px-6"
        aria-label="Checkout"
      >
        <Link to="/" className="qc-tape qc-tape--azul !text-[0.95rem]" aria-label="DashiDrive, página inicial">
          DashiDrive
        </Link>
        <p className="hidden items-center gap-2 text-[0.9rem] text-[var(--qc-steel-soft)] sm:flex">
          <Lock className="h-4 w-4" aria-hidden="true" />
          Pagamento processado pela Asaas
        </p>
        <Link to="/planos" className="qc-btn qc-btn--steel !min-h-[2.5rem] !px-4 !text-[0.92rem]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Trocar plano
        </Link>
      </nav>
    </header>

    <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 pb-16 pt-10 sm:px-6 md:pt-14">
      <div className="mb-8 max-w-[40rem] md:mb-10">
        <h1 className="qc-display text-[clamp(2rem,4.4vw,3.4rem)]">{title}</h1>
        {subtitle && <div className="mt-4 text-[1.05rem] font-medium leading-relaxed text-[var(--qc-ink)]">{subtitle}</div>}
      </div>
      {children}
    </main>

    <footer className="qc-steel">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-4 py-6 text-[0.9rem] text-[var(--qc-steel-soft)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="flex items-center gap-2 sm:hidden">
          <Lock className="h-4 w-4" aria-hidden="true" />
          Pagamento processado pela Asaas
        </p>
        <p>© 2026 DashiDrive · Feito pela Squad Dashi</p>
        <Link to="/ajuda" className="underline-offset-4 hover:text-white hover:underline">
          Dúvidas? Central de ajuda
        </Link>
      </div>
    </footer>
  </div>
);
