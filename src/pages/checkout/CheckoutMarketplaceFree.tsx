import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";
import { CheckCircle2 } from "lucide-react";

const CheckoutMarketplaceFree = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleActivate = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: { plan: "marketplace-free", planType: "marketplace" },
      });

      if (error) throw new Error("Erro ao ativar plano gratuito");
      const serverError = (data as { error?: string } | null)?.error;
      if (serverError) throw new Error(serverError);

      toast.success("Plano gratuito ativado com sucesso!");

      await new Promise((r) => setTimeout(r, 1000));

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["profile"] }),
        queryClient.refetchQueries({ queryKey: ["company"] }),
        queryClient.refetchQueries({ queryKey: ["accessControl"] }),
      ]);

      navigate("/marketplace/home");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao ativar plano gratuito");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CheckoutLayout title="Plano Marketplace Free">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-gray-600">
            Ative seu plano gratuito e comece a anunciar veículos no marketplace DashiDrive.
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>✓ Até 1 anúncio ativo</li>
            <li>✓ Perfil público básico</li>
            <li>✓ Recebimento de propostas</li>
          </ul>
        </div>

        <Button
          onClick={handleActivate}
          className="w-full h-12 text-base font-semibold"
          disabled={isLoading}
        >
          {isLoading ? "Ativando..." : "Ativar Plano Free"}
        </Button>
      </div>
    </CheckoutLayout>
  );
};

export default CheckoutMarketplaceFree;
