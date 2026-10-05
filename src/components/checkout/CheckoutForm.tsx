import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { maskCPF, maskCEP, maskCardNumber, maskExpiry, maskPhone } from "@/lib/mask";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { buildCheckoutSchema, type CheckoutFormValues } from "@/lib/validators/checkout";

type BillingType = "CREDIT_CARD" | "BOLETO" | "PIX";

type PaymentInfo = {
  invoiceUrl?: string;
  boletoBarCode?: string;
  pixQrCode?: string;
  pixCopiaECola?: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const CheckoutForm = ({
  planName,
  amount,
  planType,
}: {
  planName: string;
  amount: number;
  planType: "gestao" | "marketplace";
}) => {
  const [billingType, setBillingType] = useState<BillingType>("CREDIT_CARD");
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [conferindo, setConferindo] = useState(false);
  const [paymentApproved, setPaymentApproved] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponApplied, setCouponApplied] = useState<{
    discount_amount: number;
    final_amount: number;
  } | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isFree = amount === 0;
  const displayedAmount = couponApplied ? couponApplied.final_amount : amount;

  const schema = buildCheckoutSchema({ isFree, billingType });
  type FormValues = CheckoutFormValues;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "", cpf: "", cep: "", endereco: "", numero: "", complemento: "",
      bairro: "", cidade: "", estado: "", telefone: "",
      cardName: "", cardNumber: "", cardExpiry: "", cardCvv: "",
    },
  });

  const handleCepBlur = async (cep: string) => {
    const rawCep = cep.replace(/\D/g, "");
    if (rawCep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        form.setValue("endereco", data.logradouro);
        form.setValue("bairro", data.bairro);
        form.setValue("cidade", data.localidade);
        form.setValue("estado", data.uf);
      }
    } catch {
      toast.error("Erro ao buscar CEP");
    }
  };

  const pollStatus = async (subscriptionId: string) => {
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      setStatusMsg(`Confirmando pagamento... (${i + 1}/${maxAttempts})`);
      const { data, error } = await supabase.functions.invoke("check-payment-status", {
        body: { subscriptionId },
      });
      if (!error && data?.status === "APPROVED") return "APPROVED";
      if (!error && data?.status === "REJECTED") return "REJECTED";
      await sleep(2000);
    }
    return "PENDING";
  };

  const checkPaymentStatus = async (subId: string) => {
    setConferindo(true);
    setStatusMsg("Verificando pagamento...");
    const { data, error } = await supabase.functions.invoke("check-payment-status", {
      body: { subscriptionId: subId },
    });
    setConferindo(false);
    setStatusMsg("");

    if (error || data?.error) {
      toast.error("Erro ao verificar pagamento");
      return null;
    }
    return data?.status as string | null;
  };

  const handleConferirPagamento = async () => {
    if (!subscriptionId) return;
    const status = await checkPaymentStatus(subscriptionId);

    if (status === "APPROVED") {
      setPaymentApproved(true);
      toast.success("Pagamento confirmado!");
    } else if (status === "REJECTED") {
      toast.error("Pagamento rejeitado. Tente novamente.");
    } else {
      toast.message("Pagamento ainda não confirmado. Tente novamente em alguns instantes.");
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) { toast.error("Digite um código de cupom"); return; }

    setCouponLoading(true);
    try {
      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (error) throw new Error("Erro ao consultar cupom");
      if (!coupon) throw new Error("Cupom invalido");
      if (!coupon.active) throw new Error("Cupom inativo");
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) throw new Error("Cupom expirado");
      if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) throw new Error("Cupom esgotado");
      if (coupon.min_amount !== null && amount < coupon.min_amount) throw new Error("Valor minimo nao atingido para este cupom");

      let discountAmount = 0;
      if (coupon.discount_type === "percentual") {
        discountAmount = Math.round(amount * (coupon.discount_value / 100) * 100) / 100;
      } else {
        discountAmount = Math.min(coupon.discount_value, amount);
      }
      const finalAmount = Math.max(0, amount - discountAmount);

      setCouponApplied({ discount_amount: discountAmount, final_amount: finalAmount });
      setCouponCode(code);
      toast.success(`Cupom aplicado! Desconto de R$ ${discountAmount.toFixed(2)}`);
    } catch (err: any) {
      setCouponApplied(null);
      toast.error(err?.message || "Erro ao validar cupom");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponApplied(null);
  };

  const finalize = async () => {
    await sleep(1000);
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ["profile"] }),
      queryClient.refetchQueries({ queryKey: ["company"] }),
      queryClient.refetchQueries({ queryKey: ["accessControl"] }),
    ]);
    navigate(planType === "gestao" ? "/dashboard" : "/marketplace/home");
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setStatusMsg("Processando...");
    try {
      const body: Record<string, unknown> = { ...values, plan: planName, planType, amount, billingType };
      if (couponApplied) body.coupon_code = couponCode;
      const { data, error } = await supabase.functions.invoke("process-payment", { body });

      if (error) {
        let errorMessage = "Erro ao processar pagamento no servidor";
        try {
          if ((error as any).context) {
            const errorData = await (error as any).context.json();
            errorMessage = errorData?.error || error.message || errorMessage;
          } else {
            errorMessage = error.message || errorMessage;
          }
        } catch {
          errorMessage = error.message || errorMessage;
        }

        throw new Error(errorMessage);
      }
      if ((data as any)?.error) {

        throw new Error((data as any).error);
      }

      if ((data as any)?.free) {
        toast.success("Plano gratuito ativado!");
        await finalize();
        return;
      }

      const resp = data as any;

      switch (resp.billingType) {
        case "BOLETO":
          setPaymentInfo(resp.paymentInfo);
          setSubscriptionId(resp.subscriptionId);
          setPaymentDone(true);
          setIsLoading(false);
          setStatusMsg("");
          toast.message("Boleto gerado com sucesso!");
          break;

        case "PIX":
          setPaymentInfo(resp.paymentInfo);
          setSubscriptionId(resp.subscriptionId);
          setPaymentDone(true);
          setIsLoading(false);
          setStatusMsg("");
          toast.message("QR Code PIX gerado com sucesso!");
          break;

        default:
          const finalStatus = await pollStatus(resp.subscriptionId);
          if (finalStatus === "REJECTED") throw new Error("Pagamento rejeitado pela operadora");
          if (finalStatus === "PENDING") {
            toast.message("Pagamento em análise. Você será notificado ao confirmar.");
          } else {
            toast.success("Pagamento aprovado!");
          }
          await finalize();
          break;
      }
    } catch (err: any) {
      toast.error(err?.message || "Erro no processamento");
    } finally {
      if (!paymentDone) {
        setIsLoading(false);
        setStatusMsg("");
      }
    }
  };

  if (paymentDone) {
    return (
      <div className="space-y-6">
        {billingType === "BOLETO" && paymentInfo && (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100">
              <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="6" y1="8" x2="6" y2="16" />
                <line x1="9" y1="8" x2="9" y2="16" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="15" y1="8" x2="15" y2="16" />
                <line x1="18" y1="8" x2="18" y2="16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black">Boleto Gerado!</h3>
            <p className="text-sm text-gray-600">
              Utilize o link abaixo para baixar e pagar o boleto.
            </p>
            {paymentInfo.invoiceUrl && (
              <a
                href={paymentInfo.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Visualizar Boleto
              </a>
            )}
            {paymentInfo.boletoBarCode && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Código de Barras</p>
                <p className="text-sm font-mono text-black break-all select-all">
                  {paymentInfo.boletoBarCode}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Pagamento confirmado em até <strong>3 dias úteis</strong>.
              Seu plano será ativado automaticamente.
            </p>
            {paymentApproved ? (
              <Button onClick={finalize} className="w-full">
                Ir para o {planType === "gestao" ? "Dashboard" : "Marketplace"}
              </Button>
            ) : (
              <Button onClick={handleConferirPagamento} className="w-full" disabled={conferindo}>
                {conferindo ? "Verificando..." : "Conferir Pagamento"}
              </Button>
            )}
          </div>
        )}

        {billingType === "PIX" && paymentInfo && (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black">PIX Gerado!</h3>
            <p className="text-sm text-gray-600">
              Escaneie o QR Code abaixo ou copie o código PIX para pagar.
            </p>
            {paymentInfo.pixQrCode && (
              <div className="flex justify-center">
                <img
                  src={`data:image/png;base64,${paymentInfo.pixQrCode}`}
                  alt="QR Code PIX"
                  className="w-48 h-48"
                />
              </div>
            )}
            {paymentInfo.pixCopiaECola && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Código Copia e Cola</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={paymentInfo.pixCopiaECola}
                    className="flex-1 text-xs font-mono bg-white p-2 rounded border text-black"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(paymentInfo.pixCopiaECola ?? "");
                      toast.success("Código copiado!");
                    }}
                    className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700"
                  >
                    Copiar
                  </button>
                </div>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Após o pagamento, seu plano será ativado em instantes.
            </p>
            {paymentApproved ? (
              <Button onClick={finalize} className="w-full">
                Ir para o {planType === "gestao" ? "Dashboard" : "Marketplace"}
              </Button>
            ) : (
              <Button onClick={handleConferirPagamento} className="w-full" disabled={conferindo}>
                {conferindo ? "Verificando..." : "Conferir Pagamento"}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="new-password">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name="nome" control={form.control} render={({ field }) => (
            <FormItem><FormLabel className="text-black">Nome Completo</FormLabel><FormControl><Input {...field} className="bg-white text-black" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="cpf" control={form.control} render={({ field }) => (
            <FormItem><FormLabel className="text-black">CPF</FormLabel><FormControl><Input {...field} onChange={(e) => field.onChange(maskCPF(e.target.value))} className="bg-white text-black" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="cep" control={form.control} render={({ field }) => (
            <FormItem><FormLabel className="text-black">CEP</FormLabel><FormControl><Input {...field} onChange={(e) => { field.onChange(maskCEP(e.target.value)); if (e.target.value.length === 9) handleCepBlur(e.target.value); }} className="bg-white text-black" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="endereco" control={form.control} render={({ field }) => (
            <FormItem><FormLabel className="text-black">Endereço</FormLabel><FormControl><Input {...field} className="bg-white text-black" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="numero" control={form.control} render={({ field }) => (
            <FormItem><FormLabel className="text-black">Número</FormLabel><FormControl><Input {...field} className="bg-white text-black" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="complemento" control={form.control} render={({ field }) => (
            <FormItem><FormLabel className="text-black">Complemento</FormLabel><FormControl><Input {...field} className="bg-white text-black" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="telefone" control={form.control} render={({ field }) => (
            <FormItem><FormLabel className="text-black">Telefone (com DDD)</FormLabel><FormControl><Input {...field} onChange={(e) => field.onChange(maskPhone(e.target.value))} className="bg-white text-black" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="bairro" control={form.control} render={({ field }) => (
            <FormItem><FormLabel className="text-black">Bairro</FormLabel><FormControl><Input {...field} className="bg-white text-black" /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-2 gap-4">
            <FormField name="cidade" control={form.control} render={({ field }) => (
              <FormItem><FormLabel className="text-black">Cidade</FormLabel><FormControl><Input {...field} className="bg-white text-black" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="estado" control={form.control} render={({ field }) => (
              <FormItem><FormLabel className="text-black">UF</FormLabel><FormControl><Input {...field} maxLength={2} className="bg-white text-black" /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </div>

        {!isFree && (
          <div className="border-t pt-4 mt-4">
            <div className="mb-4">
              <h3 className="font-bold mb-2 text-black">Cupom de Desconto</h3>
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Digite o cupom"
                  className="bg-white text-black flex-1"
                  disabled={!!couponApplied}
                />
                {couponApplied ? (
                  <Button type="button" variant="outline" onClick={handleRemoveCoupon} className="shrink-0">
                    Remover
                  </Button>
                ) : (
                  <Button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} className="shrink-0">
                    {couponLoading ? "..." : "Aplicar"}
                  </Button>
                )}
              </div>
              {couponApplied && (
                <p className="text-sm text-green-600 mt-1">
                  Cupom aplicado: R$ {couponApplied.discount_amount.toFixed(2)} de desconto
                </p>
              )}
            </div>

            <h3 className="font-bold mb-4 text-black">Forma de Pagamento</h3>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setBillingType("CREDIT_CARD")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  billingType === "CREDIT_CARD"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <svg className="w-8 h-8 text-[#009ee3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <span className="text-sm font-medium">Cartão</span>
                <span className="text-xs text-gray-500">Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => setBillingType("BOLETO")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  billingType === "BOLETO"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <svg className="w-8 h-8 text-[#009ee3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <line x1="6" y1="8" x2="6" y2="16" />
                  <line x1="9" y1="8" x2="9" y2="16" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="15" y1="8" x2="15" y2="16" />
                  <line x1="18" y1="8" x2="18" y2="16" />
                </svg>
                <span className="text-sm font-medium">Boleto</span>
                <span className="text-xs text-gray-500">Boleto</span>
              </button>

              <button
                type="button"
                onClick={() => setBillingType("PIX")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  billingType === "PIX"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <svg className="w-8 h-8 text-[#009ee3]" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.917 11.71a2.046 2.046 0 0 1-1.454-.602l-2.1-2.1a.4.4 0 0 0-.551 0l-2.108 2.108a2.044 2.044 0 0 1-1.454.602h-.414l2.66 2.66c.83.83 2.177.83 3.007 0l2.667-2.668h-.253zM4.25 4.282c.55 0 1.066.214 1.454.602l2.108 2.108a.39.39 0 0 0 .552 0l2.1-2.1a2.044 2.044 0 0 1 1.453-.602h.253L9.503 1.623a2.127 2.127 0 0 0-3.007 0l-2.66 2.66h.414z"/>
                  <path d="m14.377 6.496-1.612-1.612a.307.307 0 0 1-.114.023h-.733c-.379 0-.75.154-1.017.422l-2.1 2.1a1.005 1.005 0 0 1-1.425 0L5.268 5.32a1.448 1.448 0 0 0-1.018-.422h-.9a.306.306 0 0 1-.109-.021L1.623 6.496c-.83.83-.83 2.177 0 3.008l1.618 1.618a.305.305 0 0 1 .108-.022h.901c.38 0 .75-.153 1.018-.421L7.375 8.57a1.034 1.034 0 0 1 1.426 0l2.1 2.1c.267.268.638.421 1.017.421h.733c.04 0 .079.01.114.024l1.612-1.612c.83-.83.83-2.178 0-3.008z"/>
                </svg>
                <span className="text-sm font-medium">PIX</span>
                <span className="text-xs text-gray-500">Pix</span>
              </button>
            </div>

            {/* Campos de cartão sempre no DOM, escondidos por CSS quando não for CREDIT_CARD */}
            <div className={billingType !== "CREDIT_CARD" ? "hidden" : ""}>
              <h4 className="font-bold mb-4 text-black">Dados do Cartão</h4>
              <FormField name="cardName" control={form.control} render={({ field }) => (
                <FormItem><FormLabel className="text-black">Nome no Cartão</FormLabel><FormControl><Input {...field} value={field.value as string} autoComplete="off" className="bg-white text-black" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="cardNumber" control={form.control} render={({ field }) => (
                <FormItem><FormLabel className="text-black">Número do Cartão</FormLabel><FormControl><Input {...field} value={field.value as string} maxLength={19} autoComplete="off" onChange={(e) => field.onChange(maskCardNumber(e.target.value))} className="bg-white text-black" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField name="cardExpiry" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel className="text-black">Validade (MM/AA)</FormLabel><FormControl><Input {...field} value={field.value as string} autoComplete="off" onChange={(e) => field.onChange(maskExpiry(e.target.value))} className="bg-white text-black" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="cardCvv" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel className="text-black">CVV</FormLabel><FormControl><Input {...field} value={field.value as string} maxLength={4} autoComplete="off" className="bg-white text-black" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>

            {billingType === "BOLETO" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Você receberá um boleto bancário</strong> para pagamento.
                  O plano será ativado automaticamente após a confirmação do pagamento
                  (em até 3 dias úteis).
                </p>
              </div>
            )}

            {billingType === "PIX" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Pagamento via PIX</strong> â€” após finalizar, você verá o
                  QR Code para pagamento. O plano será ativado em instantes.
                </p>
              </div>
            )}
          </div>
        )}

        {statusMsg && <p className="text-sm text-muted-foreground text-center">{statusMsg}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? "Processando..."
            : isFree
              ? "Ativar plano gratuito"
              : billingType === "BOLETO"
                ? `Gerar Boleto${couponApplied ? ` (R$ ${displayedAmount.toFixed(2)})` : ` (R$ ${amount.toFixed(2)})`}`
                : billingType === "PIX"
                  ? `Gerar PIX${couponApplied ? ` (R$ ${displayedAmount.toFixed(2)})` : ` (R$ ${amount.toFixed(2)})`}`
                  : `Finalizar Pagamento${couponApplied ? ` (R$ ${displayedAmount.toFixed(2)})` : ` (R$ ${amount.toFixed(2)})`}`}
        </Button>
      </form>
    </Form>
  );
};
