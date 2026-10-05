import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/layouts/mobile/MobileHeader";
import KpiCard from "@/components/mobile/home/KpiCard";
import QuickActions from "@/components/mobile/home/QuickActions";
import { fmtBRL } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { eachDayOfInterval, endOfMonth, format, getDate, getDay, parseISO, startOfMonth } from "date-fns";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { Database } from "@/integrations/supabase/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

type PaymentSchedule = Database["public"]["Tables"]["carcontrol_payment_schedules"]["Row"];
type ConfirmedPayment = Database["public"]["Tables"]["carcontrol_payments"]["Row"];

/**
 * Fetch KPI data from the Supabase RPC function `get_mobile_home_stats`.
 * The function returns a JSON object with the following shape:
 * {
 *   recebimento_previsto: number,
 *   valores_recebidos: number,
 *   a_receber: number,
 *   valores_atrasados: number,
 *   periodo: { data_inicio: string, data_fim: string },
 *   timestamp: string
 * }
 */
const useMobileHomeStats = (dateRange: DateRange | undefined) => {
  return useQuery({
    queryKey: ["mobile-home-stats", dateRange?.from, dateRange?.to],
    queryFn: async () => {
      // Definir período padrão (mês atual)
      const from = dateRange?.from || startOfMonth(new Date());
      const to = dateRange?.to || endOfMonth(new Date());

      const dateFrom = format(from, "yyyy-MM-dd");
      const dateTo = format(to, "yyyy-MM-dd");

      const { data, error } = await supabase.rpc("get_mobile_home_stats", {
        p_date_from: dateFrom,
        p_date_to: dateTo,
      });
      if (error) throw error;
      return data as {
        recebimento_previsto: number;
        valores_recebidos: number;
        a_receber: number;
        valores_atrasados: number;
        periodo: { data_inicio: string; data_fim: string };
      };
    },
    // Cache por 2 minutos
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: true,
  });
};

const MobileHome = () => {
  const navigate = useNavigate();
  
  // Período padrão: mês atual
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return {
      from: startOfMonth(today),
      to: endOfMonth(today),
    };
  });

  const { data, isLoading } = useMobileHomeStats(dateRange);
  const { data: paymentSchedules, loading: loadingPaymentSchedules } = useRealtimeData(
    "carcontrol_payment_schedules",
    {
      select: "id, driver_id, vehicle_id, valor, data_inicio, data_fim, tipo_recorrencia, dia_mes, dia_semana, ativo",
      order: { column: "created_at", ascending: false },
    }
  );
  const { data: confirmedPayments, loading: loadingConfirmedPayments } = useRealtimeData(
    "carcontrol_payments",
    {
      select: "id, schedule_date, driver_id, vehicle_id, valor, status",
      filter: (q) => q.eq("status", "pago").not("schedule_date", "is", null),
    }
  );

  const recebimentoPrevisto = data?.recebimento_previsto ?? 0;
  const valoresRecebidos = data?.valores_recebidos ?? 0;
  const aReceber = data?.a_receber ?? 0;
  const confirmedExactKeys = useMemo(() => {
    const set = new Set<string>();

    for (const payment of confirmedPayments as ConfirmedPayment[]) {
      if (!payment.driver_id || !payment.schedule_date) continue;

      set.add(
        `${payment.schedule_date}|${payment.driver_id}|${payment.vehicle_id ?? ""}|${Number(payment.valor)}`
      );
    }

    return set;
  }, [confirmedPayments]);

  const valoresAtrasados = useMemo(() => {
    const today = new Date();
    let total = 0;

    for (const schedule of paymentSchedules as PaymentSchedule[]) {
      if (!schedule.ativo) continue;

      const scheduleStart = parseISO(schedule.data_inicio);
      const scheduleEnd = schedule.data_fim ? parseISO(schedule.data_fim) : today;
      const effectiveEnd = scheduleEnd < today ? scheduleEnd : today;

      if (scheduleStart > effectiveEnd) continue;

      const allDates = eachDayOfInterval({ start: scheduleStart, end: effectiveEnd });

      for (const date of allDates) {
        const isWeeklyMatch =
          schedule.tipo_recorrencia === "semanal" &&
          schedule.dia_semana !== null &&
          getDay(date) === schedule.dia_semana;
        const isMonthlyMatch =
          schedule.tipo_recorrencia === "mensal" &&
          schedule.dia_mes !== null &&
          getDate(date) === schedule.dia_mes;

        if (!isWeeklyMatch && !isMonthlyMatch) continue;

        const dateStr = format(date, "yyyy-MM-dd");
        const key = `${dateStr}|${schedule.driver_id ?? ""}|${schedule.vehicle_id ?? ""}|${Number(schedule.valor)}`;

        if (!confirmedExactKeys.has(key)) {
          total += Number(schedule.valor) || 0;
        }
      }
    }

    return total;
  }, [paymentSchedules, confirmedExactKeys]);
  const loadingValoresAtrasados = isLoading || loadingPaymentSchedules || loadingConfirmedPayments;

  // Função para resetar ao mês atual
  const handleResetMonth = () => {
    const today = new Date();
    setDateRange({
      from: startOfMonth(today),
      to: endOfMonth(today),
    });
  };

  // Calcular número de dias do período
  const daysInPeriod = dateRange?.from && dateRange?.to
    ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  return (
    <div className="animate-fade-in pb-10">
      <MobileHeader />
      
      <div className="py-6 space-y-8">
        {/* Seletor de Período */}
        <section className="px-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Período</h3>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleResetMonth}
              className="text-xs"
            >
              Mês Atual
            </Button>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                      <span className="ml-auto text-xs text-muted-foreground">
                        ({daysInPeriod} dias)
                      </span>
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy")
                  )
                ) : (
                  "Selecione um período"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        </section>

        {/* KPI Section */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">Visão Geral</h3>
          <div className="grid grid-cols-2 gap-4">
            <KpiCard 
              label="Recebimento Previsto" 
              value={fmtBRL(recebimentoPrevisto)} 
              icon={<img src="/assets/receitames.png" alt="Recebimento Previsto" className="w-5 h-5" />}
              color="accent" 
              delay={1}
              loading={isLoading}
            />
            <KpiCard 
              label="Valores Recebidos" 
              value={fmtBRL(valoresRecebidos)} 
              icon={<img src="/assets/rs.png" alt="Valores Recebidos" className="w-5 h-5" />}
              color="success" 
              delay={2}
              loading={isLoading}
            />
            <KpiCard 
              label="A Receber" 
              value={fmtBRL(aReceber)} 
              icon={<img src="/assets/pag-pendente.png" alt="A Receber" className="w-5 h-5" />}
              color="warning" 
              delay={3}
              loading={isLoading}
            />
            <KpiCard 
              label="Valores Atrasados" 
              value={fmtBRL(valoresAtrasados)} 
              icon={<img src="/assets/atrasado.png" alt="Valores Atrasados" className="w-5 h-5" />}
              color="danger" 
              delay={4}
              loading={loadingValoresAtrasados}
            />
          </div>
        </section>

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Activity Placeholder */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">Atividades Recentes</h3>
          <div className="neu p-10 text-center rounded-[32px]">
            <p className="text-sm text-muted-foreground italic">Nenhuma atividade registrada hoje.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MobileHome;
