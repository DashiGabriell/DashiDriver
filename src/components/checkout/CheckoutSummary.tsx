import { ChevronDown } from "lucide-react";
import { fmtBRL } from "@/lib/utils";
import { planSummaryFor, type PlanSlug } from "@/lib/billing/plans";

type CheckoutSummaryProps = {
  slug: PlanSlug;
  amount: number;
  discount?: { code: string; amount: number; total: number } | null;
};

const Lines = ({ slug, amount, discount }: CheckoutSummaryProps) => {
  const summary = planSummaryFor(slug);
  const total = discount ? discount.total : amount;

  return (
    <>
      <dl className="space-y-1.5 text-[0.98rem]">
        {summary.rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-2">
            <dt className="text-black/60">{k}</dt>
            <span className="qc-leader" aria-hidden="true" />
            <dd className="font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      <dl className="mt-4 space-y-1.5 border-t border-black/10 pt-3 text-[0.98rem]">
        <div className="flex items-baseline gap-2">
          <dt className="text-black/60">Mensalidade</dt>
          <span className="qc-leader" aria-hidden="true" />
          <dd className="qc-num font-semibold">{fmtBRL(amount)}</dd>
        </div>
        {discount && (
          <div className="flex items-baseline gap-2 text-[var(--qc-verde)]">
            <dt>Cupom {discount.code}</dt>
            <span className="qc-leader" aria-hidden="true" />
            <dd className="qc-num font-semibold">−{fmtBRL(discount.amount)}</dd>
          </div>
        )}
        <div className="flex items-baseline gap-2 pt-1">
          <dt className="font-semibold">Total hoje</dt>
          <span className="qc-leader" aria-hidden="true" />
          <dd className="qc-num text-[1.6rem] font-bold leading-none">{fmtBRL(total)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-[0.9rem] text-black/65">
        {amount === 0 ? "Sem cobrança." : "Cobrança mensal recorrente no mesmo meio de pagamento."}
      </p>
    </>
  );
};

/** Etiqueta pendurada com o resumo do pedido (desktop). */
export const CheckoutSummaryTag = (props: CheckoutSummaryProps) => {
  const summary = planSummaryFor(props.slug);
  return (
    <aside aria-label="Resumo do pedido" className="qc-hook mx-auto w-full max-w-[22rem]" style={{ ["--wire" as string]: "40px" }}>
      <div className="qc-tag !rounded-[18px_18px_30px_30px] !px-3.5 !pb-4 !pt-11" data-status="plano">
        <div className="qc-insert !rounded-[10px] !px-4 !pb-4 !pt-3.5">
          <h2 className="text-[1.5rem] font-[820]" style={{ fontStretch: "120%" }}>
            {summary.name}
          </h2>
          <div className="mb-4 mt-1 flex items-baseline gap-1.5">
            <span className="text-[1.05rem] font-semibold">R$</span>
            <span className="qc-num text-[3.2rem] font-bold leading-[0.9]">{props.amount}</span>
            <span className="text-[0.98rem] text-black/60">/mês</span>
          </div>
          <Lines {...props} />
        </div>
      </div>
    </aside>
  );
};

/** Barra recolhível com o resumo do pedido (mobile). */
export const CheckoutSummaryBar = (props: CheckoutSummaryProps) => {
  const summary = planSummaryFor(props.slug);
  const total = props.discount ? props.discount.total : props.amount;
  return (
    <details className="qc-sheet group overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
        <span className="font-semibold">
          {summary.name} <span className="font-normal text-black/60">· resumo</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="qc-num text-[1.25rem] font-bold">{fmtBRL(total)}</span>
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        </span>
      </summary>
      <div className="border-t border-black/10 px-4 pb-4 pt-3">
        <Lines {...props} />
      </div>
    </details>
  );
};
