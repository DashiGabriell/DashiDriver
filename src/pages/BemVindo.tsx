import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCarcontrolUser } from "@/hooks/useCarcontrolUser";

const BemVindo = () => {
  const navigate = useNavigate();
  const { company, userRole, loading } = useCarcontrolUser();

  useEffect(() => {
    if (!loading) {
      // Se não tiver empresa, vai para o funil de cadastro
      if (!company) {
        navigate("/mobile/onboarding-cadastro", { replace: true });
      } else if (userRole === 'admin') {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/mobile/home", { replace: true });
      }
    }
  }, [company, userRole, loading, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-2xl font-bold mb-4">Bem-vindo!</h1>
      <img src="/assets/loading-carcontrol-coelho.gif" alt="Carregando..." className="w-32 h-32" />
    </div>
  );
};

export default BemVindo;
