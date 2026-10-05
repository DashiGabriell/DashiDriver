import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useCountAnimation } from "@/hooks/useCountAnimation";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  delta?: { value: string; positive?: boolean };
  icon: ReactNode;
  hint?: string;
  delay?: string;
}

export const StatCard = ({ label, value, delta, icon, hint, delay = "" }: StatCardProps) => {
  // Parse correto para formato pt-BR: "R$ 3.400,00" → 3400
  // 1. Remove o símbolo de moeda e espaços
  // 2. Remove os pontos de milhar
  // 3. Substitui a vírgula decimal por ponto
  const cleanedValue = value
    .replace(/[R$\s]/g, "")   // remove "R$" e espaços
    .replace(/\./g, "")        // remove pontos de milhar
    .replace(",", ".");         // vírgula decimal → ponto

  const numericValue = parseFloat(cleanedValue);
  
  // Verifica se é um número válido para animar
  const isNumeric = !isNaN(numericValue);
  
  // Calcula o delay em segundos baseado na classe CSS
  const delaySeconds = delay.includes("delay-75") ? 0.075 :
                       delay.includes("delay-150") ? 0.15 :
                       delay.includes("delay-300") ? 0.3 : 0;
  
  // Verifica se o valor é monetário (contém R$)
  const isCurrency = value.includes("R$");

  // Hook de animação (só usado se for numérico)
  const countRef = useCountAnimation(
    isNumeric ? numericValue : 0,
    2,
    delaySeconds,
    isCurrency
  );
  
  return (
    <div className={`neu p-4 md:p-6 animate-blur-in ${delay} transition-all duration-300 hover:neu-interactive`}>
      <div className="flex items-start justify-between">
        <div className="neu-sm w-9 h-9 md:w-10 md:h-10 grid place-items-center shrink-0">
          {icon}
        </div>
        {delta && (
          <span className={`chip text-[10px] md:text-xs ${delta.positive ? "text-success" : "text-danger"}`}>
            {delta.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {delta.value}
          </span>
        )}
      </div>
      <div className="mt-4 md:mt-5">
        <div className="text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground font-medium line-clamp-1">
          {label}
        </div>
        <div className="font-display text-2xl md:text-3xl font-bold mt-1 md:mt-1.5">
          {isNumeric ? (
            <>
              {isCurrency && "R$ "}
              <span ref={countRef}>0</span>
            </>
          ) : (
            value
          )}
        </div>
        {hint && <div className="text-[10px] md:text-xs text-muted-foreground mt-1.5 md:mt-2 line-clamp-2">{hint}</div>}
      </div>
    </div>
  );
};
