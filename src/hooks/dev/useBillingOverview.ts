import { useQuery } from "@tanstack/react-query";
import { supabase, SUPABASE_PROJECT } from "@/integrations/supabase/client";

export interface RecentPayment {
  id: string;
  valor: number;
  status: string;
  data: string;
  metodo: string;
}

export interface BillingOverview {
  activeCompanies: number;
  inactiveCompanies: number;
  monthlyRecurringRevenue: number;
  revenueThisMonth: number;
  overdueCount: number;
  overdueAmount: number;
  bySaasPlan: Record<string, number>;
  byMktPlan: Record<string, number>;
  recentPayments: RecentPayment[];
}

const SAAS_PLAN_PRICE: Record<string, number> = {
  BASICO: 99,
  PRO: 199,
  MASTER: 399,
};

const MKT_PLAN_PRICE: Record<string, number> = {
  FREE: 0,
  PRO: 149,
  ELITE: 299,
};

const PLAN_LABEL: Record<string, string> = {
  "gestao-basico": "Gestão Básico",
  "gestao-pro": "Gestão Pro",
  "gestao-master": "Gestão Master",
  "marketplace-free": "Marketplace Free",
  "marketplace-pro": "Marketplace Pro",
  "marketplace-elite": "Marketplace Elite",
  free7dias: "Trial 7 Dias",
};

type CompanyRow = { saas_plan: string; mkt_plan: string; ativo: boolean };
type PaymentRow = {
  id: string;
  plan: string | null;
  amount: number | null;
  status: string | null;
  paid_at: string | null;
  created_at: string | null;
};

function buildOverview(companies: CompanyRow[], payments: PaymentRow[]): BillingOverview {
  const bySaasPlan: Record<string, number> = { BASICO: 0, PRO: 0, MASTER: 0 };
  const byMktPlan: Record<string, number> = { FREE: 0, PRO: 0, ELITE: 0 };

  let monthlyRecurringRevenue = 0;
  let activeCompanies = 0;
  let inactiveCompanies = 0;

  for (const company of companies) {
    if (company.ativo) {
      activeCompanies += 1;
      monthlyRecurringRevenue +=
        (SAAS_PLAN_PRICE[company.saas_plan] ?? 0) +
        (MKT_PLAN_PRICE[company.mkt_plan] ?? 0);
      if (company.saas_plan in bySaasPlan) bySaasPlan[company.saas_plan] += 1;
      if (company.mkt_plan in byMktPlan) byMktPlan[company.mkt_plan] += 1;
    } else {
      inactiveCompanies += 1;
    }
  }

  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  ).toISOString();

  const recentPayments: RecentPayment[] = payments.map((p) => ({
    id: p.id,
    valor: Number(p.amount ?? 0),
    status: p.status ?? "PENDING",
    data: (p.paid_at ?? p.created_at) as string,
    metodo: PLAN_LABEL[p.plan ?? ""] ?? p.plan ?? "—",
  }));

  let revenueThisMonth = 0;
  for (const payment of recentPayments) {
    if (payment.status === "APPROVED" && payment.data >= startOfMonth) {
      revenueThisMonth += payment.valor;
    }
  }

  return {
    activeCompanies,
    inactiveCompanies,
    monthlyRecurringRevenue,
    revenueThisMonth,
    overdueCount: 0,
    overdueAmount: 0,
    bySaasPlan,
    byMktPlan,
    recentPayments,
  };
}

async function fetchViaEdgeFunction(token: string): Promise<BillingOverview> {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-billing-overview`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_PROJECT.anonKey,
      },
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Erro HTTP ${response.status}`);
  }

  return response.json();
}

async function fetchViaClient(): Promise<BillingOverview> {
  const companiesRes = await supabase
    .from("carcontrol_companies")
    .select("id, saas_plan, mkt_plan, ativo");

  if (companiesRes.error) throw new Error(companiesRes.error.message);

  // `payments` (SaaS/Asaas) is outside generated Database types
  const paymentsRes = await (supabase as any)
    .from("payments")
    .select("id, plan, amount, status, paid_at, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (paymentsRes.error) throw new Error(paymentsRes.error.message);

  return buildOverview(
    (companiesRes.data ?? []) as CompanyRow[],
    (paymentsRes.data ?? []) as PaymentRow[],
  );
}

export function useBillingOverview() {
  return useQuery<BillingOverview>({
    queryKey: ["billing-overview"],
    queryFn: async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error("Sessao expirada");

      try {
        return await fetchViaEdgeFunction(token);
      } catch (edgeErr) {
        console.warn("[billing] edge function falhou, tentando client:", edgeErr);
        return fetchViaClient();
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

export async function deletePayment(paymentId: string) {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  if (!token) throw new Error("Sessao expirada");

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-billing-overview`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: SUPABASE_PROJECT.anonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "deletePayment", paymentId }),
      },
    );
    if (response.ok) return;
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Erro HTTP ${response.status}`);
  } catch (edgeErr) {
    const { error } = await (supabase as any).from("payments").delete().eq("id", paymentId);
    if (error) {
      throw edgeErr instanceof Error
        ? edgeErr
        : new Error(error.message || "Erro ao deletar pagamento");
    }
  }
}
