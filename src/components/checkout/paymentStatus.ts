import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PaymentStatus = "APPROVED" | "REJECTED" | "PENDING";

/** check-payment-status aceita 10 consultas por minuto por usuário; intervalos abaixo de 6s estouram o limite. */
export const POLL = {
  card: { firstMs: 3000, intervalMs: 8000, maxMs: 90_000 },
  pix: { firstMs: 8000, intervalMs: 8000, maxMs: 15 * 60_000 },
  boleto: { firstMs: 60_000, intervalMs: 60_000, maxMs: 30 * 60_000 },
  pending: { firstMs: 30_000, intervalMs: 30_000, maxMs: 10 * 60_000 },
} as const;

export async function fetchPaymentStatus(subscriptionId: string): Promise<PaymentStatus | "ERROR"> {
  try {
    const { data, error } = await supabase.functions.invoke("check-payment-status", {
      body: { subscriptionId },
    });
    if (error || data?.error) return "ERROR";
    const status = data?.status;
    return status === "APPROVED" || status === "REJECTED" ? status : "PENDING";
  } catch {
    return "ERROR";
  }
}

export async function readFunctionError(error: unknown, fallback: string): Promise<string> {
  const context = (error as { context?: { json?: () => Promise<unknown> } } | null)?.context;
  if (context && typeof context.json === "function") {
    try {
      const body = (await context.json()) as { error?: unknown } | null;
      if (body?.error) return String(body.error);
    } catch {
      /* resposta sem JSON: cai no fallback */
    }
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

type PollingOptions = {
  subscriptionId: string | null;
  enabled: boolean;
  firstMs: number;
  intervalMs: number;
  maxMs: number;
  onSettled: (status: "APPROVED" | "REJECTED") => void;
  onTimeout?: () => void;
};

export function usePaymentPolling({ subscriptionId, enabled, firstMs, intervalMs, maxMs, onSettled, onTimeout }: PollingOptions) {
  const settledRef = useRef(onSettled);
  const timeoutRef = useRef(onTimeout);
  settledRef.current = onSettled;
  timeoutRef.current = onTimeout;

  useEffect(() => {
    if (!enabled || !subscriptionId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const startedAt = Date.now();

    const tick = async () => {
      if (cancelled) return;
      if (Date.now() - startedAt > maxMs) {
        timeoutRef.current?.();
        return;
      }
      if (!document.hidden) {
        const status = await fetchPaymentStatus(subscriptionId);
        if (cancelled) return;
        if (status === "APPROVED" || status === "REJECTED") {
          settledRef.current(status);
          return;
        }
      }
      timer = setTimeout(tick, intervalMs);
    };

    timer = setTimeout(tick, firstMs);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, subscriptionId, firstMs, intervalMs, maxMs]);
}
