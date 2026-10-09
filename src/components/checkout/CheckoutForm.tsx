import { useCallback, useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { useForm, useFormContext, type FieldPath, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Barcode, Check, CreditCard, Loader2, QrCode } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { cn, fmtBRL } from "@/lib/utils";
import { maskCEP, maskCardNumber, maskCpfCnpj, maskExpiry, maskPhone } from "@/lib/mask";
import { buildCheckoutSchema, type CheckoutFormValues } from "@/lib/validators/checkout";
import type { PlanSlug } from "@/lib/billing/plans";
import { CheckoutSummaryBar, CheckoutSummaryTag } from "./CheckoutSummary";
import { CheckoutPaymentStatus, type CheckoutStage, type PaymentInfo } from "./CheckoutPaymentStatus";
import { POLL, readFunctionError, usePaymentPolling } from "./paymentStatus";

type BillingType = "CREDIT_CARD" | "BOLETO" | "PIX";
type CepState = "idle" | "loading" | "ok" | "notfound" | "error";
type AppliedCoupon = { code: string; amount: number; total: number };

type ProcessPaymentResponse = {
  error?: string;
  free?: boolean;
  billingType?: BillingType;
  subscriptionId?: string;
  paymentInfo?: PaymentInfo | null;
};

const CARD_FIELDS = ["cardName", "cardNumber", "cardExpiry", "cardCvv"] as const;

const METHODS: Array<{ value: BillingType; label: string; hint: string; icon: typeof CreditCard }> = [
  { value: "CREDIT_CARD", label: "Cartão de crédito", hint: "Aprovação na hora", icon: CreditCard },
  { value: "PIX", label: "Pix", hint: "Aprovação em instantes", icon: QrCode },
  { value: "BOLETO", label: "Boleto", hint: "Até 3 dias úteis", icon: Barcode },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const COUPON_ERRORS: Record<string, string> = {
  "Cupom invalido": "Cupom não encontrado. Confira o código.",
  "Cupom inativo": "Este cupom não está mais ativo.",
  "Cupom expirado": "Este cupom já venceu.",
  "Cupom esgotado": "Este cupom já foi usado o máximo de vezes.",
  "Valor minimo nao atingido para este cupom": "Este cupom não vale para este plano.",
};

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <fieldset className="min-w-0 border-0 p-0">
    <legend className="qc-tape mb-5 !text-[0.8rem]">{title}</legend>
    {children}
  </fieldset>
);

type FieldProps = {
  name: FieldPath<CheckoutFormValues>;
  label: string;
  className?: string;
  mask?: (value: string) => string;
  numeric?: boolean;
  hint?: ReactNode;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
};

const Field = ({ name, label, className, mask, numeric, hint, inputProps }: FieldProps) => {
  const { control } = useFormContext<CheckoutFormValues>();
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem className={cn("space-y-1.5", className)}>
          <FormLabel className="qc-label">{label}</FormLabel>
          <FormControl>
            <input
              {...field}
              {...inputProps}
              value={(field.value as string | undefined) ?? ""}
              onChange={(e) => field.onChange(mask ? mask(e.target.value) : e.target.value)}
              inputMode={numeric ? "numeric" : inputProps?.inputMode}
              className={cn("qc-input", numeric && "qc-input--num")}
            />
          </FormControl>
          {hint}
          <FormMessage className="text-[0.9rem] font-semibold text-[var(--qc-vermelho)]" />
        </FormItem>
      )}
    />
  );
};

export const CheckoutForm = ({
  slug,
  amount,
  planType,
}: {
  slug: PlanSlug;
  amount: number;
  planType: "gestao" | "marketplace";
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isFree = amount === 0;

  const [billingType, setBillingType] = useState<BillingType>("CREDIT_CARD");
  const [stage, setStage] = useState<CheckoutStage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [pollingStopped, setPollingStopped] = useState(false);
  const [formError, setFormError] = useState("");
  const [cepState, setCepState] = useState<CepState>("idle");
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  const total = coupon ? coupon.total : amount;
  const billingRef = useRef(billingType);
  billingRef.current = billingType;
  const cepRequestRef = useRef("");

  const resolver = useCallback<Resolver<CheckoutFormValues>>(
    (values, context, options) =>
      zodResolver(buildCheckoutSchema({ isFree, billingType: billingRef.current }))(values, context, options) as ReturnType<
        Resolver<CheckoutFormValues>
      >,
    [isFree],
  );

  const form = useForm<CheckoutFormValues>({
    resolver,
    defaultValues: {
      nome: "", cpf: "", cep: "", endereco: "", numero: "", complemento: "",
      bairro: "", cidade: "", estado: "", telefone: "",
      cardName: "", cardNumber: "", cardExpiry: "", cardCvv: "",
    },
  });

  useEffect(() => {
    if (!stage) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("checkout-stage-title")?.focus({ preventScroll: true });
  }, [stage?.kind]); // eslint-disable-line react-hooks/exhaustive-deps

  const chooseMethod = (value: BillingType) => {
    setBillingType(value);
    setFormError("");
    if (value !== "CREDIT_CARD") form.clearErrors([...CARD_FIELDS]);
  };

  const lookupCep = async (raw: string) => {
    cepRequestRef.current = raw;
    setCepState("loading");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string };
      if (cepRequestRef.current !== raw) return;
      if (data.erro) {
        setCepState("notfound");
        return;
      }
      const fill = (name: "endereco" | "bairro" | "cidade" | "estado", value?: string) => {
        if (value) form.setValue(name, value, { shouldValidate: form.formState.isSubmitted });
      };
      fill("endereco", data.logradouro);
      fill("bairro", data.bairro);
      fill("cidade", data.localidade);
      fill("estado", data.uf);
      setCepState("ok");
      if (data.logradouro) form.setFocus("numero");
    } catch {
      if (cepRequestRef.current === raw) setCepState("error");
    }
  };

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("Digite o código do cupom.");
      return;
    }
    setCouponLoading(true);
    setCouponError("");
    try {
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: { plan: slug, planType, coupon_code: code, validate_only: true },
      });
      const serverError = error
        ? await readFunctionError(error, "")
        : (data as { error?: string } | null)?.error ?? "";
      if (serverError || !data) throw new Error(COUPON_ERRORS[serverError] ?? "Não deu para consultar o cupom agora. Tente de novo.");

      const result = data as { discount_amount: number; final_amount: number };
      const discount = result.discount_amount;
      setCoupon({ code, amount: discount, total: result.final_amount });
      setCouponInput(code);
      toast.success(`Cupom aplicado: ${fmtBRL(discount)} de desconto`);
    } catch (err) {
      setCoupon(null);
      setCouponError(err instanceof Error ? err.message : "Não deu para validar o cupom.");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const finalize = async () => {
    setFinalizing(true);
    await sleep(1000);
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ["profile"] }),
      queryClient.refetchQueries({ queryKey: ["company"] }),
      queryClient.refetchQueries({ queryKey: ["accessControl"] }),
    ]);
    navigate(planType === "gestao" ? "/dashboard" : "/marketplace/home");
  };

  const handleSettled = (status: "APPROVED" | "REJECTED") => {
    if (status === "APPROVED") {
      setStage({ kind: "approved" });
      toast.success("Pagamento confirmado");
      return;
    }
    const wasCard = stage?.kind === "card" || billingRef.current === "CREDIT_CARD";
    setStage(null);
    setFormError(
      wasCard
        ? "O banco recusou o pagamento. Confira os dados do cartão ou escolha Pix ou boleto."
        : "O pagamento foi recusado pelo banco. Gere uma nova cobrança ou escolha outra forma de pagamento.",
    );
  };

  const subscriptionId = stage && "subscriptionId" in stage ? stage.subscriptionId : null;
  const pollConfig = stage && stage.kind !== "approved" ? POLL[stage.kind] : POLL.pending;
  usePaymentPolling({
    subscriptionId,
    enabled: !!subscriptionId && !pollingStopped,
    ...pollConfig,
    onSettled: handleSettled,
    onTimeout: () => {
      if (stage?.kind === "card") setStage({ kind: "pending", subscriptionId: stage.subscriptionId });
      else setPollingStopped(true);
    },
  });

  const onSubmit = async (values: CheckoutFormValues) => {
    setFormError("");
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { ...values };
      if (isFree || billingType !== "CREDIT_CARD") CARD_FIELDS.forEach((k) => delete payload[k]);
      const body: Record<string, unknown> = { ...payload, plan: slug, planType, amount, billingType };
      if (coupon) body.coupon_code = coupon.code;

      const { data, error } = await supabase.functions.invoke("process-payment", { body });
      if (error) throw new Error(await readFunctionError(error, "Não deu para processar o pagamento. Tente de novo."));
      const resp = (data ?? {}) as ProcessPaymentResponse;
      if (resp.error) throw new Error(resp.error);

      setPollingStopped(false);
      if (resp.free) {
        setStage({ kind: "approved" });
        return;
      }
      if (!resp.subscriptionId) throw new Error("Resposta inesperada do servidor. Tente de novo em instantes.");

      if (resp.billingType === "PIX") setStage({ kind: "pix", subscriptionId: resp.subscriptionId, info: resp.paymentInfo ?? null });
      else if (resp.billingType === "BOLETO") setStage({ kind: "boleto", subscriptionId: resp.subscriptionId, info: resp.paymentInfo ?? null });
      else setStage({ kind: "card", subscriptionId: resp.subscriptionId });
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : "Erro no processamento. Tente de novo.";
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const onInvalid = () => {
    setFormError("Alguns campos precisam de ajuste. Confira os destaques em vermelho.");
  };

  const submitLabel = isFree
    ? "Ativar plano"
    : billingType === "PIX"
      ? `Gerar Pix de ${fmtBRL(total)}`
      : billingType === "BOLETO"
        ? `Gerar boleto de ${fmtBRL(total)}`
        : `Pagar ${fmtBRL(total)}`;

  const cepHint =
    cepState === "loading" ? "Buscando endereço…"
    : cepState === "notfound" ? "CEP não encontrado. Preencha o endereço abaixo."
    : cepState === "error" ? "Não deu para buscar o CEP agora. Preencha o endereço abaixo."
    : "";

  const summaryProps = { slug, amount, discount: coupon };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
      <div className="lg:hidden">
        <CheckoutSummaryBar {...summaryProps} />
      </div>

      <div className="min-w-0">
        {stage ? (
          <CheckoutPaymentStatus
            stage={stage}
            slug={slug}
            total={total}
            planType={planType}
            pollingStopped={pollingStopped}
            finalizing={finalizing}
            onSettled={handleSettled}
            onFinalize={finalize}
          />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} noValidate className="qc-sheet space-y-9 p-5 sm:p-8">
              <Section title="Seus dados">
                <div className="grid gap-4 sm:grid-cols-6">
                  <Field name="nome" label="Nome completo" className="sm:col-span-6" inputProps={{ autoComplete: "name" }} />
                  <Field name="cpf" label="CPF ou CNPJ" className="sm:col-span-3" mask={maskCpfCnpj} numeric inputProps={{ autoComplete: "off", maxLength: 18 }} />
                  <Field name="telefone" label="Celular com DDD" className="sm:col-span-3" mask={maskPhone} numeric inputProps={{ type: "tel", autoComplete: "tel-national", maxLength: 15 }} />
                </div>
              </Section>

              {!isFree && (
                <Section title="Pagamento">
                  <div role="radiogroup" aria-label="Forma de pagamento" className="grid gap-3 sm:grid-cols-3">
                    {METHODS.map(({ value, label, hint, icon: Icon }) => (
                      <label key={value} className="qc-choice">
                        <input
                          type="radio"
                          name="billingType"
                          value={value}
                          checked={billingType === value}
                          onChange={() => chooseMethod(value)}
                          className="sr-only"
                        />
                        <span className="qc-choice-check" aria-hidden="true">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <Icon className="h-6 w-6 text-[var(--qc-azul)]" aria-hidden="true" />
                        <span className="font-bold">{label}</span>
                        <span className="text-[0.88rem] text-black/60">{hint}</span>
                      </label>
                    ))}
                  </div>

                  <div className={cn("mt-5 grid gap-4 sm:grid-cols-6", billingType !== "CREDIT_CARD" && "hidden")}>
                    <Field name="cardNumber" label="Número do cartão" className="sm:col-span-6" mask={maskCardNumber} numeric inputProps={{ autoComplete: "cc-number", maxLength: 23 }} />
                    <Field name="cardName" label="Nome impresso no cartão" className="sm:col-span-6" inputProps={{ autoComplete: "cc-name" }} />
                    <Field name="cardExpiry" label="Validade" className="sm:col-span-3" mask={maskExpiry} numeric inputProps={{ autoComplete: "cc-exp", placeholder: "MM/AA", maxLength: 5 }} />
                    <Field name="cardCvv" label="CVV" className="sm:col-span-3" mask={(v) => v.replace(/\D/g, "").slice(0, 4)} numeric inputProps={{ autoComplete: "cc-csc", maxLength: 4 }} />
                  </div>

                  {billingType === "PIX" && (
                    <p className="mt-4 text-[0.98rem] text-[var(--qc-ink-soft)]">
                      Na próxima tela aparece o QR Code. O plano é ativado assim que o Pix cair, em geral em segundos.
                    </p>
                  )}
                  {billingType === "BOLETO" && (
                    <p className="mt-4 text-[0.98rem] text-[var(--qc-ink-soft)]">
                      O banco leva até 3 dias úteis para confirmar o boleto. O plano é ativado automaticamente na confirmação.
                    </p>
                  )}
                </Section>
              )}

              <Section title="Endereço de cobrança">
                <div className="grid gap-4 sm:grid-cols-6">
                  <Field
                    name="cep"
                    label="CEP"
                    className="sm:col-span-2"
                    mask={(v) => {
                      const masked = maskCEP(v);
                      const raw = masked.replace(/\D/g, "");
                      if (raw.length === 8 && raw !== cepRequestRef.current) void lookupCep(raw);
                      if (raw.length < 8) {
                        cepRequestRef.current = "";
                        setCepState("idle");
                      }
                      return masked;
                    }}
                    numeric
                    inputProps={{ autoComplete: "postal-code", maxLength: 9 }}
                    hint={
                      <p className="flex min-h-[1.25rem] items-center gap-1.5 text-[0.88rem] text-[var(--qc-ink-soft)]" aria-live="polite">
                        {cepState === "loading" && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                        {cepHint}
                      </p>
                    }
                  />
                  <Field name="endereco" label="Rua" className="sm:col-span-4" inputProps={{ autoComplete: "address-line1" }} />
                  <Field name="numero" label="Número" className="sm:col-span-2" inputProps={{ autoComplete: "off" }} />
                  <Field name="complemento" label="Complemento (opcional)" className="sm:col-span-4" inputProps={{ autoComplete: "address-line2" }} />
                  <Field name="bairro" label="Bairro" className="sm:col-span-2" inputProps={{ autoComplete: "off" }} />
                  <Field name="cidade" label="Cidade" className="sm:col-span-3" inputProps={{ autoComplete: "address-level2" }} />
                  <Field
                    name="estado"
                    label="UF"
                    className="sm:col-span-1"
                    mask={(v) => v.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase()}
                    inputProps={{ autoComplete: "address-level1", maxLength: 2 }}
                  />
                </div>
              </Section>

              {!isFree && (
                <div>
                  {coupon ? (
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold text-[var(--qc-verde)]">
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Cupom {coupon.code} aplicado: {fmtBRL(coupon.amount)} de desconto.
                      <button type="button" onClick={removeCoupon} className="qc-link">
                        Remover
                      </button>
                    </p>
                  ) : couponOpen ? (
                    <div>
                      <label htmlFor="checkout-coupon" className="qc-label mb-1.5">
                        Cupom de desconto
                      </label>
                      <div className="flex max-w-[26rem] gap-2">
                        <input
                          id="checkout-coupon"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void applyCoupon();
                            }
                          }}
                          aria-invalid={!!couponError}
                          aria-describedby={couponError ? "checkout-coupon-error" : undefined}
                          autoComplete="off"
                          className="qc-input min-w-0 flex-1 uppercase"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={applyCoupon}
                          disabled={couponLoading}
                          className="qc-btn qc-btn--quiet !min-h-[3rem] shrink-0 !px-5 disabled:opacity-60"
                        >
                          {couponLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                          Aplicar
                        </button>
                      </div>
                      {couponError && (
                        <p id="checkout-coupon-error" className="mt-1.5 text-[0.9rem] font-semibold text-[var(--qc-vermelho)]">
                          {couponError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button type="button" onClick={() => setCouponOpen(true)} className="qc-link">
                      Tem cupom de desconto?
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-4 border-t border-black/10 pt-6">
                {formError && (
                  <div role="alert" className="rounded-lg border-[1.5px] border-[#e2a196] bg-[#fbe9e6] px-4 py-3 font-semibold text-[#7a1d12]">
                    {formError}
                  </div>
                )}
                <button type="submit" disabled={submitting} className="qc-btn qc-btn--primary w-full !text-[1.08rem] disabled:opacity-70">
                  {submitting && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
                  {submitting ? "Processando..." : submitLabel}
                </button>
                {!isFree && (
                  <p className="text-center text-[0.9rem] text-[var(--qc-ink-soft)]">
                    Cobrança mensal recorrente, processada pela Asaas.
                  </p>
                )}
              </div>
            </form>
          </Form>
        )}
      </div>

      <div className="hidden lg:sticky lg:top-8 lg:block">
        <CheckoutSummaryTag {...summaryProps} />
      </div>
    </div>
  );
};
