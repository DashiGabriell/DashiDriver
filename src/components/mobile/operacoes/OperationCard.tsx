import React, { memo } from "react";
import { cn } from "@/lib/utils";

interface OperationCardProps {
  tipo: string;
  data: string;
  titulo: string;
  subtitulo: string;
  valor: string;
  status: string;
  statusType: "warning" | "success" | "danger" | "info";
}

export const OperationCard = memo(({
  tipo,
  data,
  titulo,
  subtitulo,
  valor,
  status,
  statusType
}: OperationCardProps) => {
  const statusColors = {
    warning: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
    danger: "bg-danger/10 text-danger",
    info: "bg-blue-500/10 text-blue-500",
  };

  return (
    <div className="p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{tipo}</span>
        <span className="text-xs text-muted-foreground">{data}</span>
      </div>
      <div>
        <h4 className="font-bold text-lg leading-tight">{titulo}</h4>
        <p className="text-sm text-muted-foreground">{subtitulo}</p>
      </div>
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/10">
        <span className="text-xl font-bold font-display text-primary">{valor}</span>
        <span className={cn("chip text-[10px]", statusColors[statusType])}>{status}</span>
      </div>
    </div>
  );
});

OperationCard.displayName = "OperationCard";

export default OperationCard;
