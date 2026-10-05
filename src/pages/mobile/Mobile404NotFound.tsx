import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Mobile404NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {/* 404 Text */}
      <div className="text-center space-y-6 mb-8">
        <h2 className="text-3xl font-bold text-foreground">Página não encontrada</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Desculpe, a página que você está procurando não existe ou foi removida.
          Se o problema persistir, entre em contato com o suporte.
        </p>
      </div>

      {/* Illustration - Lost Character Animation */}
      <div className="w-48 h-48 mb-12 flex items-center justify-center">
        <img 
          src="/assets/animacacao404.gif" 
          alt="Personagem perdido" 
          className="w-full h-full object-contain"
        />
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-xs space-y-3">
        <Button
          onClick={() => navigate("/mobile/home")}
          className="w-full h-12 text-base"
        >
          ← Voltar 
        </Button>
      </div>
      
        <div className="text-9xl font-bold text-primary/20">404</div>

    </div>
  );
};

export default Mobile404NotFound;
