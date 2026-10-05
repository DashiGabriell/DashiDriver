import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const PagamentoPendente = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-sm w-full space-y-6">
        <img 
          src="/assets/creditcard.png" 
          alt="Pagamento Pendente" 
          className="w-24 h-24 mx-auto object-contain opacity-60" 
        />
        
        <h1 className="text-3xl font-black font-display tracking-tighter">
          Pagamento não aprovado
        </h1>
        
        <p className="text-muted-foreground">
          O pagamento do seu plano não foi aprovado ou sua assinatura foi cancelada. 
          Entre em contato com o suporte ou escolha um novo plano para continuar usando a DashiDrive.
        </p>

        <div className="space-y-3">
          <Button 
            onClick={() => navigate("/planos")} 
            className="w-full h-14 rounded-2xl text-lg font-bold"
          >
            Ver Planos e Assinar
          </Button>
          
          <Button 
            onClick={() => navigate("/ajuda")} 
            variant="outline"
            className="w-full h-14 rounded-2xl text-lg font-medium"
          >
            Falar com Suporte
          </Button>
          
          <Button 
            onClick={handleLogout} 
            variant="ghost"
            className="w-full h-14 rounded-2xl text-lg font-medium text-muted-foreground"
          >
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PagamentoPendente;
