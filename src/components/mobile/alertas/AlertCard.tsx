import { motion } from "framer-motion";
import { Wrench, ShieldAlert, FileWarning, DollarSign, MessageCircle, CheckCircle2 } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  tipo: "inadimplencia" | "manutencao" | "seguro" | "documentacao";
  titulo: string;
  mensagem: string;
  severidade: "critica" | "alta" | "media";
  motorista?: string;
  veiculo?: string;
  timestamp?: string;
  onResolve: () => void;
  onAction?: () => void;
  actionLabel?: string;
  resolvedLabel?: string;
}

export const AlertCard = memo(({
  tipo,
  titulo,
  mensagem,
  severidade,
  motorista,
  veiculo,
  timestamp,
  onResolve,
  onAction,
  actionLabel = "Abrir",
  resolvedLabel = "Resolvido",
}: AlertCardProps) => {
  const icons = {
    inadimplencia: DollarSign,
    manutencao: Wrench,
    seguro: ShieldAlert,
    documentacao: FileWarning,
  };

  const colors = {
    critica: "border-danger bg-danger/5",
    alta: "border-orange-500 bg-orange-500/5",
    media: "border-accent bg-accent/5",
  };

  const textColors = {
    critica: "text-danger",
    alta: "text-orange-500",
    media: "text-accent",
  };

  const Icon = icons[tipo];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "neu relative mb-4 overflow-hidden rounded-[32px] border-l-8 p-5 transition-all",
        colors[severidade]
      )}
    >
      <div className="flex gap-4">
        <div className={cn("shrink-0 rounded-2xl bg-background p-3 shadow-neu-sm", textColors[severidade])}>
          <Icon className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className={cn("text-[10px] font-bold uppercase tracking-widest", textColors[severidade])}>
              {severidade}
            </span>
            {timestamp && (
              <span className="shrink-0 text-[10px] font-medium text-muted-foreground">{timestamp}</span>
            )}
          </div>

          <h4 className="mb-1 text-lg font-bold leading-tight">{titulo}</h4>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{mensagem}</p>

          {(motorista || veiculo) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {motorista && <span className="chip bg-background text-[9px]">{motorista}</span>}
              {veiculo && <span className="chip bg-background text-[9px]">{veiculo}</span>}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onResolve}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-background py-3 text-xs font-bold shadow-neu-sm transition-all active:shadow-neu-inset"
            >
              <CheckCircle2 className="h-4 w-4 text-success" />
              {resolvedLabel}
            </button>
            {onAction && (
              <button
                type="button"
                onClick={onAction}
                aria-label={actionLabel}
                className="rounded-xl bg-background p-3 text-success shadow-neu-sm transition-all active:shadow-neu-inset"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

AlertCard.displayName = "AlertCard";

export default AlertCard;
