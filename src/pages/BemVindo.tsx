import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCarcontrolUser } from "@/hooks/useCarcontrolUser";

const BemVindo = () => {
  const navigate = useNavigate();
  const { profile, company, loading } = useCarcontrolUser();
  const plan = (profile as { plan?: string | null } | null)?.plan;

  useEffect(() => {
    if (!loading) {
      if (!company && plan === "motorista") {
        // Motorista não cria empresa; o cadastro dele termina no funil
        navigate("/marketplace/home", { replace: true });
      } else if (!company) {
        navigate("/onboarding-cadastro", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [company, plan, loading, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-2xl font-bold mb-4">Bem-vindo!</h1>
      <img src="/assets/loading-carcontrol-coelho.gif" alt="Carregando..." className="w-32 h-32" />
    </div>
  );
};

export default BemVindo;
