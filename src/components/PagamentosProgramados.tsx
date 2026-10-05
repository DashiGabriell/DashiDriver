import { useState, useMemo } from "react";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { fmtBRL } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { 
  startOfDay, 
  endOfDay, 
  parseISO, 
  eachDayOfInterval,
  getDay,
  getDate,
  format,
  differenceInDays,
} from "date-fns";
import { toast } from "sonner";
import {
  Calendar,
  CheckCircle2,
  Loader2,
  DollarSign,
  Car,
  Repeat2,
  AlertCircle,
  Clock,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ──── Types ──────────────────────────────────────────────────────────────────
interface PaymentSchedule {
  id: string;
  driver_id: string | null;
  vehicle_id: string | null;
  descricao: string | null;
  valor: number;
  metodo: string;
  tipo_recorrencia: "mensal" | "semanal";
  dia_mes: number | null;
  dia_semana: number | null;
  data_inicio: string;
  data_fim: string | null;
  ativo: boolean;
  carcontrol_drivers?: { nome: string } | null;
  carcontrol_vehicles?: { modelo: string; placa: string } | null;
}

interface ParcelaSeguroSchedule {
  id: string;
  vehicle_id: string | null;
  tipo: "parcela" | "seguro";
  valor: number;
  tipo_recorrencia: "mensal" | "semanal";
  dia_mes: number | null;
  dia_semana: number | null;
  data_inicio: string;
  data_fim: string | null;
  ativo: boolean;
  metodo_pagamento: string | null;
  observacoes: string | null;
  carcontrol_vehicles?: { modelo: string; placa: string } | null;
}

interface ConfirmPaymentForm {
  data_pagamento: string;
  metodo: string;
  observacoes: string;
  // Arquivo PDF do comprovante, opcional
  comprovante?: File | null;
  abatimento?: number;
}

interface ScheduleOccurrence {
  scheduleId: string;
  date: Date;
  schedule: PaymentSchedule | ParcelaSeguroSchedule;
  type: "payment" | "parcela_seguro";
}

// ──── Props ──────────────────────────────────────────────────────────────────
interface PagamentosProgramadosProps {
  dateRange: DateRange | undefined;
}

// ──── Helpers ────────────────────────────────────────────────────────────────
const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

function recurrenceLabel(
  tipo: "mensal" | "semanal",
  diaMes: number | null,
  diaSemana: number | null
): string {
  if (tipo === "semanal" && diaSemana !== null) {
    return `Toda ${DIAS_SEMANA[diaSemana]}`;
  }
  if (tipo === "mensal" && diaMes !== null) {
    return `Todo dia ${diaMes}`;
  }
  return "—";
}

function shouldShowInPeriod(
  dataInicio: string,
  dataFim: string | null,
  dateRange: DateRange | undefined
): boolean {
  if (!dateRange?.from) return true;

  const inicio = parseISO(dataInicio);
  const fim = dataFim ? parseISO(dataFim) : null;
  const from = startOfDay(dateRange.from);
  const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);

  // Se a programação já terminou antes do período, não mostrar
  if (fim && fim < from) return false;

  // Se a programação começa depois do período, não mostrar
  if (inicio > to) return false;

  // Caso contrário, está ativa no período
  return true;
}

/**
 * Gera todas as ocorrências de uma programação dentro do período selecionado
 */
function generateScheduleOccurrences(
  schedule: PaymentSchedule | ParcelaSeguroSchedule,
  type: "payment" | "parcela_seguro",
  dateRange: DateRange | undefined
): ScheduleOccurrence[] {
  if (!dateRange?.from) return [];

  const occurrences: ScheduleOccurrence[] = [];
  
  // Definir o intervalo de busca
  const periodStart = startOfDay(dateRange.from);
  const periodEnd = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
  
  // Definir o início e fim da programação
  const scheduleStart = parseISO(schedule.data_inicio);
  const scheduleEnd = schedule.data_fim ? parseISO(schedule.data_fim) : periodEnd;
  
  // Intervalo efetivo: interseção entre período selecionado e programação
  const effectiveStart = scheduleStart > periodStart ? scheduleStart : periodStart;
  const effectiveEnd = scheduleEnd < periodEnd ? scheduleEnd : periodEnd;
  
  // Se não há interseção, retornar vazio
  if (effectiveStart > effectiveEnd) return [];
  
  // Gerar todas as datas do intervalo
  const allDates = eachDayOfInterval({ start: effectiveStart, end: effectiveEnd });
  
  // Filtrar datas que correspondem à recorrência
  for (const date of allDates) {
    let matches = false;
    
    if (schedule.tipo_recorrencia === "semanal" && schedule.dia_semana !== null) {
      // Verificar se o dia da semana corresponde (0 = Domingo, 6 = Sábado)
      matches = getDay(date) === schedule.dia_semana;
    } else if (schedule.tipo_recorrencia === "mensal" && schedule.dia_mes !== null) {
      // Verificar se o dia do mês corresponde
      matches = getDate(date) === schedule.dia_mes;
    }
    
    if (matches) {
      occurrences.push({
        scheduleId: schedule.id,
        date,
        schedule,
        type,
      });
    }
  }
  
  return occurrences;
}

// ──── Constantes ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;

// ──── Component ──────────────────────────────────────────────────────────────────
export function PagamentosProgramados({ dateRange }: PagamentosProgramadosProps) {
  const { session } = useAuth();

  // ──── Estados ────────────────────────────────────────────────────────
  const [currentPagePayments, setCurrentPagePayments] = useState(1);
  const [currentPageParcelas, setCurrentPageParcelas] = useState(1);
  const [confirmingOccurrence, setConfirmingOccurrence] = useState<ScheduleOccurrence | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmForm, setConfirmForm] = useState<ConfirmPaymentForm>({
    data_pagamento: new Date().toISOString().slice(0, 10),
    metodo: "pix",
    observacoes: "",
    comprovante: null,
    abatimento: 0,
  });

  // ──── Dados Real-time ────────────────────────────────────────────────────
  const { data: paymentSchedules, loading: loadingPayments } = useRealtimeData(
    "carcontrol_payment_schedules",
    {
      select: "*, carcontrol_drivers!driver_id(nome), carcontrol_vehicles!vehicle_id(modelo, placa)",
      order: { column: "created_at", ascending: false },
    }
  );

  const { data: parcelaSeguroSchedules, loading: loadingParcelas } = useRealtimeData(
    "carcontrol_parcela_seguro_schedules",
    {
      select: "*, carcontrol_vehicles!vehicle_id(modelo, placa)",
      order: { column: "created_at", ascending: false },
    }
  );

  // ──── Pagamentos já confirmados (realtime) ───────────────────────────────
  // Busca APENAS pagamentos que vieram de uma programação (schedule_date preenchido)
  // com status "pago". Pagamentos manuais sem schedule_date são ignorados.
  const { data: confirmedPaymentsRaw } = useRealtimeData(
    "carcontrol_payments",
    {
      select: "id, data, schedule_date, driver_id, vehicle_id, valor, status",
      filter: (q) => q.eq("status", "pago").not("schedule_date", "is", null),
      order: { column: "schedule_date", ascending: false },
    }
  );

  // ──── Set de chaves exatas via schedule_date ────────────────────────────
  // Chave: "schedule_date|driver_id|vehicle_id"
  // Uma ocorrência só é marcada como "Recebido" se existir um registro no banco
  // com exatamente essa combinação de schedule_date + driver_id + vehicle_id.
  const confirmedExactKeys = useMemo(() => {
    const exactKeys = new Set<string>();

    for (const p of confirmedPaymentsRaw as any[]) {
      if (!p.driver_id || !p.schedule_date) continue;
      const driverVehicleKey = `${p.driver_id}|${p.vehicle_id ?? ""}|${Number(p.valor)}`;
      exactKeys.add(`${p.schedule_date}|${driverVehicleKey}`);
    }

    return exactKeys;
  }, [confirmedPaymentsRaw]);

  // Helper: verifica se uma ocorrência de recebimento já foi confirmada.
  // Correspondência EXATA por schedule_date + driver_id + vehicle_id + valor.
  const isOccurrenceConfirmed = (occurrence: ScheduleOccurrence): boolean => {
    if (occurrence.type !== "payment") return false;
    const schedule = occurrence.schedule as PaymentSchedule;
    const driverVehicleKey = `${schedule.driver_id ?? ""}|${schedule.vehicle_id ?? ""}|${Number(schedule.valor)}`;
    const occurrenceDateStr = format(occurrence.date, "yyyy-MM-dd");
    return confirmedExactKeys.has(`${occurrenceDateStr}|${driverVehicleKey}`);
  };

  // ──── Parcelas/Seguros já confirmados (realtime) ─────────────────────────
  // Busca APENAS pagamentos de parcela/seguro que vieram de programação (schedule_date preenchido)
  const { data: confirmedParcelasRaw } = useRealtimeData(
    "carcontrol_parcela_seguro_payments",
    {
      select: "id, schedule_date, data_pagamento, vehicle_id, tipo, status, valor",
      filter: (q) => q.eq("status", "pago").not("schedule_date", "is", null),
      order: { column: "schedule_date", ascending: false },
    }
  );

  // ──── Set de chaves exatas para parcelas/seguros ────────────────────────
  // Usa APENAS schedule_date — sem fallback por tolerância (evita falsos positivos).
  const confirmedParcelaExactKeys = useMemo(() => {
    const exactKeys = new Set<string>();

    for (const p of confirmedParcelasRaw as any[]) {
      if (!p.vehicle_id || !p.tipo || !p.schedule_date) continue;
      const vehicleTipoKey = `${p.vehicle_id}|${p.tipo}|${Number(p.valor)}`;
      exactKeys.add(`${p.schedule_date}|${vehicleTipoKey}`);
    }

    return exactKeys;
  }, [confirmedParcelasRaw]);

  // Helper: verifica se uma ocorrência de parcela/seguro já foi confirmada.
  // Correspondência EXATA por schedule_date + vehicle_id + tipo + valor.
  const isParcelaOccurrenceConfirmed = (occurrence: ScheduleOccurrence): boolean => {
    if (occurrence.type !== "parcela_seguro") return false;
    const schedule = occurrence.schedule as ParcelaSeguroSchedule;
    const vehicleTipoKey = `${schedule.vehicle_id ?? ""}|${schedule.tipo}|${Number(schedule.valor)}`;
    const occurrenceDateStr = format(occurrence.date, "yyyy-MM-dd");
    return confirmedParcelaExactKeys.has(`${occurrenceDateStr}|${vehicleTipoKey}`);
  };

  // Helper to determine if a payment occurrence is overdue (date in past and not confirmed)
  const isPaymentOverdue = (occurrence: ScheduleOccurrence): boolean => {
    if (isOccurrenceConfirmed(occurrence)) return false;
    const today = new Date();
    return occurrence.date < today;
  };

  // Helper to determine if a parcela occurrence is overdue (date in past and not confirmed)
  const isParcelaOverdue = (occurrence: ScheduleOccurrence): boolean => {
    if (isParcelaOccurrenceConfirmed(occurrence)) return false;
    const today = new Date();
    return occurrence.date < today;
  };

  // ──── Filtrar programações ativas no período ─────────────────────────────
  const activePaymentSchedules = useMemo(() => {
    return (paymentSchedules as PaymentSchedule[])
      .filter((s) => s.ativo)
      .filter((s) => shouldShowInPeriod(s.data_inicio, s.data_fim, dateRange));
  }, [paymentSchedules, dateRange]);

  const activeParcelaSchedules = useMemo(() => {
    return (parcelaSeguroSchedules as ParcelaSeguroSchedule[])
      .filter((s) => s.ativo)
      .filter((s) => shouldShowInPeriod(s.data_inicio, s.data_fim, dateRange));
  }, [parcelaSeguroSchedules, dateRange]);

  // ──── Gerar ocorrências individuais por data ──────────────────────────────
  const paymentOccurrences = useMemo(() => {
    const occurrences: ScheduleOccurrence[] = [];
    for (const schedule of activePaymentSchedules) {
      occurrences.push(...generateScheduleOccurrences(schedule, "payment", dateRange));
    }
    return occurrences.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [activePaymentSchedules, dateRange]);

  const parcelaOccurrences = useMemo(() => {
    const occurrences: ScheduleOccurrence[] = [];
    for (const schedule of activeParcelaSchedules) {
      occurrences.push(...generateScheduleOccurrences(schedule, "parcela_seguro", dateRange));
    }
    return occurrences.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [activeParcelaSchedules, dateRange]);

  const totalProgramados = paymentOccurrences.length + parcelaOccurrences.length;
  // ──── Paginação ──────────────────────────────────────────────────────────────
  const totalPagesPayments = Math.ceil(paymentOccurrences.length / ITEMS_PER_PAGE);
  const totalPagesParcelas = Math.ceil(parcelaOccurrences.length / ITEMS_PER_PAGE);

  const startIndexPayments = (currentPagePayments - 1) * ITEMS_PER_PAGE;
  const endIndexPayments = startIndexPayments + ITEMS_PER_PAGE;
  const paginatedPayments = paymentOccurrences.slice(startIndexPayments, endIndexPayments);

  const startIndexParcelas = (currentPageParcelas - 1) * ITEMS_PER_PAGE;
  const endIndexParcelas = startIndexParcelas + ITEMS_PER_PAGE;
  const paginatedParcelas = parcelaOccurrences.slice(startIndexParcelas, endIndexParcelas);
  // ──── Handlers ───────────────────────────────────────────────────────────
  const handleOpenConfirm = (occurrence: ScheduleOccurrence) => {
    setConfirmingOccurrence(occurrence);
    const schedule = occurrence.schedule;
    setConfirmForm({
      data_pagamento: format(occurrence.date, "yyyy-MM-dd"),
      metodo: occurrence.type === "payment" 
        ? (schedule as PaymentSchedule).metodo 
        : (schedule as ParcelaSeguroSchedule).metodo_pagamento || "pix",
      observacoes: "",
      abatimento: 0,
    });
  };

  const handleCloseConfirm = () => {
    setConfirmingOccurrence(null);
    setConfirmForm({
      data_pagamento: new Date().toISOString().slice(0, 10),
      metodo: "pix",
      observacoes: "",
      abatimento: 0,
    });
  };

  const handleConfirmPayment = async () => {
    if (!confirmingOccurrence || !session) return;

    const { type, schedule } = confirmingOccurrence;

    if (!confirmForm.data_pagamento) {
      toast.error("Informe a data do pagamento");
      return;
    }

    const abatimento = confirmForm.abatimento || 0;
    if (abatimento > 0 && !confirmForm.observacoes?.trim()) {
      toast.error("Informe o motivo do abatimento no campo Observações");
      return;
    }

    const valorFinal = Math.max(0, schedule.valor - abatimento);
    const observacoes = abatimento > 0
      ? `Abatimento de ${fmtBRL(abatimento)}. ${confirmForm.observacoes}`
      : confirmForm.observacoes;

    setIsConfirming(true);

    try {
      if (type === "payment") {
        // Registrar pagamento de recebimento (aluguel)
        const paymentSchedule = schedule as PaymentSchedule;
        let comprovanteUrl: string | null = null;
        if (confirmForm.comprovante) {
          const file = confirmForm.comprovante as File;
          const filePath = `${session.user.id}/${Date.now()}_${file.name}`;
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from("payment-receipts")
            .upload(filePath, file, { upsert: false });
          if (uploadErr) throw uploadErr;
          const { data: { publicUrl } } = supabase.storage.from("payment-receipts").getPublicUrl(filePath);
          comprovanteUrl = publicUrl;
        }
        const { error } = await supabase.from("carcontrol_payments").insert({
          driver_id: paymentSchedule.driver_id,
          vehicle_id: paymentSchedule.vehicle_id,
          data: confirmForm.data_pagamento,
          schedule_date: format(confirmingOccurrence.date, "yyyy-MM-dd"),
          valor: valorFinal,
          metodo: confirmForm.metodo,
          status: "pago",
          user_id: session.user.id,
          comprovante_url: comprovanteUrl,
          observacoes: observacoes,
        });

        if (error) throw error;
        toast.success("Pagamento registrado com sucesso!");
      } else {
        // Registrar pagamento de parcela/seguro
        const parcelaSchedule = schedule as ParcelaSeguroSchedule;
        const { error } = await supabase.from("carcontrol_parcela_seguro_payments").insert({
          vehicle_id: parcelaSchedule.vehicle_id,
          tipo: parcelaSchedule.tipo,
          valor: valorFinal,
          data_vencimento: confirmForm.data_pagamento,
          data_pagamento: confirmForm.data_pagamento,
          schedule_date: format(confirmingOccurrence.date, "yyyy-MM-dd"),
          status: "pago",
          metodo_pagamento: confirmForm.metodo,
          observacoes: observacoes || parcelaSchedule.observacoes,
          user_id: session.user.id,
        });

        if (error) throw error;
        toast.success(`${parcelaSchedule.tipo === "parcela" ? "Parcela" : "Seguro"} registrado com sucesso!`);
      }

      handleCloseConfirm();
    } catch (err) {
      const error = err as Error;
      toast.error(`Erro ao registrar pagamento: ${error.message}`);
    } finally {
      setIsConfirming(false);
    }
  };

  // ──── Loading State ──────────────────────────────────────────────────────
  if (loadingPayments || loadingParcelas) {
    return (
      <div className="neu p-6 animate-blur-in">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // ──── Empty State ────────────────────────────────────────────────────────
  if (totalProgramados === 0) {
    return null; // Não mostrar o card se não houver programações
  }

  // ──── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <div className="neu p-6 animate-blur-in transition-all duration-300 hover:neu-interactive">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Pagamentos e Recebimentos Programados
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {totalProgramados} programação(ões) ativa(s) no período selecionado
            </p>
          </div>
        </div>

        <Tabs defaultValue="recebimentos" className="w-full">
          <TabsList className="mb-4 neu px-1 py-1 h-auto gap-1 bg-transparent">
            <TabsTrigger
              value="recebimentos"
              className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <DollarSign className="w-4 h-4" />
              Recebimentos ({paymentOccurrences.length})
            </TabsTrigger>
            <TabsTrigger
              value="pagamentos"
              className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Car className="w-4 h-4" />
              Pagamentos ({parcelaOccurrences.length})
            </TabsTrigger>
          </TabsList>

          {/* Aba: Recebimentos */}
          <TabsContent value="recebimentos">
            {paymentOccurrences.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground neu-inset rounded-lg">
                Nenhum recebimento programado no período selecionado
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Recorrência</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPayments.map((occurrence, index) => {
                      const schedule = occurrence.schedule as PaymentSchedule;
                      const confirmed = isOccurrenceConfirmed(occurrence);
                      return (
                        <TableRow
                          key={`payment-${occurrence.scheduleId}-${index}`}
                          className={confirmed ? "bg-emerald-500/10" : undefined}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {confirmed
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                : <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                              }
                              <span className={`font-mono text-sm font-semibold ${confirmed ? "text-emerald-500" : ""}`}>
                                {format(occurrence.date, "dd/MM/yyyy")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="neu-sm w-8 h-8 grid place-items-center flex-shrink-0">
                                <DollarSign className="w-4 h-4 text-green-600" />
                              </div>
                              <span className="text-xs font-medium text-green-600">Recebimento</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold truncate">
                                {schedule.carcontrol_drivers?.nome || "Motorista não informado"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {schedule.carcontrol_vehicles
                                  ? `${schedule.carcontrol_vehicles.modelo} • ${schedule.carcontrol_vehicles.placa}`
                                  : "Veículo não informado"}
                                {schedule.descricao && ` • ${schedule.descricao}`}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Repeat2 className="w-3.5 h-3.5" />
                              {recurrenceLabel(schedule.tipo_recorrencia, schedule.dia_mes, schedule.dia_semana)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className={`font-display font-bold ${
                              confirmed ? "text-emerald-500" :
                              isPaymentOverdue(occurrence) ? "text-red-600 animate-pulse" : "text-green-600"
                            }`}
                            >
                              {fmtBRL(schedule.valor)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs capitalize">{schedule.metodo}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            {confirmed ? (
                              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Recebido
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                className="gap-1.5"
                                onClick={() => handleOpenConfirm(occurrence)}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Confirmar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação para Recebimentos */}
                {totalPagesPayments > 1 && (
                  <div className="flex items-center justify-between mt-4 px-2">
                    <div className="text-xs text-muted-foreground">
                      Mostrando {startIndexPayments + 1}-{Math.min(endIndexPayments, paymentOccurrences.length)} de {paymentOccurrences.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPagePayments(p => Math.max(1, p - 1))}
                        disabled={currentPagePayments === 1}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Anterior
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPagesPayments }).map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPagePayments(i + 1)}
                            className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                              currentPagePayments === i + 1
                                ? "bg-primary text-primary-foreground"
                                : "border border-border hover:bg-muted"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPagePayments(p => Math.min(totalPagesPayments, p + 1))}
                        disabled={currentPagePayments === totalPagesPayments}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Próximo
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Aba: Pagamentos (Parcelas/Seguros) */}
          <TabsContent value="pagamentos">
            {parcelaOccurrences.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground neu-inset rounded-lg">
                Nenhum pagamento programado no período selecionado
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Recorrência</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedParcelas.map((occurrence, index) => {
                      const schedule = occurrence.schedule as ParcelaSeguroSchedule;
                      const confirmedParcela = isParcelaOccurrenceConfirmed(occurrence);
                      return (
                        <TableRow
                          key={`parcela-${occurrence.scheduleId}-${index}`}
                          className={confirmedParcela ? "bg-emerald-500/10" : undefined}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {confirmedParcela
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                : <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                              }
                              <span className={`font-mono text-sm font-semibold ${confirmedParcela ? "text-emerald-500" : ""}`}>
                                {format(occurrence.date, "dd/MM/yyyy")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="neu-sm w-8 h-8 grid place-items-center flex-shrink-0">
                                <Car className="w-4 h-4 text-orange-600" />
                              </div>
                              <span className="text-xs font-medium text-orange-600 capitalize">
                                {schedule.tipo}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold truncate">
                                {schedule.carcontrol_vehicles
                                  ? `${schedule.carcontrol_vehicles.modelo} • ${schedule.carcontrol_vehicles.placa}`
                                  : "Veículo não informado"}
                              </div>
                              {schedule.observacoes && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {schedule.observacoes}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Repeat2 className="w-3.5 h-3.5" />
                              {recurrenceLabel(schedule.tipo_recorrencia, schedule.dia_mes, schedule.dia_semana)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className={`font-display font-bold ${confirmedParcela ? "text-emerald-500" : "text-orange-600"}`}>
                              {fmtBRL(schedule.valor)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs capitalize">
                              {schedule.metodo_pagamento || "—"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {confirmedParcela ? (
                              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Pago
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5"
                                onClick={() => handleOpenConfirm(occurrence)}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Confirmar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação para Pagamentos */}
                {totalPagesParcelas > 1 && (
                  <div className="flex items-center justify-between mt-4 px-2">
                    <div className="text-xs text-muted-foreground">
                      Mostrando {startIndexParcelas + 1}-{Math.min(endIndexParcelas, parcelaOccurrences.length)} de {parcelaOccurrences.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPageParcelas(p => Math.max(1, p - 1))}
                        disabled={currentPageParcelas === 1}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Anterior
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPagesParcelas }).map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPageParcelas(i + 1)}
                            className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                              currentPageParcelas === i + 1
                                ? "bg-primary text-primary-foreground"
                                : "border border-border hover:bg-muted"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPageParcelas(p => Math.min(totalPagesParcelas, p + 1))}
                        disabled={currentPageParcelas === totalPagesParcelas}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Próximo
                      </button>
                    </div>
                  </div>
                )}
              </>
              )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de Confirmação */}
      <Dialog open={!!confirmingOccurrence} onOpenChange={handleCloseConfirm}>
        <DialogContent className="max-w-md max-h-[75vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirmar Pagamento Programado</DialogTitle>
            <DialogDescription>
              Registre o pagamento desta ocorrência específica
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Informações da Ocorrência */}
            {confirmingOccurrence && (
              <div className="neu-inset p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Data da Ocorrência:</span>
                  <span className="font-mono font-bold text-primary">
                    {format(confirmingOccurrence.date, "dd/MM/yyyy")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valor:</span>
                  <span className="font-display font-bold text-lg">
                    {fmtBRL(confirmingOccurrence.schedule.valor)}
                  </span>
                </div>
                {confirmingOccurrence.type === "payment" && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Motorista:</span>
                    <span className="text-sm font-medium">
                      {(confirmingOccurrence.schedule as PaymentSchedule).carcontrol_drivers?.nome || "—"}
                    </span>
                  </div>
                )}
                {confirmingOccurrence.type === "parcela_seguro" && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tipo:</span>
                    <span className="text-sm font-medium capitalize">
                      {(confirmingOccurrence.schedule as ParcelaSeguroSchedule).tipo}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Recorrência:</span>
                  <span className="text-xs font-medium">
                    {recurrenceLabel(
                      confirmingOccurrence.schedule.tipo_recorrencia,
                      confirmingOccurrence.schedule.dia_mes,
                      confirmingOccurrence.schedule.dia_semana
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Abatimento */}
            {confirmingOccurrence && (
              <div className="neu-inset p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valor Original:</span>
                  <span className="font-display font-bold">
                    {fmtBRL(confirmingOccurrence.schedule.valor)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Abatimento:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <Input
                      id="abatimento"
                      type="number"
                      min={0}
                      max={confirmingOccurrence.schedule.valor}
                      step={0.01}
                      className="w-28 h-8 text-right bg-white"
                      value={confirmForm.abatimento ?? 0}
                      onChange={(e) =>
                        setConfirmForm((f) => ({
                          ...f,
                          abatimento: Math.max(0, Math.min(
                            confirmingOccurrence.schedule.valor,
                            parseFloat(e.target.value) || 0
                          )),
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-dashed">
                  <span className="text-sm font-semibold">Valor Final:</span>
                  <span className="font-display font-bold text-lg text-primary">
                    {fmtBRL(Math.max(0, confirmingOccurrence.schedule.valor - (confirmForm.abatimento ?? 0)))}
                  </span>
                </div>
              </div>
            )}

            {/* Formulário */}
            <div>
              <Label htmlFor="data_pagamento">Data do Pagamento *</Label>
              <Input
                id="data_pagamento"
                type="date"
                className="bg-white"
                value={confirmForm.data_pagamento}
                onChange={(e) =>
                  setConfirmForm((f) => ({ ...f, data_pagamento: e.target.value }))
                }
              />
              {/* Indicador visual quando a data de pagamento difere da data programada */}
              {confirmingOccurrence && confirmForm.data_pagamento && (() => {
                const diffDays = differenceInDays(
                  parseISO(confirmForm.data_pagamento),
                  confirmingOccurrence.date
                );
                if (diffDays === 0) {
                  return (
                    <p className="text-xs text-muted-foreground mt-1">
                      Pré-preenchido com a data da ocorrência, mas pode ser alterado se necessário
                    </p>
                  );
                }
                if (diffDays < 0) {
                  return (
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-blue-500 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1.5">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        Pagamento <strong>antecipado</strong> em {Math.abs(diffDays)} dia{Math.abs(diffDays) !== 1 ? "s" : ""} em relação à data programada
                      </span>
                    </div>
                  );
                }
                return (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      Pagamento <strong>atrasado</strong> em {diffDays} dia{diffDays !== 1 ? "s" : ""} em relação à data programada
                    </span>
                  </div>
                );
              })()}
            </div>

            <div>
              <Label htmlFor="metodo">Método de Pagamento *</Label>
              <Select
                value={confirmForm.metodo}
                onValueChange={(v) => setConfirmForm((f) => ({ ...f, metodo: v }))}
              >
                <SelectTrigger id="metodo" className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="debito">Débito</SelectItem>
                  <SelectItem value="credito">Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="observacoes">
                Observações {(confirmForm.abatimento ?? 0) > 0 ? "*" : "(opcional)"}
              </Label>
              <Textarea
                id="observacoes"
                className="bg-white resize-none"
                rows={3}
                placeholder={(confirmForm.abatimento ?? 0) > 0
                  ? "Informe o motivo do abatimento..."
                  : "Adicione observações sobre este pagamento..."
                }
                value={confirmForm.observacoes}
                onChange={(e) =>
                  setConfirmForm((f) => ({ ...f, observacoes: e.target.value }))
                }
              />
            </div>

            {/* Comprovante PDF */}
            <div>
              <Label htmlFor="comprovante">Comprovante (PDF)</Label>
              <Input
                id="comprovante"
                type="file"
                accept="application/pdf"
                className="bg-white"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setConfirmForm((f) => ({ ...f, comprovante: file } as any));
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseConfirm} disabled={isConfirming}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmPayment} disabled={isConfirming}>
              {isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmar Pagamento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
