import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";
import { CheckoutSummaryTag } from "@/components/checkout/CheckoutSummary";
import { readFunctionError } from "@/components/checkout/paymentStatus";

const CheckoutMarketplaceFree = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleActivate = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("process-payment", {
        body: { plan: "marketplace-free", planType: "marketplace" },
      });

      if (invokeError) throw new Error(await readFunctionError(invokeError, "Não deu para ativar o plano agora. Tente de novo."));
      const serverError = (data as { error?: string } | null)?.error;
      if (serverError) throw new Error(serverError);

      toast.success("Plano gratuito ativado");
      await new Promise((r) => setTimeout(r, 1000));
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["profile"] }),
        queryClient.refetchQueries({ queryKey: ["company"] }),
        queryClient.refetchQueries({ queryKey: ["accessControl"] }),
      ]);

      navigate("/marketplace/home");
    } catch (err: unknown) {
      const message = err instanceof Error && err.message ? err.message : "Não deu para ativar o plano agora. Tente de novo.";
      setError(message);
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <CheckoutLayout title="Anunciar de graça" subtitle="Ative o Marketplace Free e publique seu primeiro carro. Sem cobrança e sem cartão.">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
        <section className="qc-sheet space-y-5 p-5 sm:p-8" aria-label="Ativar plano gratuito">
          <p className="text-[1.02rem] leading-relaxed">
            O plano gratuito permite 1 anúncio ativo por vez. Precisa de mais? O Pro e o Elite liberam até 10 e 25 anúncios.
          </p>
          {error && (
            <div role="alert" className="rounded-lg border-[1.5px] border-[#e2a196] bg-[#fbe9e6] px-4 py-3 font-semibold text-[#7a1d12]">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" onClick={handleActivate} disabled={isLoading} className="qc-btn qc-btn--primary disabled:opacity-70">
              {isLoading && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
              {isLoading ? "Ativando..." : "Ativar plano gratuito"}
            </button>
            <Link to="/lp-marketplace" className="qc-link sm:ml-3">
              Ver planos pagos do marketplace
            </Link>
          </div>
        </section>
        <CheckoutSummaryTag slug="marketplace-free" amount={0} />
      </div>
    </CheckoutLayout>
  );
};

export default CheckoutMarketplaceFree;
