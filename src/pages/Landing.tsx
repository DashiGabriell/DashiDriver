import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { useAuth } from "@/integrations/supabase/auth";
import { cn } from "@/lib/utils";
import { EXAMPLE_FLEET } from "@/components/landing/fleet";
import { KeyTag, Plate, STATUS_CYCLE, brl, useSwing, type Car } from "@/components/landing/KeyTag";
import "@/components/landing/landing.css";

const PLANS = [
  { name: "Básico", slug: "gestao-basico", price: 199, cars: 5, drivers: 10, users: "1 usuário" },
  { name: "Pro", slug: "gestao-pro", price: 399, cars: 20, drivers: 40, users: "até 3 usuários" },
  { name: "Master", slug: "gestao-master", price: 799, cars: 100, drivers: 200, users: "até 200 usuários" },
];

const TAG_ROWS = [
  {
    field: "Motorista",
    value: "Jefferson Souza",
    detail: "CNH B · vence 12/2027",
    module: "Motoristas",
    text: "CPF, CNH com validade, histórico de locações e quem está inadimplente.",
  },
  {
    field: "Cobrança",
    value: "R$ 650 por semana",
    detail: "Próxima: seg, 12/10 · Pix",
    module: "Pagamentos",
    text: "Cobrança diária, semanal ou mensal por motorista. Você vê quem pagou e quem está devendo sem abrir o extrato.",
  },
  {
    field: "Vistoria",
    value: "Saída em 28/09",
    detail: "7 etapas · PDF no WhatsApp",
    module: "Vistorias",
    text: "Fotos guiadas na entrega e na devolução, com PDF pronto para mandar ao motorista.",
  },
  {
    field: "Oficina",
    value: "Troca de óleo em 1.200 km",
    detail: "Última: 14/08 · R$ 280",
    module: "Manutenção",
    text: "Preventiva e corretiva, com custo e nota fiscal de cada serviço e o km rodado de cada carro.",
  },
  {
    field: "Seguro e parcela",
    value: "Parcela 7 de 12 paga",
    detail: "Próxima: 20/10",
    module: "Financiamento e seguro",
    text: "Parcelas do carro e do seguro com data marcada, para nenhuma vencer esquecida.",
  },
  {
    field: "Lucro do carro",
    value: "R$ 1.940 em setembro",
    detail: "receita − oficina − seguro − parcela",
    module: "Lucratividade",
    text: "Quanto cada carro deixou no mês depois de todos os custos. O que não se paga aparece primeiro.",
  },
];

const INSPECTION_STEPS = [
  "Foto frontal",
  "Foto traseira",
  "Lateral direita",
  "Lateral esquerda",
  "Interior frente",
  "Painel: km e combustível",
  "Pneus",
];

const COMPARISON = [
  { step: "Foto frontal", note: "Sem alteração" },
  { step: "Foto traseira", note: "Sem alteração" },
  { step: "Lateral direita", note: "Risco na porta traseira", flag: true },
  { step: "Lateral esquerda", note: "Sem alteração" },
  { step: "Interior frente", note: "Sem alteração" },
  { step: "Painel", note: "48.210 km → 49.870 km" },
  { step: "Pneus", note: "Sem alteração" },
];

const useIsSmall = () => {
  const [small, setSmall] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 639px)").matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const onChange = () => setSmall(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return small;
};

const useHoleAlign = (board: React.RefObject<HTMLElement>, grid: React.RefObject<HTMLElement>) => {
  useLayoutEffect(() => {
    const section = board.current;
    const container = grid.current;
    if (!section || !container) return;

    const align = () => {
      const hook = container.firstElementChild as HTMLElement | null;
      if (!hook) return;
      const s = section.getBoundingClientRect();
      const h = hook.getBoundingClientRect();
      section.style.setProperty("--hx", `${h.left + h.width / 2 - s.left}px`);
      section.style.setProperty("--hy", `${h.top + 6.5 - s.top}px`);
    };

    align();
    const ro = new ResizeObserver(align);
    ro.observe(section);
    ro.observe(container);
    document.fonts?.ready.then(align);
    return () => ro.disconnect();
  }, [board, grid]);
};

const SectionHeading = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={cn("qc-display text-[clamp(1.95rem,4.1vw,3.6rem)]", className)}>{children}</h2>
);

const Landing = () => {
  const { session } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [fleet, setFleet] = useState<Car[]>(EXAMPLE_FLEET);
  const isSmall = useIsSmall();
  const visible = isSmall ? fleet.slice(0, 9) : fleet;
  const heroRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  useHoleAlign(heroRef, gridRef);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const summary = useMemo(() => {
    const count = (s: Car["status"]) => visible.filter((c) => c.status === s).length;
    return {
      total: visible.length,
      rodando: count("alugado") + count("atrasado"),
      patio: count("disponivel"),
      oficina: count("oficina"),
      atrasado: count("atrasado"),
      receber: visible.filter((c) => c.status === "alugado").reduce((sum, c) => sum + c.weekly, 0),
      devendo: visible.filter((c) => c.status === "atrasado").reduce((sum, c) => sum + c.weekly, 0),
    };
  }, [visible]);

  const cycle = (plate: string) =>
    setFleet((cars) =>
      cars.map((c) =>
        c.plate === plate
          ? { ...c, status: STATUS_CYCLE[(STATUS_CYCLE.indexOf(c.status) + 1) % STATUS_CYCLE.length] }
          : c,
      ),
    );

  const enterTo = session ? "/dashboard" : "/login";
  const enterLabel = session ? "Ir para o painel" : "Entrar";

  return (
    <div className="qc-root min-h-screen">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,padding] duration-300",
          scrolled ? "bg-[#23272b] py-2.5 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.6)]" : "py-5",
        )}
      >
        <nav className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 md:px-8" aria-label="Principal">
          <Link to="/" className="qc-tape qc-tape--azul !text-[0.95rem]" aria-label="DashiDrive, página inicial">
            DashiDrive
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <a href="#etiqueta" className="qc-tape">Como funciona</a>
            <a href="#vistoria" className="qc-tape">Vistoria</a>
            <a href="#planos" className="qc-tape">Planos</a>
          </div>
          <Link
            to={enterTo}
            className={cn("qc-btn !min-h-[2.75rem] !px-5 !text-[0.95rem]", scrolled ? "qc-btn--steel" : "qc-btn--quiet")}
          >
            {enterLabel}
          </Link>
        </nav>
      </header>

      <main>
        {/* Quadro */}
        <section ref={heroRef} className="qc-board relative overflow-hidden pb-16 pt-24 md:pb-20 lg:min-h-[100svh]">
          <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-4 sm:px-5 md:px-8 lg:grid-cols-12 lg:gap-10">
            <div className="qc-quiet lg:col-span-5">
              <h1 className="qc-display text-[clamp(2.35rem,5.2vw,4.5rem)]">
                A locadora inteira num <span className="qc-inline-tape whitespace-nowrap">quadro</span> só.
              </h1>
              <p className="mt-7 max-w-[34rem] text-[1.12rem] font-[480] leading-relaxed text-[var(--qc-ink)]">
                Cada carro da frota com motorista, cobrança da semana, vistoria, oficina e seguro no mesmo lugar. Sem
                planilha e sem caçar comprovante no WhatsApp.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a href="#planos" className="qc-btn qc-btn--primary group">
                  Escolher meu plano
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </a>
                <Link to={enterTo} className="qc-btn qc-btn--quiet">
                  {session ? "Ir para o painel" : "Já sou cliente"}
                </Link>
              </div>
              <p className="mt-6 text-[0.95rem] font-medium text-[var(--qc-ink-soft)]">
                Planos a partir de <span className="qc-num text-[1.1rem] font-bold">R$ 199</span>/mês · cartão, Pix ou boleto
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="mx-auto w-fit">
                <div
                  ref={gridRef}
                  className="grid auto-rows-[160px] grid-cols-[repeat(3,102px)] gap-x-[26px] sm:grid-cols-[repeat(4,144px)] sm:gap-x-4 lg:grid-cols-[repeat(4,112px)] xl:grid-cols-[repeat(4,144px)]"
                >
                  {visible.map((car, i) => (
                    <KeyTag key={car.plate} car={car} index={i} onCycle={() => cycle(car.plate)} />
                  ))}
                </div>

                <div
                  className="qc-steel mt-2 rounded-lg px-4 py-2.5 text-[0.92rem] shadow-[0_10px_20px_-12px_rgba(40,20,5,0.7)]"
                  aria-live="polite"
                >
                  <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                    <span className="text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-[var(--qc-steel-soft)]" style={{ fontStretch: "115%" }}>
                      Exemplo · esta semana
                    </span>
                    <span>
                      A receber <strong className="qc-num text-[1.2rem] font-bold text-white">{brl(summary.receber)}</strong>
                    </span>
                    <span>
                      Atrasado <strong className="qc-num text-[1.2rem] font-bold text-[#ff8a7a]">{brl(summary.devendo)}</strong>
                    </span>
                    <span className="text-[var(--qc-steel-soft)]">
                      <span className="qc-num font-semibold text-white">{summary.rodando}</span> rodando ·{" "}
                      <span className="qc-num font-semibold text-white">{summary.patio}</span> no pátio ·{" "}
                      <span className="qc-num font-semibold text-white">{summary.oficina}</span> na oficina
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="qc-tape qc-tape--azul">Alugado</span>
                  <span className="qc-tape qc-tape--verde">No pátio</span>
                  <span className="qc-tape qc-tape--amarelo">Oficina</span>
                  <span className="qc-tape qc-tape--vermelho">Atrasado</span>
                  <span className="ml-auto rounded bg-[rgba(251,250,246,0.85)] px-2 py-0.5 text-[0.86rem] font-semibold text-[var(--qc-ink)]">
                    Toque numa etiqueta para mudar o status
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Etiqueta */}
        <section id="etiqueta" className="qc-steel scroll-mt-16 py-24 md:py-32">
          <div className="mx-auto max-w-[1240px] px-5 md:px-8">
            <div className="max-w-[46rem]">
              <SectionHeading>Uma etiqueta guarda o carro inteiro.</SectionHeading>
              <p className="mt-6 max-w-[40rem] text-[1.1rem] leading-relaxed text-[var(--qc-steel-soft)]">
                Na parede, a etiqueta diz só a placa. No DashiDrive ela abre a vida do carro: quem está com ele, quanto
                deve, como saiu e quando volta para a oficina.
              </p>
            </div>

            <TagAnatomy />
          </div>
        </section>

        {/* Vistoria */}
        <section id="vistoria" className="qc-yellow scroll-mt-16 py-24 md:py-32">
          <div className="mx-auto grid max-w-[1240px] gap-14 px-5 md:px-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <SectionHeading>A vistoria sai do celular e chega no WhatsApp.</SectionHeading>
              <p className="mt-6 max-w-[34rem] text-[1.1rem] leading-relaxed">
                Na entrega e na devolução, sua equipe fotografa o carro em etapas guiadas. O DashiDrive monta o PDF com as
                fotos, manda para o motorista e guarda o histórico de cada carro.
              </p>

              <ol className="mt-10 border-t-2 border-[var(--qc-tape)]">
                {INSPECTION_STEPS.map((step, i) => (
                  <li key={step} className="grid grid-cols-[3.25rem_1fr] items-baseline border-b border-[rgba(22,23,27,0.35)] py-2.5">
                    <span className="qc-num text-[1.9rem] font-bold leading-none">{i + 1}</span>
                    <span className="text-[1.05rem] font-semibold">{step}</span>
                  </li>
                ))}
                <li className="grid grid-cols-[3.25rem_1fr] items-baseline py-2.5">
                  <Plus className="h-5 w-5" aria-hidden="true" />
                  <span className="text-[1.05rem] font-medium">Avarias, quando houver</span>
                </li>
              </ol>
            </div>

            <div className="lg:col-span-7 lg:pl-6">
              <ComparisonSheet />
            </div>
          </div>
        </section>

        {/* Planos */}
        <Pricing />

        {/* Fechamento */}
        <section className="qc-steel pt-24 md:pt-32">
          <div className="mx-auto max-w-[1240px] px-5 md:px-8">
            <div className="max-w-[52rem]">
              <SectionHeading className="text-[clamp(2.2rem,5.4vw,4.5rem)]">
                Tire a frota da planilha e pendure no lugar certo.
              </SectionHeading>
              <div className="mt-10 flex flex-wrap gap-3">
                <a href="#planos" className="qc-btn qc-btn--primary group">
                  Escolher meu plano
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </a>
                <Link to={enterTo} className="qc-btn qc-btn--steel">
                  {enterLabel}
                </Link>
              </div>
            </div>

            <footer className="mt-24 flex flex-col gap-6 border-t border-white/15 py-10 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <span className="qc-tape qc-tape--azul">DashiDrive</span>
                <span className="text-[0.92rem] text-[var(--qc-steel-soft)]">Gestão de frota para locadoras</span>
              </div>
              <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem]" aria-label="Rodapé">
                <a href="#etiqueta" className="text-[var(--qc-steel-soft)] underline-offset-4 hover:text-white hover:underline">Como funciona</a>
                <a href="#vistoria" className="text-[var(--qc-steel-soft)] underline-offset-4 hover:text-white hover:underline">Vistoria</a>
                <a href="#planos" className="text-[var(--qc-steel-soft)] underline-offset-4 hover:text-white hover:underline">Planos</a>
                <Link to={enterTo} className="text-[var(--qc-steel-soft)] underline-offset-4 hover:text-white hover:underline">{enterLabel}</Link>
              </nav>
              <p className="text-[0.88rem] text-[var(--qc-steel-soft)]">© 2026 DashiDrive · Feito pela Squad Dashi</p>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
};

const TagAnatomy = () => {
  const controls = useSwing(0.2);

  return (
    <div className="relative mt-16 lg:mt-20">
      <div className="mx-auto mb-[-6px] h-[14px] w-[13px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#fafafa,#a3a9af_55%,#4a4f55)] lg:mx-0 lg:ml-[calc(13rem-6.5px)]" aria-hidden="true" />
      <div className="grid gap-x-12 lg:grid-cols-[26rem_1fr]">
        <motion.div className="qc-swing mx-auto w-full max-w-[26rem] lg:row-span-7 lg:mx-0" animate={controls}>
          <div className="qc-tag qc-tag--steelboard !rounded-[22px_22px_28px_28px] !px-4 !pb-5 !pt-10" data-status="alugado">
            <div className="qc-insert !rounded-[10px] !p-4">
              <Plate plate="QTP4E21" size="lg" />
              <div className="mt-3 flex items-baseline justify-between text-[0.95rem]">
                <span className="font-semibold">Onix 1.0 · 2022</span>
                <span className="text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[var(--qc-azul)]" style={{ fontStretch: "115%" }}>
                  Alugado
                </span>
              </div>
              <dl className="mt-3 divide-y divide-black/10 border-t border-black/10">
                {TAG_ROWS.map((row) => (
                  <div key={row.field} className="py-2.5">
                    <dt className="text-[0.74rem] font-bold uppercase tracking-[0.12em] text-black/55" style={{ fontStretch: "112%" }}>
                      {row.field}
                    </dt>
                    <dd className="mt-0.5 text-[1.02rem] font-semibold leading-snug">{row.value}</dd>
                    <dd className="text-[0.86rem] text-black/65">{row.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="mt-3 px-1 text-[0.8rem] text-white/85">Dados de exemplo</div>
          </div>
        </motion.div>

        <ul className="mt-14 space-y-9 lg:mt-24">
          {TAG_ROWS.map((row) => (
            <li key={row.module} className="flex gap-4">
              <span className="qc-leader hidden max-w-16 lg:block" aria-hidden="true" />
              <div className="max-w-[34rem]">
                <h3 className="text-[1.28rem] font-[780]" style={{ fontStretch: "108%" }}>
                  {row.module}
                </h3>
                <p className="mt-1.5 leading-relaxed text-[var(--qc-steel-soft)]">{row.text}</p>
              </div>
            </li>
          ))}
          <li className="flex gap-4">
            <span className="qc-leader hidden max-w-16 lg:block" aria-hidden="true" />
            <div className="max-w-[34rem]">
              <h3 className="text-[1.28rem] font-[780]" style={{ fontStretch: "108%" }}>
                Alertas
              </h3>
              <p className="mt-1.5 leading-relaxed text-[var(--qc-steel-soft)]">
                CNH vencendo, IPVA, seguro, manutenção e pagamento atrasado chegam até você antes de virar prejuízo.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

const ComparisonSheet = () => (
  <figure className="relative rotate-[0.6deg] rounded-[6px] bg-[var(--qc-paper)] p-6 text-[var(--qc-tape)] shadow-[0_18px_40px_-18px_rgba(70,45,0,0.65),0_3px_6px_rgba(70,45,0,0.2)] md:p-9">
    <figcaption className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[var(--qc-tape)] pb-4">
      <div>
        <div className="text-[1.35rem] font-[800]" style={{ fontStretch: "110%" }}>
          Saída × devolução
        </div>
        <div className="qc-num mt-0.5 text-[1.05rem] font-semibold text-black/65">28/09 → 05/10 · Onix 1.0</div>
      </div>
      <div className="w-[9.5rem]">
        <Plate plate="QTP4E21" />
      </div>
    </figcaption>

    <table className="mt-2 w-full text-left text-[1rem]">
      <thead className="sr-only">
        <tr>
          <th>Etapa</th>
          <th>Observação</th>
        </tr>
      </thead>
      <tbody>
        {COMPARISON.map((row) => (
          <tr key={row.step} className="border-b border-black/10 last:border-0">
            <td className="py-3 pr-4 font-semibold">{row.step}</td>
            <td className={cn("py-3 text-right", row.flag ? "font-semibold text-[var(--qc-vermelho)]" : "text-black/65")}>
              {row.flag && <span className="qc-tape qc-tape--vermelho mr-2 !text-[0.66rem]">Novo</span>}
              <span className={row.step === "Painel" ? "qc-num text-[1.08rem] font-semibold text-[var(--qc-tape)]" : undefined}>
                {row.note}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="mt-6 flex flex-wrap items-center gap-2 border-t-2 border-[var(--qc-tape)] pt-5">
      <span className="qc-tape">PDF enviado no WhatsApp</span>
      <span className="qc-tape">Link público da vistoria</span>
      <span className="ml-auto text-[0.85rem] text-black/55">Exemplo</span>
    </div>
  </figure>
);

const Pricing = () => {
  const [cars, setCars] = useState(12);
  const fit = PLANS.find((p) => cars <= p.cars) ?? PLANS[PLANS.length - 1];
  const fill = `${((cars - 1) / 99) * 100}%`;

  return (
    <section id="planos" className="qc-board scroll-mt-16 overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="qc-quiet lg:col-span-6">
            <SectionHeading>Quantos carros tem no seu quadro?</SectionHeading>
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
          {PLANS.map((plan, i) => (
            <PlanTag key={plan.slug} plan={plan} index={i} active={plan.slug === fit.slug} />
          ))}
        </div>

        <p className="qc-quiet mt-12 inline-block text-[0.98rem] font-semibold text-[var(--qc-ink)]">
          Valores mensais. Pagamento no cartão de crédito, Pix ou boleto.
        </p>
      </div>
    </section>
  );
};

const PLAN_LOOK = [
  { status: "plano", wire: 30, button: "bg-[var(--qc-tape)] text-white" },
  { status: "alugado", wire: 78, button: "bg-white text-[var(--qc-azul)]" },
  { status: "grafite", wire: 46, button: "bg-white text-[var(--qc-tape)]" },
] as const;

const PlanTag = ({ plan, index, active }: { plan: (typeof PLANS)[number]; index: number; active: boolean }) => {
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

export default Landing;
