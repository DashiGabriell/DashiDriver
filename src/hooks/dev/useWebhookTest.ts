import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";

export interface EdgeFunction {
  id: string;
  name: string;
  slug: string;
  status: string;
  version: number;
  updated_at: number;
  url: string;
}

export interface TestResult {
  slug: string;
  statusCode: number | null;
  body: string;
  durationMs: number;
  error: string | null;
}

const EDGE_FUNCTIONS: { name: string; slug: string; needsSecret: boolean }[] = [
  { name: "Asaas Webhook", slug: "asaas-webhook", needsSecret: true },
  { name: "Process Payment", slug: "process-payment", needsSecret: false },
  { name: "Check Payment Status", slug: "check-payment-status", needsSecret: false },
  { name: "Check Plan Expiry", slug: "check-plan-expiry", needsSecret: false },
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
if (!SUPABASE_URL) throw new Error("VITE_SUPABASE_URL not defined");

export function useWebhookFunctions() {
  return useQuery<EdgeFunction[]>({
    queryKey: ["dev-webhook-functions"],
    queryFn: async () => {
      return EDGE_FUNCTIONS.map((ef) => ({
        id: ef.slug,
        name: ef.name,
        slug: ef.slug,
        status: "active",
        version: 1,
        updated_at: Date.now(),
        url: `${SUPABASE_URL}/functions/v1/${ef.slug}`,
      }));
    },
    staleTime: 1000 * 60,
  });
}

export function useTestWebhook() {
  return useCallback(async (slug: string): Promise<TestResult> => {
    const start = performance.now();
    const url = `${SUPABASE_URL}/functions/v1/${slug}`;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      if (!anonKey) throw new Error("VITE_SUPABASE_PUBLISHABLE_KEY not defined");

      headers["Authorization"] = `Bearer ${anonKey}`;

      let body: any = { event: "TEST" };

      if (slug === "asaas-webhook") {
        body = {
          event: "PAYMENT_CONFIRMED",
          payment: { subscription: "sub_test", id: "pay_test" },
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const durationMs = Math.round(performance.now() - start);
      const responseBody = await response.text();

      return {
        slug,
        statusCode: response.status,
        body: responseBody || "(vazio)",
        durationMs,
        error: null,
      };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - start);
      return {
        slug,
        statusCode: null,
        body: "",
        durationMs,
        error: err?.message || "Erro de conexão",
      };
    }
  }, []);
}
