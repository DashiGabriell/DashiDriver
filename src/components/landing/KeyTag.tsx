import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export type CarStatus = "alugado" | "disponivel" | "oficina" | "atrasado";

export type Car = {
  plate: string;
  model: string;
  driver: string;
  weekly: number;
  note: Record<CarStatus, string>;
  status: CarStatus;
};

export const STATUS_LABEL: Record<CarStatus, string> = {
  alugado: "Alugado",
  disponivel: "No pátio",
  oficina: "Oficina",
  atrasado: "Atrasado",
};

export const STATUS_CYCLE: CarStatus[] = ["alugado", "atrasado", "oficina", "disponivel"];

export const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const SWING = [0, 7, -5, 3, -1.5, 0.6, 0];

export const useSwing = (delay = 0, trigger?: unknown) => {
  const controls = useAnimationControls();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    controls.start({
      rotate: SWING,
      transition: { duration: 1.6, delay, ease: [0.16, 1, 0.3, 1] },
    });
  }, [controls, delay, reduce, trigger]);

  return controls;
};

export const Plate = ({ plate, size = "sm" }: { plate: string; size?: "sm" | "lg" }) => (
  <div className="qc-plate" aria-label={`Placa ${plate}`}>
    <div className="qc-plate-band" aria-hidden="true" style={size === "lg" ? { fontSize: 9, padding: "2px 8px" } : undefined}>
      <span>BRASIL</span>
      <span>BR</span>
    </div>
    <div
      className="qc-plate-text"
      style={{ fontSize: size === "lg" ? "clamp(2rem, 4vw, 2.8rem)" : "clamp(0.95rem, 1.5vw, 1.2rem)" }}
    >
      {plate}
    </div>
  </div>
);

type KeyTagProps = {
  car: Car;
  index: number;
  onCycle: () => void;
};

export const KeyTag = ({ car, index, onCycle }: KeyTagProps) => {
  const controls = useSwing(0.15 + index * 0.06, car.status);
  const owes = car.status === "atrasado";

  return (
    <div className="qc-hook">
      <motion.div className="qc-swing" animate={controls} whileHover={{ rotate: 2.5 }}>
        <button
          type="button"
          className="qc-tag"
          data-status={car.status}
          onClick={onCycle}
          aria-label={`${car.plate}, ${car.model}: ${STATUS_LABEL[car.status]}. Toque para mudar o status.`}
        >
          <div className="qc-insert">
            <Plate plate={car.plate} />
            <div className="mt-1.5 text-[11px] font-semibold leading-tight truncate">{car.model}</div>
            <div className="text-[11px] leading-tight truncate opacity-80">
              {car.status === "alugado" || owes ? car.driver : car.note[car.status]}
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-1 px-0.5">
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.12em]",
                (car.status === "alugado" || owes) && "max-sm:sr-only",
              )}
              style={{ fontStretch: "115%" }}
            >
              {STATUS_LABEL[car.status]}
            </span>
            {(car.status === "alugado" || owes) && (
              <span className="qc-num ml-auto text-[13px] font-semibold leading-none">{brl(car.weekly)}</span>
            )}
          </div>
        </button>
      </motion.div>
    </div>
  );
};
