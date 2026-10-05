import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { fmtBRL } from "@/lib/utils";
import { planSummaryFor, type PlanSlug } from "@/lib/billing/plans";
import { fetchPaymentStatus } from "./paymentStatus";

export type PaymentInfo = {
  invoiceUrl?: string | null;
  bankSlipUrl?: string | null;
  boletoBarCode?: string | null;
  boletoCode?: string | null;
  pixQrCode?: string | null;
  pixCopiaECola?: string | null;
  payload?: string | null;
};

export type CheckoutStage =
  | { kind: "pix"; subscriptionId: string; info: PaymentInfo | null }
  | { kind: "boleto"; subscriptionId: string; info: PaymentInfo | null }
  | { kind: "card"; subscriptionId: string }
  | { kind: "pending"; subscriptionId: string }
  | { kind: "approved" };

const Sheet = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="qc-sheet p-5 sm:p-8" aria-labelledby="checkout-stage-title">
    <h2 id="checkout-stage-title" className="text-[1.6rem] font-[820] leading-tight" style={{ fontStretch: "118%" }}>
      {title}
    </h2>
    <div className="mt-4 space-y-5 text-[1rem] leading-relaxed">{children}</div>
  </section>
);

const Waiting = ({ children }: { children: ReactNode }) => (
  <p className="flex items-center gap-2.5 font-semibold" role="status">
    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--qc-azul)]" aria-hidden="true" />
    {children}
  </p>
);

const CopyField = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  const id = `copy-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="qc-label mb-1.5">
        {label}
      </label>
      <div className="flex gap-2">
        <input id={id} readOnly value={value} className="qc-input min-w-0 flex-1 font-mono !text-[0.85rem]" onFocus={(e) => e.target.select()} />
        <button type="button" onClick={copy} className="qc-btn qc-btn--primary !min-h-[3rem] shrink-0 !px-4">
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          <span aria-live="polite">{copied ? "Copiado" : "Copiar"}</span>
        </button>
      </div>
    </div>
  );
};

const ManualCheck = ({ subscriptionId, onSettled }: { subscriptionId: string; onSettled: (s: "APPROVED" | "REJECTED") => void }) => {
  const [checking, setChecking] = useState(false);
  const [note, setNote] = useState("");

  const check = async () => {
    setChecking(true);
    setNote("");
    const status = await fetchPaymentStatus(subscriptionId);
    setChecking(false);
    if (status === "APPROVED" || status === "REJECTED") onSettled(status);
    else if (status === "ERROR") setNote("Não deu para consultar agora. Tente de novo em alguns segundos.");
    else setNote("O banco ainda não confirmou o pagamento.");
  };

  return (
    <div>
      <button type="button" onClick={check} disabled={checking} className="qc-btn qc-btn--quiet w-full disabled:opacity-60 sm:w-auto">
        {checking && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {checking ? "Consultando..." : "Já paguei, conferir agora"}
      </button>
      <p className="mt-2 min-h-[1.5rem] text-[0.95rem] text-[var(--qc-ink-soft)]" aria-live="polite">
        {note}
      </p>
    </div>
  );
};

type StatusProps = {
  stage: CheckoutStage;
  slug: PlanSlug;
  total: number;
  planType: "gestao" | "marketplace";
  pollingStopped: boolean;
  finalizing: boolean;
  onSettled: (status: "APPROVED" | "REJECTED") => void;
  onFinalize: () => void;
};

export const CheckoutPaymentStatus = ({ stage, slug, total, planType, pollingStopped, finalizing, onSettled, onFinalize }: StatusProps) => {
  const summary = planSummaryFor(slug);

  if (stage.kind === "approved") {
    return (
      <Sheet title={`Pronto, o ${summary.name} está ativo`}>
        <p>Pagamento confirmado. Seu quadro já tem estes limites:</p>
        <dl className="max-w-[24rem] space-y-1.5">
          {summary.rows.map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-2">
              <dt className="text-black/60">{k}</dt>
              <span className="qc-leader" aria-hidden="true" />
              <dd className="font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <button type="button" onClick={onFinalize} disabled={finalizing} className="qc-btn qc-btn--primary w-full disabled:opacity-70 sm:w-auto">
          {finalizing && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {finalizing ? "Abrindo..." : planType === "gestao" ? "Ir para o painel" : "Ir para o marketplace"}
        </button>
      </Sheet>
    );
  }

  if (stage.kind === "card") {
    return (
      <Sheet title="Confirmando com o banco…">
        <Waiting>Isso costuma levar menos de um minuto.</Waiting>
        <p className="text-[var(--qc-ink-soft)]">Não feche esta tela. Assim que o banco responder, seguimos sozinhos.</p>
      </Sheet>
    );
  }

  if (stage.kind === "pending") {
    return (
      <Sheet title="Pagamento em análise">
        <p>
          O banco ainda não confirmou a cobrança de <strong className="qc-num">{fmtBRL(total)}</strong>. Quando confirmar, o{" "}
          {summary.name} é ativado automaticamente, mesmo que você feche esta tela.
        </p>
        <ManualCheck subscriptionId={stage.subscriptionId} onSettled={onSettled} />
        <p className="text-[0.95rem] text-[var(--qc-ink-soft)]">
          Demorando muito? <Link to="/ajuda" className="qc-link">Fale com a gente na central de ajuda</Link>.
        </p>
      </Sheet>
    );
  }

  if (stage.kind === "pix") {
    const code = stage.info?.pixCopiaECola || stage.info?.payload || "";
    return (
      <Sheet title="Pague com Pix">
        <p>
          Valor: <strong className="qc-num text-[1.2rem]">{fmtBRL(total)}</strong>. Abra o app do seu banco e escaneie o QR Code ou use o
          código copia e cola.
        </p>
        {stage.info?.pixQrCode && (
          <img
            src={`data:image/png;base64,${stage.info.pixQrCode}`}
            alt="QR Code do Pix"
            width={208}
            height={208}
            className="h-52 w-52 rounded-lg border border-black/10 bg-white p-2"
          />
        )}
        {code && <CopyField label="Pix copia e cola" value={code} />}
        {!stage.info?.pixQrCode && !code && stage.info?.invoiceUrl && (
          <a href={stage.info.invoiceUrl} target="_blank" rel="noopener noreferrer" className="qc-btn qc-btn--primary">
            Abrir cobrança Pix <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
        {pollingStopped ? (
          <p className="text-[var(--qc-ink-soft)]">Paramos de conferir sozinhos. Se você já pagou, use o botão abaixo.</p>
        ) : (
          <Waiting>Aguardando o pagamento. Esta tela atualiza sozinha.</Waiting>
        )}
        <ManualCheck subscriptionId={stage.subscriptionId} onSettled={onSettled} />
      </Sheet>
    );
  }

  const slipUrl = stage.info?.invoiceUrl || stage.info?.bankSlipUrl || "";
  const barCode = stage.info?.boletoBarCode || stage.info?.boletoCode || "";
  return (
    <Sheet title="Boleto gerado">
      <p>
        Valor: <strong className="qc-num text-[1.2rem]">{fmtBRL(total)}</strong>. Pague pelo app do banco ou em uma lotérica.
      </p>
      {slipUrl && (
        <a href={slipUrl} target="_blank" rel="noopener noreferrer" className="qc-btn qc-btn--primary w-full sm:w-auto">
          Abrir boleto <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
      {barCode && <CopyField label="Linha digitável" value={barCode} />}
      <p className="text-[var(--qc-ink-soft)]">
        Depois do pagamento, o banco leva até 3 dias úteis para confirmar. O {summary.name} é ativado automaticamente na confirmação, e
        você pode fechar esta tela.
      </p>
      <ManualCheck subscriptionId={stage.subscriptionId} onSettled={onSettled} />
    </Sheet>
  );
};
