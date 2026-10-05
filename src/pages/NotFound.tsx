import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {

  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {/* === MOBILE LAYOUT (unchanged) === */}
      <div className="md:hidden text-center space-y-6 mb-8">
        <h2 className="text-3xl font-bold text-foreground">Página não encontrada</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Desculpe, a página que você está procurando não existe ou foi removida.
          Se o problema persistir, entre em contato com o suporte.
        </p>
      </div>

      <div className="md:hidden w-48 h-48 mb-12 flex items-center justify-center">
        <img
          src="/assets/animacacao404.gif"
          alt="Personagem perdido"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="md:hidden w-full max-w-xs space-y-3">
        <Button
          onClick={() => navigate("/")}
          className="w-full h-12 text-base"
        >
          â† Voltar para o início
        </Button>
      </div>

      <div className="md:hidden text-9xl font-bold text-primary/20 mt-12">404</div>

      {/* === DESKTOP LAYOUT (md+) === */}
      <div className="hidden md:flex flex-col items-center w-full max-w-5xl">
        <div className="flex items-center gap-16 xl:gap-24 w-full">
          <div className="flex-1 space-y-8">
            <div className="text-8xl xl:text-9xl font-bold text-primary/10 leading-none">404</div>
            <h2 className="text-4xl xl:text-6xl font-bold text-foreground leading-tight">
              Página não encontrada
            </h2>
            <p className="text-base xl:text-lg text-muted-foreground max-w-lg leading-relaxed">
              Desculpe, a página que você está procurando não existe ou foi removida.
              Se o problema persistir, entre em contato com o suporte.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="h-14 text-lg px-10"
            >
              â† Voltar para o início
            </Button>
          </div>
          <div className="w-72 xl:w-96 h-72 xl:h-96 flex items-center justify-center shrink-0">
            <img
              src="/assets/animacacao404.gif"
              alt="Personagem perdido"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
