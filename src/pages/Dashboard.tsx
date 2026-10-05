import { useState, useMemo, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/StatCard";
import { VehicleCard } from "@/components/VehicleCard";
import { DateRangePicker } from "@/components/DateRangePicker";
import { PagamentosProgramados } from "@/components/PagamentosProgramados";
import { fmtBRL, fmtDate } from "@/lib/utils";
import { Wrench, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { useAuth } from "@/integrations/supabase/auth";
import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";
import { DateRange } from "react-day-picker";
import {
  isWithinInterval,
  startOfDay,
  endOfDay,
  parseISO,
  eachDayOfInterval,
  format,
  getDay,
  getDate,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { darkChartTheme, sunsetGradient } from "@/components/charts/ChartTheme";
import { useTheme } from "next-themes";

// â”€â”€â”€â”€ Constantes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STORAGE_KEY_DATE_RANGE = "dashboard_date_range";

// â”€â”€â”€â”€ Helper: Obter período padrão (1º ao último dia do mês) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const getDefaultDateRange = (): DateRange => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { from: firstDay, to: lastDay };
};

// â”€â”€â”€â”€ Helper: Carregar período do localStorage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const loadDateRangeFromStorage = (): DateRange | undefined => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DATE_RANGE);
    if (!stored) return getDefaultDateRange();

    const parsed = JSON.parse(stored);
    return {
      from: parsed.from ? new Date(parsed.from) : undefined,
      to: parsed.to ? new Date(parsed.to) : undefined,
    };
  } catch {
    return getDefaultDateRange();
  }
};

// â”€â”€â”€â”€ Helper: Salvar período no localStorage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const saveDateRangeToStorage = (dateRange: DateRange | undefined): void => {
  try {
    if (!dateRange) {
      localStorage.removeItem(STORAGE_KEY_DATE_RANGE);
      return;
    }

    const toStore = {
      from: dateRange.from?.toISOString(),
      to: dateRange.to?.toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_DATE_RANGE, JSON.stringify(toStore));
  } catch (error) {

  }
};

const FluxoCaixaTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-card rounded-2xl border border-border p-3 text-xs text-foreground" style={{ minWidth: 170 }}>
      <div className="mb-2 text-[11px] font-semibold text-muted-foreground">{label}</div>
      {payload.map((entry: any) => {
        const isReceita = entry.dataKey === "receita";
        const dotColor = isReceita ? "#3b82f6" : "#f97316";
            const labelText = entry.name === "receita" ? "Receitas" : "Despesas";

        return (
          <div key={entry.dataKey} className="flex items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dotColor }} />
              <span className="font-semibold" style={{ color: dotColor }}>{labelText}</span>
            </div>
            <span className="text-muted-foreground">{fmtBRL(entry.value)}</span>
          </div>
        );
      })}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  
  // â”€â”€â”€â”€ Estado do Período (com persistência) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [dateRange, setDateRange] = useState<DateRange | undefined>(loadDateRangeFromStorage);

  // â”€â”€â”€â”€ Persistir período no localStorage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    saveDateRangeToStorage(dateRange);
  }, [dateRange]);

  // â”€â”€â”€â”€ Helper: Verificar se data está no período â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const isInDateRange = (dateString: string | null | undefined): boolean => {
    if (!dateString || !dateRange?.from) return true;
    try {
      const date = new Date(dateString);
      const from = startOfDay(dateRange.from);
      const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
      return isWithinInterval(date, { start: from, end: to });
    } catch {
      return false;
    }
  };

  // â”€â”€â”€â”€ Dados Real-time â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { data: vehicles, loading: loadingVehicles } = useRealtimeData("carcontrol_vehicles");
  const { data: drivers, loading: loadingDrivers } = useRealtimeData("carcontrol_drivers");
  const { data: payments, loading: loadingPayments } = useRealtimeData("carcontrol_payments");
  const { data: alerts, loading: loadingAlerts } = useRealtimeData("carcontrol_alerts");

  // â”€â”€â”€â”€ KPIs Calculados no Backend (RPC) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { data: kpis, isLoading: loadingKPIs } = useDashboardKPIs(dateRange);

  const { data: confirmedPayments } = useRealtimeData(
    "carcontrol_payments",
    {
      select: "id, schedule_date, driver_id, vehicle_id, status, valor",
      filter: (q) => q.eq("status", "pago"),
      order: { column: "schedule_date", ascending: false },
    }
  );
  const { data: confirmedParcelas } = useRealtimeData(
    "carcontrol_parcela_seguro_payments",
    {
      select: "id, schedule_date, vehicle_id, tipo, status, valor",
      filter: (q) => q.eq("status", "pago"),
      order: { column: "schedule_date", ascending: false },
    }
  );

  const isLoading =
    loadingVehicles || loadingDrivers || loadingPayments || loadingAlerts || loadingKPIs;

  // â”€â”€â”€â”€ Busca global (Motoristas, Modelo, Placa) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [searchTerm, setSearchTerm] = useState<string>("");
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredDrivers = drivers.filter((d: any) =>
    d.nome?.toLowerCase().includes(normalizedSearch)
  );
  const filteredVehicles = vehicles.filter((v: any) =>
    v.modelo?.toLowerCase().includes(normalizedSearch) ||
    v.placa?.toLowerCase().includes(normalizedSearch)
  );

  // â”€â”€â”€â”€ Dados Filtrados por Período â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => isInDateRange(a.data));
  }, [alerts, dateRange]);

  // â”€â”€â”€â”€ KPIs â€” Fileira 1 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // 1. Frota Total
  const totalVeiculos = vehicles.length;
  const veiculosAlugados = vehicles.filter(v => v.status === "alugado").length;
  const veiculosOciosos = vehicles.filter(v => v.status === "disponivel").length;

  // 2. Contratos Ativos
  const contratosAtivos = drivers.filter(d => d.status === "ativo").length;
  const contratosAtrasados = drivers.filter(d => d.status === "atrasado").length;

  // 3. Veículos Disponíveis
  const veiculosDisponiveis = vehicles.filter(v => v.status === "disponivel").length;
  const veiculosOficina = vehicles.filter(v => v.status === "oficina").length;

  // â”€â”€â”€â”€ KPIs â€” Fileira 2 (Calculados no Backend) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Valores vêm da função RPC get_dashboard_kpis
  const pagamentosAtrasados = kpis?.pagamentos_atrasados ?? 0;
  const receitaEstimada = kpis?.receita_estimada ?? 0;
  const aReceber = kpis?.a_receber ?? 0;
  const custoTotalEstimado = kpis?.custo_total_estimado ?? 0;
  const lucroEstimado = kpis?.lucro_estimado ?? 0;

  // â”€â”€â”€â”€ Dados para o Gráfico de Fluxo de Caixa â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Recebimentos confirmados com data e valor (para a linha de receita)
  const { data: recebimentosConfirmados } = useRealtimeData(
    "carcontrol_payments",
    {
      select: "id, data, schedule_date, valor, status",
      filter: (q) => q.eq("status", "pago"),
      order: { column: "data", ascending: true },
    }
  );

  // Pagamentos confirmados (parcelas/seguros) com data e valor (para a linha de custo)
  const { data: pagamentosConfirmados } = useRealtimeData(
    "carcontrol_parcela_seguro_payments",
    {
      select: "id, data_pagamento, schedule_date, valor, status",
      filter: (q) => q.eq("status", "pago"),
      order: { column: "data_pagamento", ascending: true },
    }
  );

  // Constrói os dados do gráfico agrupados por data dentro do período
  const fluxoCaixaData = useMemo(() => {
    if (!dateRange?.from) return [];

    const from = startOfDay(dateRange.from);
    const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);

    // Mapa: data (string) â†’ { receita, pagamento }
    const map = new Map<string, { data: string; receita: number; pagamento: number }>();

    // Inicializa todas as datas do período com zero
    const allDates = eachDayOfInterval({ start: from, end: to });
    for (const d of allDates) {
      const key = format(d, "dd/MM", { locale: ptBR });
      map.set(key, { data: key, receita: 0, pagamento: 0 });
    }

    // Acumula recebimentos confirmados
    for (const p of recebimentosConfirmados as any[]) {
      const dateStr = p.schedule_date || p.data;
      if (!dateStr) continue;
      try {
        const d = parseISO(dateStr);
        if (!isWithinInterval(d, { start: from, end: to })) continue;
        const key = format(d, "dd/MM", { locale: ptBR });
        const entry = map.get(key);
        if (entry) entry.receita += p.valor || 0;
      } catch { /* ignora datas inválidas */ }
    }

    // Acumula pagamentos confirmados (parcelas/seguros)
    for (const p of pagamentosConfirmados as any[]) {
      const dateStr = p.schedule_date || p.data_pagamento;
      if (!dateStr) continue;
      try {
        const d = parseISO(dateStr);
        if (!isWithinInterval(d, { start: from, end: to })) continue;
        const key = format(d, "dd/MM", { locale: ptBR });
        const entry = map.get(key);
        if (entry) entry.pagamento += p.valor || 0;
      } catch { /* ignora datas inválidas */ }
    }

    // Retorna apenas datas que têm pelo menos um valor, ou todas se o período for curto
    const result = Array.from(map.values());

    // Se o período for muito longo (> 60 dias), agrupa por semana para legibilidade
    if (allDates.length > 60) {
      const weekMap = new Map<string, { data: string; receita: number; pagamento: number }>();
      for (const entry of result) {
        // Pega apenas a semana (a cada 7 dias)
        const idx = result.indexOf(entry);
        const weekKey = `S${Math.floor(idx / 7) + 1}`;
        const existing = weekMap.get(weekKey) ?? { data: weekKey, receita: 0, pagamento: 0 };
        existing.receita += entry.receita;
        existing.pagamento += entry.pagamento;
        weekMap.set(weekKey, existing);
      }
      return Array.from(weekMap.values());
    }

    return result;
  }, [recebimentosConfirmados, pagamentosConfirmados, dateRange]);

  const totalReceitaConfirmada = useMemo(
    () => fluxoCaixaData.reduce((s, d) => s + d.receita, 0),
    [fluxoCaixaData]
  );
  const totalPagamentoConfirmado = useMemo(
    () => fluxoCaixaData.reduce((s, d) => s + d.pagamento, 0),
    [fluxoCaixaData]
  );

  // â”€â”€â”€â”€ Valores Atrasados (não recebidos até a data atual) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // 1. Busca as programações de pagamentos (recebimentos) em tempo real
  const { data: paymentSchedules, loading: loadingPaymentSchedules } = useRealtimeData(
    "carcontrol_payment_schedules",
    {
      select: "*, driver_id, vehicle_id, valor, data_inicio, data_fim, tipo_recorrencia, dia_mes, dia_semana, ativo",
      order: { column: "created_at", ascending: false },
    }
  );

  // 2. Conjunto de chaves exatas de pagamentos já confirmados (mesmo código usado em PagamentosProgramados)
  const { data: confirmedPaymentsRaw } = useRealtimeData(
    "carcontrol_payments",
    {
      select: "id, schedule_date, driver_id, vehicle_id, valor, status",
      filter: (q) => q.eq("status", "pago").not("schedule_date", "is", null),
    }
  );

  const confirmedExactKeys = useMemo(() => {
    const set = new Set<string>();
    for (const p of confirmedPaymentsRaw as any[]) {
      if (!p.driver_id || !p.schedule_date) continue;
      const key = `${p.schedule_date}|${p.driver_id}|${p.vehicle_id ?? ""}|${Number(p.valor)}`;
      set.add(key);
    }
    return set;
  }, [confirmedPaymentsRaw]);

  // 3. Gera ocorrências de cada programação dentro do intervalo até hoje
  const overdueValues = useMemo(() => {
    if (!paymentSchedules) return 0;
    const today = new Date();
    let total = 0;
    for (const schedule of paymentSchedules as any[]) {
      if (!schedule.ativo) continue;
      // intervalo efetivo da programação
      const scheduleStart = parseISO(schedule.data_inicio);
      const scheduleEnd = schedule.data_fim ? parseISO(schedule.data_fim) : today;
      const effectiveEnd = scheduleEnd < today ? scheduleEnd : today;
      if (scheduleStart > effectiveEnd) continue;
      const allDates = eachDayOfInterval({ start: scheduleStart, end: effectiveEnd });
      for (const d of allDates) {
        let matches = false;
        if (schedule.tipo_recorrencia === "semanal" && schedule.dia_semana !== null) {
          matches = getDay(d) === schedule.dia_semana;
        } else if (schedule.tipo_recorrencia === "mensal" && schedule.dia_mes !== null) {
          matches = getDate(d) === schedule.dia_mes;
        }
        if (!matches) continue;
        const dateStr = format(d, "yyyy-MM-dd");
        const key = `${dateStr}|${schedule.driver_id ?? ""}|${schedule.vehicle_id ?? ""}|${Number(schedule.valor)}`;
        if (!confirmedExactKeys.has(key)) {
          total += Number(schedule.valor) || 0;
        }
      }
    }
    return total;
  }, [paymentSchedules, confirmedExactKeys]);

  const totalValoresAtrasados = overdueValues;

  const today = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long" });

  // Função para obter saudação de acordo com a hora do dia
  const getSaudacao = (): string => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return "Bom dia";
    if (hora >= 12 && hora < 18) return "Boa tarde";
    return "Boa noite";
  };

  const sevColors: Record<string, string> = {
    critico: "text-danger",
    atencao: "text-warning",
    info: "text-muted-foreground",
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Topbar 
        title={
          <span className="inline-flex items-center gap-2">
            <span>{getSaudacao()}, {user?.user_metadata?.full_name?.split(" ")[0] || "Motorista"}</span>
            <img src="/assets/cabeca.png" alt="Saudação" className="w-8 h-8 object-contain" />
          </span>
        }
        subtitle={`Aqui está o panorama da sua frota hoje, ${today}.`}
        helpPath="/ajuda/gestao"
      />

      {/* Seletor de Período */}
      <section className="mb-4 md:mb-6 flex justify-end animate-blur-in">
        <DateRangePicker
          date={dateRange}
          onDateChange={setDateRange}
          className="w-full sm:w-auto sm:min-w-[280px]"
        />
      </section>

      {/* KPIs â€” Fileira 1: Indicadores Operacionais */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        <StatCard
          label="Frota Total"
          value={String(totalVeiculos)}
          icon={<img src="/assets/carro.png" alt="Frota total" className="w-5 h-5 md:w-6 md:h-6 object-contain" />}
          hint={`${veiculosAlugados} alugados · ${veiculosOciosos} ociosos`}
        />
        <StatCard
          label="Contratos Ativos"
          value={String(contratosAtivos)}
          icon={<img src="/assets/folders.png" alt="Contratos ativos" className="w-5 h-5 md:w-6 md:h-6 object-contain" />}
          hint={contratosAtrasados > 0 ? `${contratosAtrasados} em atraso` : "Todos em dia"}
          delay="delay-75"
        />
        <StatCard
          label="Veículos Disponíveis"
          value={String(veiculosDisponiveis)}
          icon={<img src="/assets/carroPreto.png" alt="Veículos disponíveis" className="w-5 h-5 md:w-6 md:h-6 object-contain" />}
          hint={veiculosOficina > 0 ? `${veiculosOficina} na oficina` : "Nenhum em manutenção"}
          delay="delay-150"
        />
        <StatCard
          label="Atrasados"
          value={String(pagamentosAtrasados)}
          icon={<img src="/assets/alerta2.png" alt="Atrasados" className="w-5 h-5 md:w-6 md:h-6 object-contain" />}
          hint="Recebimentos vencidos não confirmados"
          delay="delay-300"
        />
      </section>

      {/* KPIs â€” Fileira 2: Indicadores Financeiros do Período */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mt-3 md:mt-5">
        <StatCard
          label="Receb. Previsto"
          value={fmtBRL(receitaEstimada)}
          icon={<img src="/assets/receitames.png" alt="Receita estimada" className="w-5 h-5 md:w-6 md:h-6 object-contain" />}
          hint="Total de recebimentos no período"
        />
        <StatCard
          label="Valores Recebidos"
          value={fmtBRL(totalReceitaConfirmada)}
          icon={<img src="/assets/rs.png" alt="Valores recebidos" className="w-5 h-5 md:w-6 md:h-6 object-contain" />}
          hint={`Total recebido no período`}
          delay="delay-300"
        />
        <StatCard
          label="A Receber"
          value={fmtBRL(aReceber)}
          icon={<img src="/assets/pag-pendente.png" alt="A receber" className="w-5 h-5 md:w-6 md:h-6 object-contain" />}
          hint="Pendentes com data futura"
          delay="delay-75"
        />   
        <StatCard
          label="Valores Atrasados"
          value={fmtBRL(totalValoresAtrasados)}
          icon={<img src="/assets/atrasado.png" alt="Valores atrasados" className="w-5 h-5 md:w-6 md:h-6 object-contain" />}
          hint="Valor que deveria ter sido recebido e está em atraso"
          delay="delay-150"
        />
      </section>

      {/* Pagamentos Programados */}
      <section className="mt-6 md:mt-8">
        <PagamentosProgramados dateRange={dateRange} />
      </section>

      {/* Mid grid */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
        <div className="neu p-4 md:p-6 xl:col-span-2 animate-blur-in delay-150 transition-all duration-300 hover:neu-interactive">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
            <div>
              <h2 className="font-display text-lg md:text-xl font-bold">Fluxo de Caixa</h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Recebimentos e pagamentos confirmados no período
              </p>
            </div>
            <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-blue-500 inline-block rounded" />
                <span className="text-muted-foreground">Receitas</span>
                <span className="font-semibold text-blue-600">{fmtBRL(totalReceitaConfirmada)}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-orange-400 inline-block rounded" />
                <span className="text-muted-foreground">Despesas</span>
                <span className="font-semibold text-orange-600">{fmtBRL(totalPagamentoConfirmado)}</span>
              </span>
            </div>
          </div>

          {fluxoCaixaData.length === 0 || (totalReceitaConfirmada === 0 && totalPagamentoConfirmado === 0) ? (
            <div className="flex items-center justify-center h-40 md:h-48 text-xs md:text-sm text-muted-foreground">
              Nenhum pagamento confirmado no período selecionado
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160} className="md:!h-48">
              <AreaChart data={fluxoCaixaData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="receitaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="pagamentoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="var(--border)" 
                  opacity={0.5} 
                />
                <XAxis
                  dataKey="data"
                  tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                  width={35}
                />
                <Tooltip content={<FluxoCaixaTooltip />} />
                <Legend
                  formatter={(value) => value === "receita" ? "Receitas" : "Despesas"}
                  wrapperStyle={{ fontSize: 10 }}
                />
                <Area
                  type="monotone"
                  dataKey="receita"
                  stroke="#3b82f6"
                  fill="url(#receitaGradient)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="pagamento"
                  stroke="#f97316"
                  fill="url(#pagamentoGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="neu p-4 md:p-6 animate-blur-in delay-300 transition-shadow duration-200 shadow-sm shadow-gray-200 hover:shadow-md hover:shadow-gray-400/40">
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <h2 className="font-display text-lg md:text-xl font-bold flex items-center gap-2">
              <img src="/assets/alerta.png" alt="Alertas" className="w-4 h-4 md:w-5 md:h-5 object-contain" /> Alertas
            </h2>
            <Link to="/alertas" className="text-[10px] md:text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 touch-target">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ul className="space-y-2 md:space-y-3">
            {filteredAlerts.slice(0, 4).map(a => (
              <li key={a.id} className="neu-inset px-3 md:px-4 py-2 md:py-3">
                <div className="flex items-start gap-2 md:gap-3">
                  <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mt-1.5 md:mt-2 ${sevColors[a.severidade] || "text-muted-foreground"} bg-current animate-pulse-soft shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs md:text-sm font-semibold leading-tight line-clamp-2">{a.titulo}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.descricao}</div>
                  </div>
                  <span className="text-[9px] md:text-[10px] text-muted-foreground whitespace-nowrap shrink-0">{a.data ? fmtDate(a.data) : "â€”"}</span>
                </div>
              </li>
            ))}
            {filteredAlerts.length === 0 && (
              <div className="text-center py-6 text-xs md:text-sm text-muted-foreground">Nenhum alerta no período selecionado</div>
            )}
          </ul>
        </div>
      </section>

      {/* Seção Motoristas (se houver busca) */}
      {searchTerm && filteredDrivers.length > 0 && (
        <section className="mt-6 md:mt-8">
          <h2 className="font-display text-lg md:text-xl font-bold mb-4">Motoristas Encontrados ({filteredDrivers.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDrivers.map((d: any) => (
              <div key={d.id} className="neu p-4 md:p-5 rounded-lg">
                <div className="text-sm md:text-base font-semibold">{d.nome}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">{d.telefone || "Sem telefone"}</div>
                {d.status && (
                  <div className="text-xs mt-2">
                    <span className={`inline-block px-2 py-1 rounded ${d.status === "ativo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {d.status === "ativo" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 md:mt-8">
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <h2 className="font-display text-xl md:text-2xl font-bold">
            {searchTerm ? `Veículos Encontrados (${filteredVehicles.length})` : "Sua frota"}
          </h2>
          <Link to="/veiculos" className="text-xs md:text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 touch-target">
            Ver todos <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
          {(searchTerm ? filteredVehicles : vehicles).slice(0, 6).map((v, i) => (
            <VehicleCard key={v.id} vehicle={v} delay={`delay-${(i % 4) * 75 + 75}`} />
          ))}
          {(searchTerm ? filteredVehicles : vehicles).length === 0 && (
            <div className="col-span-full neu p-8 md:p-10 text-center text-xs md:text-sm text-muted-foreground">
              {searchTerm ? "Nenhum veículo encontrado com esse critério" : "Nenhum veículo cadastrado"}
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8 mb-4">
        <div className="neu p-4 md:p-6 animate-blur-in transition-shadow duration-200 shadow-sm shadow-gray-200 hover:shadow-md hover:shadow-gray-400/40">
          <h2 className="font-display text-lg md:text-xl font-bold flex items-center gap-2 mb-4 md:mb-5">
            <img src="/assets/settings.png" alt="Configurações" className="w-4 h-4 md:w-5 md:h-5 object-contain" /> Próximas manutenções
          </h2>
          <ul className="space-y-2 md:space-y-3">
            {vehicles.filter(v => v.status === "oficina").map((v, i) => (
              <li key={v.id} className="flex items-center gap-3 md:gap-4 neu-inset px-3 md:px-4 py-2 md:py-3">
                <div className="neu-sm w-9 h-9 md:w-10 md:h-10 grid place-items-center shrink-0"><Wrench className="w-3.5 h-3.5 md:w-4 md:h-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs md:text-sm font-semibold truncate">{v.modelo}</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground truncate">{v.placa} · {v.marca}</div>
                </div>
                <span className="chip text-warning text-[10px] md:text-xs shrink-0">Na oficina</span>
              </li>
            ))}
            {vehicles.filter(v => v.status === "oficina").length === 0 && (
              <div className="text-center py-6 text-xs md:text-sm text-muted-foreground">Nenhuma manutenção programada</div>
            )}
          </ul>
        </div>

        <div className="neu p-4 md:p-6 animate-blur-in delay-150 transition-shadow duration-200 shadow-sm shadow-gray-200 hover:shadow-md hover:shadow-gray-400/40">
          <h2 className="font-display text-lg md:text-xl font-bold flex items-center gap-2 mb-4 md:mb-5">
            <img src="/assets/pag-pendente.png" alt="A receber" className="w-4 h-4 md:w-5 md:h-5 object-contain" /> A Receber no Período
          </h2>
          <div className="text-center py-2">
            <div className="font-display text-3xl md:text-4xl font-bold text-emerald-600">
              {fmtBRL(aReceber)}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1">recebimentos pendentes com data futura</div>
            {pagamentosAtrasados > 0 && (
              <div className="mt-3 text-[10px] md:text-xs text-red-600 font-medium bg-red-50 rounded-lg px-3 py-2">
                âš ️ {pagamentosAtrasados} recebimento{pagamentosAtrasados !== 1 ? "s" : ""} em atraso
              </div>
            )}
          </div>
          <Link to="/pagamentos" className="neu-interactive mt-4 w-full flex items-center justify-center gap-2 py-3 text-xs md:text-sm font-medium touch-target">
            Ir para Pagamentos <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </Link>
        </div>
      </section>
    </AppShell>
  );
};

export default Dashboard;
