import { motion } from "framer-motion";
import { User, Star, Car, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { memo } from "react";

interface DriverCardProps {
  nome: string;
  score: number;
  veiculo?: string;
  pagamentosStatus: "em_dia" | "atrasado" | "pendente";
  status: "ativo" | "inativo" | "bloqueado";
  fotoUrl?: string;
  onClick: () => void;
}

export const DriverCard = memo(({
  nome,
  score,
  veiculo,
  pagamentosStatus,
  status,
  fotoUrl,
  onClick,
}: DriverCardProps) => {
  const statusColors = {
    ativo: "text-success bg-success/10",
    inativo: "text-muted-foreground bg-muted",
    bloqueado: "text-danger bg-danger/10",
  };

  const paymentColors = {
    em_dia: "text-success",
    atrasado: "text-danger",
    pendente: "text-orange-500",
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="neu p-5 rounded-[32px] mb-4 group active:shadow-neu-inset transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Foto do Motorista */}
        <div className="w-16 h-16 rounded-full overflow-hidden shadow-neu-sm shrink-0 border-2 border-background bg-muted">
          {fotoUrl ? (
            <img 
              src={fotoUrl} 
              alt={nome} 
              className="w-full h-full object-cover" 
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-8 h-8 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Detalhes */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-lg truncate leading-tight">{nome}</h4>
            <span className={cn("chip text-[9px] py-1 capitalize", statusColors[status])}>
              {status}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-orange-500 font-bold">
              <Star className="w-3 h-3 fill-current" />
              <span>{score.toFixed(1)}</span>
            </div>
            {veiculo && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Car className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{veiculo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status de Pagamento */}
        <div className={cn("shrink-0 p-3 rounded-2xl bg-background shadow-neu-sm", paymentColors[pagamentosStatus])}>
          <DollarSign className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
});

DriverCard.displayName = "DriverCard";

export default DriverCard;
