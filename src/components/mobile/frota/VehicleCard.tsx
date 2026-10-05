import { motion } from "framer-motion";
import { Car, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtBRL } from "@/lib/utils";
import React, { memo } from "react";

interface VehicleCardProps {
  modelo: string;
  marca: string;
  placa: string;
  status: "disponivel" | "alugado" | "oficina" | "bloqueado";
  motoristaAtual?: string;
  valorSemanal: number;
  diasSemPagar: number;
  fotoUrl?: string;
  onClick: () => void;
}

export const VehicleCard = memo(({
  modelo,
  marca,
  placa,
  status,
  motoristaAtual,
  valorSemanal,
  diasSemPagar,
  fotoUrl,
  onClick,
}: VehicleCardProps) => {
  const statusColors = {
    disponivel: "text-success bg-success/10",
    alugado: "text-blue-500 bg-blue-500/10",
    oficina: "text-orange-500 bg-orange-500/10",
    bloqueado: "text-danger bg-danger/10",
  };

  const statusLabels = {
    disponivel: "Disponível",
    alugado: "Alugado",
    oficina: "Na oficina",
    bloqueado: "Bloqueado",
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="neu p-5 rounded-[32px] mb-4 group active:shadow-neu-inset transition-all"
    >
      <div className="flex gap-4">
        {/* Imagem do Veículo */}
        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-neu-sm shrink-0 border-2 border-background bg-muted">
          {fotoUrl ? (
            <img 
              src={fotoUrl} 
              alt={modelo} 
              className="w-full h-full object-cover" 
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Car className="w-8 h-8 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Detalhes do Veículo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{marca}</p>
              <h4 className="font-bold text-lg truncate leading-tight">{modelo}</h4>
            </div>
            <span className={cn("chip text-[9px] py-1", statusColors[status])}>
              {statusLabels[status]}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
              {placa}
            </span>
            {motoristaAtual && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span className="truncate max-w-[80px]">{motoristaAtual}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div>
              <p className="text-[9px] uppercase text-muted-foreground font-bold">Semanal</p>
              <p className="font-bold text-sm text-primary">{fmtBRL(valorSemanal)}</p>
            </div>
            {diasSemPagar > 0 && (
              <div className="flex flex-col items-end">
                <p className="text-[9px] uppercase text-danger font-bold">Atraso</p>
                <div className="flex items-center gap-1 text-danger">
                  <AlertCircle className="w-3 h-3" />
                  <span className="font-bold text-sm">{diasSemPagar}d</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

VehicleCard.displayName = "VehicleCard";

export default VehicleCard;
