import { useEffect, useRef } from "react";
import { animate } from "framer-motion";

/**
 * Hook para animar contagem de números
 * @param value - Valor final do número
 * @param duration - Duração da animação em segundos (padrão: 2)
 * @param delay - Delay antes de iniciar a animação em segundos (padrão: 0)
 * @returns ref para o elemento que exibirá o número animado
 */
export function useCountAnimation(
  value: number,
  duration: number = 2,
  delay: number = 0,
  formatCurrency = false
) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    // Inicia a animação após o delay
    const timer = setTimeout(() => {
      const controls = animate(0, value, {
        duration,
        ease: "easeOut",
        onUpdate(latest) {
          const formatted = formatCurrency
            ? latest.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : Number.isInteger(value)
            ? Math.round(latest).toLocaleString("pt-BR")
            : latest.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
          node.textContent = formatted;
        },
      });

      return () => controls.stop();
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, duration, delay, formatCurrency]);

  return nodeRef;
}
