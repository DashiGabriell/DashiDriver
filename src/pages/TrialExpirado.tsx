import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const TrialExpirado = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-sm w-full space-y-6">
        <img 
          src="/assets/free-expirado.gif" 
          alt="Trial Expirado" 
          className="w-48 h-48 mx-auto object-contain" 
        />
        
        <h1 className="text-3xl font-black font-display tracking-tighter">
          Ops, seu teste acabou!
        </h1>
        
        <p className="text-muted-foreground">
          O seu período de 7 dias grátis chegou ao fim. 
          Escolha um plano para continuar aproveitando todas as funcionalidades da DashiDrive.
        </p>

        <div className="space-y-3">
          <Button 
            onClick={() => navigate("/planos")} 
            className="w-full h-14 rounded-2xl text-lg font-bold"
          >
            Ver Planos e Assinar
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

export default TrialExpirado;
