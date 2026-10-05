import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toServiceError } from "@/integrations/supabase/services/errors";

export type Payment = Tables<"carcontrol_payments">;
export type PaymentInsert = TablesInsert<"carcontrol_payments">;
export type PaymentUpdate = TablesUpdate<"carcontrol_payments">;
export type PaymentSchedule = Tables<"carcontrol_payment_schedules">;

export type EnrichedPayment = Payment & {
  descricao: string;
  data_vencimento: string;
  tipo?: "receita" | "despesa";
};

type ScheduleLite = Pick<
  PaymentSchedule,
  "id" | "descricao" | "data_inicio" | "data_fim" | "valor" | "user_id"
>;

function findScheduleForPayment(payment: Payment, schedules: ScheduleLite[]) {
  if (!payment.schedule_date) return undefined;

  return schedules.find((schedule) => {
    const scheduleDate = new Date(payment.schedule_date!);
    const dataInicio = new Date(schedule.data_inicio);
    const dataFim = schedule.data_fim ? new Date(schedule.data_fim) : null;
    const isDateInRange =
      scheduleDate >= dataInicio && (!dataFim || scheduleDate <= dataFim);
    const isValueMatch = Math.abs(Number(schedule.valor) - Number(payment.valor)) < 0.01;
    const isUserMatch = schedule.user_id === payment.user_id;
    return isDateInRange && isValueMatch && isUserMatch;
  });
}

/** Payment domain access — RLS scopes rows to the caller's tenant. */
export const paymentService = {
  async list() {
    const { data, error } = await supabase
      .from("carcontrol_payments")
      .select("*")
      .order("data", { ascending: false });

    if (error) throw toServiceError(error, "Não foi possível carregar pagamentos.");
    return (data ?? []) as Payment[];
  },

  async listEnriched(): Promise<EnrichedPayment[]> {
    const [payments, schedulesResult] = await Promise.all([
      this.list(),
      supabase
        .from("carcontrol_payment_schedules")
        .select("id, descricao, data_inicio, data_fim, valor, user_id")
        .eq("ativo", true),
    ]);

    const schedules = (schedulesResult.data ?? []) as ScheduleLite[];

    const enriched = payments.map((payment) => {
      const schedule = findScheduleForPayment(payment, schedules);
      return {
        ...payment,
        descricao: schedule?.descricao || "Pagamento Manual",
        data_vencimento: payment.schedule_date || payment.data,
        tipo: "receita" as const,
      };
    });

    enriched.sort(
      (a, b) =>
        new Date(b.data_vencimento).getTime() - new Date(a.data_vencimento).getTime(),
    );
    return enriched;
  },

  async create(input: PaymentInsert) {
    const { data, error } = await supabase
      .from("carcontrol_payments")
      .insert(input)
      .select()
      .single();

    if (error) throw toServiceError(error, "Não foi possível criar o pagamento.");
    return data as Payment;
  },

  async update(id: string, input: PaymentUpdate) {
    const { data, error } = await supabase
      .from("carcontrol_payments")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw toServiceError(error, "Não foi possível atualizar o pagamento.");
    return data as Payment;
  },

  async remove(id: string) {
    const { error } = await supabase.from("carcontrol_payments").delete().eq("id", id);
    if (error) throw toServiceError(error, "Não foi possível excluir o pagamento.");
  },
};
