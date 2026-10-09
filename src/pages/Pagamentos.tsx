import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { fmtBRL, fmtDate } from "@/lib/utils";
import { useCountAnimation } from "@/hooks/useCountAnimation";
import {
  CheckCircle2, Clock, AlertCircle, Plus, Loader2, Edit3, Trash2,
  Paperclip, FileText, X, CalendarDays, Repeat2, ToggleLeft, ToggleRight,
  Receipt, User, Car,
} from "lucide-react";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { paymentService } from "@/integrations/supabase/services/paymentService";
import { getErrorMessage } from "@/integrations/supabase/services/errors";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ── Types ────────────────────────────────────────────────────────────────────
type Payment  = Tables<"carcontrol_payments">;
type Schedule = Tables<"carcontrol_payment_schedules">;
type Driver   = Tables<"carcontrol_drivers">;
type Vehicle  = Tables<"carcontrol_vehicles">;

type PaymentForm = {
  driver_id: string;
  vehicle_id: string;
  data: string;
  valor: string;
  metodo: string;
  status: string;
  comprovante_url: string | null;
};

type ScheduleForm = {
  driver_id: string;
  vehicle_id: string;
  descricao: string;
  valor: string;
  metodo: string;
  tipo_recorrencia: "mensal" | "semanal";
  dia_mes: string;
  dia_semana: string;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
};

// ── Constants ────────────────────────────────────────────────────────────────
const METODOS     = ["pix", "dinheiro", "transferencia", "debito", "credito"];
const STATUS_OPTS = ["pago", "pendente", "atrasado"];
const DIAS_SEMANA = [
  "Domingo", "Segunda-feira", "Terca-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sabado",
];
const DIAS_MES = Array.from({ length: 31 }, (_, i) => i + 1);

const EMPTY_PAYMENT: PaymentForm = {
  driver_id: "",
  vehicle_id: "",
  data: new Date().toISOString().slice(0, 10),
  valor: "",
  metodo: "pix",
  status: "pago",
  comprovante_url: null,
};

const EMPTY_SCHEDULE: ScheduleForm = {
  driver_id: "",
  vehicle_id: "",
  descricao: "",
  valor: "",
  metodo: "pix",
  tipo_recorrencia: "mensal",
  dia_mes: "1",
  dia_semana: "1",
  data_inicio: new Date().toISOString().slice(0, 10),
  data_fim: "",
  ativo: true,
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const paymentMeta: Record<string, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  pago:     { label: "Pago",     icon: CheckCircle2, cls: "text-success" },
  pendente: { label: "Pendente", icon: Clock,         cls: "text-warning" },
  atrasado: { label: "Atrasado", icon: AlertCircle,   cls: "text-danger"  },
};

const statusRowCls: Record<string, string> = {
  pago:     "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  pendente: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  atrasado: "bg-red-500/10 text-red-500 border border-red-500/20",
};

function recurrenceLabel(s: Schedule): string {
  if (s.tipo_recorrencia === "semanal") {
    const dia = DIAS_SEMANA[s.dia_semana ?? 1] ?? "Segunda-feira";
    return `Toda ${dia.toLowerCase()}`;
  }
  return `Todo dia ${s.dia_mes ?? 1}`;
}

// ── Component ────────────────────────────────────────────────────────────────
const Pagamentos = () => {
  const { session } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Lancamentos Manuais ──────────────────────────────────────────────────
  const { data: payments, loading: loadingPayments, error: paymentsError } = useRealtimeData("carcontrol_payments", {
    select: "*, carcontrol_drivers!driver_id(*), carcontrol_vehicles!vehicle_id(*)",
    order: { column: "data", ascending: false },
  });

  const [detailPayment, setDetailPayment]           = useState<any | null>(null);
  const [isPaymentOpen, setIsPaymentOpen]           = useState(false);
  const [editingPaymentId, setEditingPaymentId]     = useState<string | null>(null);
  const [paymentForm, setPaymentForm]               = useState<PaymentForm>(EMPTY_PAYMENT);
  const [isSavingPayment, setIsSavingPayment]       = useState(false);
  const [deletingPaymentId, setDeletingPaymentId]   = useState<string | null>(null);
  const [comprovanteFile, setComprovanteFile]       = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile]       = useState(false);

  // ── Programacao ──────────────────────────────────────────────────────────
  const { data: schedules, loading: loadingSchedules, error: schedulesError } = useRealtimeData(
    "carcontrol_payment_schedules",
    {
      select: "*, carcontrol_drivers!driver_id(*), carcontrol_vehicles!vehicle_id(*)",
      order: { column: "created_at", ascending: false },
    },
  );

  const [isScheduleOpen, setIsScheduleOpen]           = useState(false);
  const [editingScheduleId, setEditingScheduleId]     = useState<string | null>(null);
  const [scheduleForm, setScheduleForm]               = useState<ScheduleForm>(EMPTY_SCHEDULE);
  const [isSavingSchedule, setIsSavingSchedule]       = useState(false);
  const [deletingScheduleId, setDeletingScheduleId]   = useState<string | null>(null);

  // ── Shared (selects) — realtime ─────────────────────────────────────────
  const { data: drivers, error: driversError } = useRealtimeData("carcontrol_drivers", {
    select: "id, nome, veiculo_id",
    order: { column: "nome", ascending: true },
  });

  const { data: vehicles, error: vehiclesError } = useRealtimeData("carcontrol_vehicles", {
    select: "id, modelo, placa",
    order: { column: "modelo", ascending: true },
  });

  // ── KPI ──────────────────────────────────────────────────────────────────
  const total    = payments.filter((p) => p.status === "pago").reduce((s, p) => s + (p.valor || 0), 0);
  const aReceber = payments.filter((p) => p.status !== "pago").reduce((s, p) => s + (p.valor || 0), 0);
  const atrasos  = payments.filter((p) => p.status === "atrasado").length;

  // Recebimentos confirmados via programação: APENAS os que têm schedule_date
  // (vieram de uma programação), ordenados por schedule_date desc
  const confirmedPayments = (payments as any[])
    .filter((p) => p.status === "pago" && p.schedule_date)
    .sort((a, b) => {
      if (!a.schedule_date || !b.schedule_date) return 0;
      return new Date(b.schedule_date).getTime() - new Date(a.schedule_date).getTime();
    });

  const totalRef    = useCountAnimation(total,    2, 0,     true);
  const aReceberRef = useCountAnimation(aReceber, 2, 0.075, true);
  const atrasosRef  = useCountAnimation(atrasos,  2, 0.15);

  // ── Payment handlers ─────────────────────────────────────────────────────
  const handlePaymentDriverChange = (driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    setPaymentForm((f) => ({
      ...f,
      driver_id:  driverId,
      vehicle_id: driver?.veiculo_id ?? f.vehicle_id,
    }));
  };

  const openCreatePayment = () => {
    setEditingPaymentId(null);
    setPaymentForm(EMPTY_PAYMENT);
    setComprovanteFile(null);
    setIsPaymentOpen(true);
  };

  const openEditPayment = (p: any) => {
    setEditingPaymentId(p.id);
    setPaymentForm({
      driver_id:       p.driver_id        ?? "",
      vehicle_id:      p.vehicle_id       ?? "",
      data:            p.data             ?? new Date().toISOString().slice(0, 10),
      valor:           String(p.valor     ?? ""),
      metodo:          p.metodo           ?? "pix",
      status:          p.status           ?? "pago",
      comprovante_url: p.comprovante_url  ?? null,
    });
    setComprovanteFile(null);
    setIsPaymentOpen(true);
  };

  const uploadComprovante = async (paymentId: string, file: File): Promise<string | null> => {
    setIsUploadingFile(true);
    try {
      const ext  = file.name.split(".").pop() ?? "pdf";
      const path = `${paymentId}/comprovante.${ext}`;
      const { error } = await supabase.storage
        .from("payment-receipts")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      return path;
    } catch (err: any) {
      toast.error(`Erro ao enviar comprovante: ${err.message}`);
      return null;
    } finally {
      setIsUploadingFile(false);
    }
  };

  const getComprovanteUrl = async (pathOrUrl: string): Promise<string> => {
    const marker = "/payment-receipts/";
    const markerIndex = pathOrUrl.indexOf(marker);
    const path = markerIndex >= 0
      ? decodeURIComponent(pathOrUrl.slice(markerIndex + marker.length).split("?")[0])
      : pathOrUrl;
    const { data, error } = await supabase.storage
      .from("payment-receipts")
      .createSignedUrl(path, 60 * 60);
    if (error || !data) throw error;
    return data.signedUrl;
  };

  const handleSavePayment = async () => {
    if (!paymentForm.driver_id)                       return toast.error("Selecione o motorista.");
    if (!paymentForm.data)                            return toast.error("Informe a data.");
    const valor = parseFloat(paymentForm.valor.replace(",", "."));
    if (isNaN(valor) || valor <= 0)                   return toast.error("Informe um valor valido.");

    setIsSavingPayment(true);
    try {
      const payload: TablesInsert<"carcontrol_payments"> = {
        driver_id:       paymentForm.driver_id  || null,
        vehicle_id:      paymentForm.vehicle_id || null,
        data:            paymentForm.data,
        valor,
        metodo:          paymentForm.metodo,
        status:          paymentForm.status,
        user_id:         session?.user.id ?? null,
        comprovante_url: paymentForm.comprovante_url ?? null,
      };

      if (editingPaymentId) {
        if (comprovanteFile) {
          const storagePath = await uploadComprovante(editingPaymentId, comprovanteFile);
          if (storagePath) payload.comprovante_url = storagePath;
        }
        await paymentService.update(editingPaymentId, payload);
        toast.success("Pagamento atualizado!");
      } else {
        const inserted = await paymentService.create(payload);
        if (comprovanteFile && inserted?.id) {
          const storagePath = await uploadComprovante(inserted.id, comprovanteFile);
          if (storagePath) {
            await paymentService.update(inserted.id, { comprovante_url: storagePath });
          }
        }
        toast.success("Pagamento registrado!");
      }
      setIsPaymentOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Erro ao salvar pagamento."));
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    setDeletingPaymentId(id);
    try {
      await paymentService.remove(id);
      toast.success("Pagamento excluido.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Erro ao excluir pagamento."));
    } finally {
      setDeletingPaymentId(null);
    }
  };

  // ── Schedule handlers ────────────────────────────────────────────────────
  const handleScheduleDriverChange = (driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    setScheduleForm((f) => ({
      ...f,
      driver_id:  driverId,
      vehicle_id: driver?.veiculo_id ?? f.vehicle_id,
    }));
  };

  const openCreateSchedule = () => {
    setEditingScheduleId(null);
    setScheduleForm(EMPTY_SCHEDULE);
    setIsScheduleOpen(true);
  };

  const openEditSchedule = (s: any) => {
    setEditingScheduleId(s.id);
    setScheduleForm({
      driver_id:        s.driver_id         ?? "",
      vehicle_id:       s.vehicle_id        ?? "",
      descricao:        s.descricao         ?? "",
      valor:            String(s.valor      ?? ""),
      metodo:           s.metodo            ?? "pix",
      tipo_recorrencia: s.tipo_recorrencia === "semanal" ? "semanal" : "mensal",
      dia_mes:          String(s.dia_mes    ?? 1),
      dia_semana:       String(s.dia_semana ?? 1),
      data_inicio:      s.data_inicio       ?? new Date().toISOString().slice(0, 10),
      data_fim:         s.data_fim          ?? "",
      ativo:            s.ativo             ?? true,
    });
    setIsScheduleOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!scheduleForm.driver_id)              return toast.error("Selecione o motorista.");
    if (!scheduleForm.data_inicio)            return toast.error("Informe a data de inicio.");
    const valor = parseFloat(scheduleForm.valor.replace(",", "."));
    if (isNaN(valor) || valor <= 0)           return toast.error("Informe um valor valido.");

    setIsSavingSchedule(true);
    try {
      const payload: TablesInsert<"carcontrol_payment_schedules"> = {
        driver_id:        scheduleForm.driver_id  || null,
        vehicle_id:       scheduleForm.vehicle_id || null,
        descricao:        scheduleForm.descricao  || null,
        valor,
        metodo:           scheduleForm.metodo,
        tipo_recorrencia: scheduleForm.tipo_recorrencia,
        dia_mes:    scheduleForm.tipo_recorrencia === "mensal"  ? parseInt(scheduleForm.dia_mes)    : null,
        dia_semana: scheduleForm.tipo_recorrencia === "semanal" ? parseInt(scheduleForm.dia_semana) : null,
        data_inicio: scheduleForm.data_inicio,
        data_fim:    scheduleForm.data_fim || null,
        ativo:       scheduleForm.ativo,
        user_id:     session?.user.id ?? null,
      };

      if (editingScheduleId) {
        const { error } = await supabase
          .from("carcontrol_payment_schedules")
          .update(payload)
          .eq("id", editingScheduleId);
        if (error) throw error;
        toast.success("Programacao atualizada!");
      } else {
        const { error } = await supabase
          .from("carcontrol_payment_schedules")
          .insert(payload);
        if (error) throw error;
        toast.success("Programacao criada!");
      }
      setIsScheduleOpen(false);
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao salvar programacao.");
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    setDeletingScheduleId(id);
    try {
      const { error } = await supabase
        .from("carcontrol_payment_schedules")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Programacao excluida.");
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao excluir programacao.");
    } finally {
      setDeletingScheduleId(null);
    }
  };

  const toggleScheduleAtivo = async (s: Schedule) => {
    try {
      const { error } = await supabase
        .from("carcontrol_payment_schedules")
        .update({ ativo: !s.ativo })
        .eq("id", s.id);
      if (error) throw error;
      toast.success(s.ativo ? "Programacao pausada." : "Programacao ativada.");
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao alterar status.");
    }
  };

  // ── Error & Loading States ───────────────────────────────────────────────
  const hasError = paymentsError || schedulesError || driversError || vehiclesError;
  const errorMessage = paymentsError || schedulesError || driversError || vehiclesError;

  if (loadingPayments) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (hasError) {
    return (
      <AppShell>
        <Topbar title="Pagamentos" subtitle="Gestao completa dos recebimentos dos veiculos alugados!" helpPath="/ajuda/gestao/pagamentos" />
        <div className="neu p-6 border-l-4 border-red-500">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-700">Erro ao carregar dados</h3>
              <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
              <button
                className="mt-3 px-4 py-2 text-sm font-medium bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                onClick={() => window.location.reload()}
              >
                Recarregar página
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Topbar title="Recebimentos" subtitle="Gestao completa dos recebimentos dos veiculos alugados!" helpPath="/ajuda/gestao/pagamentos" />
 
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 mb-6 md:mb-8">
        <div className="col-span-2 md:col-span-1 neu p-4 md:p-6 animate-blur-in transition-shadow duration-200 shadow-sm shadow-gray-200 hover:shadow-md hover:shadow-gray-400/40">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total recebido</div>
          <div className="font-display text-2xl md:text-3xl font-bold mt-2 tabular-nums">
            R$ <span ref={totalRef}>0,00</span>
          </div>
        </div>
        <div className="neu p-4 md:p-6 animate-blur-in delay-75 transition-shadow duration-200 shadow-sm shadow-gray-200 hover:shadow-md hover:shadow-gray-400/40 min-w-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">A receber</div>
          <div className="font-display text-lg md:text-3xl font-bold mt-2 text-warning tabular-nums truncate">
            R$ <span ref={aReceberRef}>0,00</span>
          </div>
        </div>
        <div className="neu p-4 md:p-6 animate-blur-in delay-150 transition-shadow duration-200 shadow-sm shadow-gray-200 hover:shadow-md hover:shadow-gray-400/40 min-w-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Atrasos</div>
          <div className="font-display text-lg md:text-3xl font-bold mt-2 text-danger tabular-nums">
            <span ref={atrasosRef}>0</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={searchParams.get("tab") || "programacao"} onValueChange={(v) => setSearchParams({ tab: v })} className="animate-blur-in delay-300">
        <TabsList className="mb-4 md:mb-6 neu px-1 py-1 h-auto gap-1 bg-transparent grid w-full grid-cols-3 sm:inline-flex sm:w-auto">
          <TabsTrigger
            value="programacao"
            className="flex items-center gap-1.5 sm:gap-2 rounded-2xl px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <CalendarDays className="hidden sm:block w-4 h-4 shrink-0" />
            Programação
          </TabsTrigger>
          <TabsTrigger
            value="lancamentos"
            className="flex items-center gap-1.5 sm:gap-2 rounded-2xl px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Repeat2 className="hidden sm:block w-4 h-4 shrink-0" />
            <span className="sm:hidden">Manuais</span>
            <span className="hidden sm:inline">Lançamentos Manuais</span>
          </TabsTrigger>
          <TabsTrigger
            value="confirmados"
            className="flex items-center gap-1.5 sm:gap-2 rounded-2xl px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Receipt className="hidden sm:block w-4 h-4 shrink-0" />
            <span className="sm:hidden">Confirmados</span>
            <span className="hidden sm:inline">Recebimentos Confirmados</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Programacao */}
        <TabsContent value="programacao">
          <div className="neu p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
              <div className="min-w-0">
                <h2 className="font-display text-lg sm:text-xl font-bold">Programação de pagamentos</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Recorrências mensais (dia do mês) ou semanais (dia da semana) configuradas automaticamente.
                </p>
              </div>
              <button
                className="neu-interactive px-4 py-2.5 sm:py-2 text-sm font-medium flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
                onClick={openCreateSchedule}
              >
                <Plus className="w-4 h-4" /> Programar
              </button>
            </div>

            {loadingSchedules ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {(schedules as any[]).map((s: any) => {
                  const driver = s.carcontrol_drivers;
                  const veh    = s.carcontrol_vehicles;
                  return (
                    <div key={s.id} className="neu-inset px-3 py-3 sm:px-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:flex-nowrap sm:gap-4">
                      <div className={`neu-sm w-10 h-10 grid place-items-center flex-shrink-0 ${s.ativo ? "text-primary" : "text-muted-foreground"}`}>
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate">{driver?.nome ?? "..."}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {veh ? `${veh.modelo} . ${veh.placa} . ` : ""}
                          {recurrenceLabel(s as Schedule)}
                          {s.descricao ? ` . ${s.descricao}` : ""}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-display font-bold">{fmtBRL(s.valor)}</div>
                        <div className="text-xs text-muted-foreground capitalize">{s.metodo}</div>
                      </div>
                      <div className="order-last basis-full h-0 sm:hidden" aria-hidden />
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium order-last sm:order-none inline-flex ${s.ativo ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {s.ativo ? "Ativa" : "Pausada"}
                      </span>
                      <div className="flex items-center gap-2 sm:gap-1.5 flex-shrink-0 order-last sm:order-none ml-auto sm:ml-0 [&_button]:h-9 [&_button]:w-9 sm:[&_button]:h-8 sm:[&_button]:w-8">
                        <Button
                          size="sm" variant="outline"
                          className={`h-8 w-8 p-0 ${s.ativo ? "text-emerald-600 border-emerald-200 hover:bg-emerald-50" : "text-gray-400 border-gray-200 hover:bg-gray-50"}`}
                          title={s.ativo ? "Pausar" : "Ativar"}
                          onClick={() => toggleScheduleAtivo(s as Schedule)}
                        >
                          {s.ativo ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => openEditSchedule(s)}>
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm" variant="destructive" className="h-8 w-8 p-0"
                          disabled={deletingScheduleId === s.id}
                          onClick={() => handleDeleteSchedule(s.id)}
                        >
                          {deletingScheduleId === s.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {(schedules as any[]).length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">Nenhuma programacao cadastrada</div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Lancamentos Manuais */}
        <TabsContent value="lancamentos">
          <div className="neu p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
              <h2 className="font-display text-lg sm:text-xl font-bold">Histórico de pagamentos</h2>
              <button
                className="neu-interactive px-4 py-2.5 sm:py-2 text-sm font-medium flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
                onClick={openCreatePayment}
              >
                <Plus className="w-4 h-4" /> Registrar
              </button>
            </div>
            <div className="space-y-3">
              {(payments as any[]).map((p: any) => {
                const driver = p.carcontrol_drivers;
                const veh    = p.carcontrol_vehicles;
                const m      = paymentMeta[p.status] ?? paymentMeta.pendente;
                const Icon   = m.icon;
                return (
                  <div key={p.id} className="neu-inset px-3 py-3 sm:px-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:flex-nowrap sm:gap-4">
                    <div className={`neu-sm w-10 h-10 grid place-items-center flex-shrink-0 ${m.cls}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{driver?.nome ?? "..."}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {veh ? `${veh.modelo} . ${veh.placa} . ` : ""}{p.metodo}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-display font-bold">{fmtBRL(p.valor)}</div>
                      <div className="text-xs text-muted-foreground">{p.data ? fmtDate(p.data) : "..."}</div>
                    </div>
                    <div className="order-last basis-full h-0 sm:hidden" aria-hidden />
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium order-last sm:order-none inline-flex ${statusRowCls[p.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {m.label}
                    </span>
                    <div className="flex items-center gap-2 sm:gap-1.5 flex-shrink-0 order-last sm:order-none ml-auto sm:ml-0 [&_button]:h-9 [&_button]:w-9 sm:[&_button]:h-8 sm:[&_button]:w-8">
                      {p.comprovante_url && (
                        <Button
                          size="sm" variant="outline"
                          className="h-8 w-8 p-0 text-blue-600 border-blue-200 hover:bg-blue-50"
                          title="Ver comprovante"
                          onClick={async () => {
                            try {
                              const url = await getComprovanteUrl(p.comprovante_url);
                              window.open(url, "_blank", "noopener,noreferrer");
                            } catch {
                              toast.error("Nao foi possivel abrir o comprovante.");
                            }
                          }}
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => openEditPayment(p)}>
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm" variant="destructive" className="h-8 w-8 p-0"
                        disabled={deletingPaymentId === p.id}
                        onClick={() => handleDeletePayment(p.id)}
                      >
                        {deletingPaymentId === p.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                );
              })}
              {payments.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">Nenhum pagamento registrado</div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab: Recebimentos Confirmados */}
        <TabsContent value="confirmados">
          <div className="neu p-4 sm:p-6">
            <div className="mb-5">
              <h2 className="font-display text-lg sm:text-xl font-bold flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                Recebimentos Confirmados
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Recebimentos de aluguel confirmados via programação de pagamentos.
              </p>
            </div>

            {/* Resumo */}
            {confirmedPayments.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
                <div className="neu-inset px-4 py-3 rounded-xl">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Total confirmado</div>
                  <div className="font-display text-xl font-bold text-emerald-600 mt-1">
                    {fmtBRL(confirmedPayments.reduce((s, p: any) => s + (p.valor || 0), 0))}
                  </div>
                </div>
                <div className="neu-inset px-4 py-3 rounded-xl">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Qtd. confirmados</div>
                  <div className="font-display text-xl font-bold mt-1">
                    {confirmedPayments.length}
                  </div>
                </div>
                <div className="neu-inset px-4 py-3 rounded-xl col-span-2 md:col-span-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Último confirmado</div>
                  <div className="font-display text-sm font-bold mt-1">
                    {confirmedPayments[0]
                      ? fmtDate((confirmedPayments[0] as any).schedule_date || (confirmedPayments[0] as any).data)
                      : "—"}
                  </div>
                </div>
              </div>
            )}

            {loadingPayments ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : confirmedPayments.length === 0 ? (
              <div className="text-center py-14 text-muted-foreground">
                <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Nenhum recebimento confirmado ainda</p>
                <p className="text-xs mt-1">
                  Confirme pagamentos na aba "Programação" do Dashboard para vê-los aqui.
                </p>
              </div>
            ) : (
              <>
              <ul className="md:hidden space-y-3">
                {(confirmedPayments as any[]).map((p: any) => {
                  const driver = p.carcontrol_drivers;
                  const veh    = p.carcontrol_vehicles;
                  return (
                    <li key={p.id} className="neu-inset p-3">
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => setDetailPayment(p)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{driver?.nome ?? "—"}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {veh ? `${veh.modelo} · ${veh.placa}` : "Sem veículo"}
                            </div>
                          </div>
                          <span className="font-display font-bold text-emerald-600 tabular-nums shrink-0">
                            {fmtBRL(p.valor)}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="font-mono">
                            {p.schedule_date ? fmtDate(p.schedule_date) : (p.data ? fmtDate(p.data) : "—")}
                          </span>
                          {p.schedule_date && p.data && p.schedule_date !== p.data && (
                            <span>Pago em {fmtDate(p.data)}</span>
                          )}
                          <span className="capitalize">{p.metodo}</span>
                        </div>
                      </button>
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          Confirmado
                        </span>
                        <div className="flex items-center gap-2">
                          {p.comprovante_url && (
                            <Button
                              size="sm" variant="outline"
                              className="h-9 w-9 p-0 text-blue-600 border-blue-200 hover:bg-blue-50"
                              aria-label="Ver comprovante"
                              onClick={async () => {
                                try {
                                  const url = await getComprovanteUrl(p.comprovante_url);
                                  window.open(url, "_blank", "noopener,noreferrer");
                                } catch {
                                  toast.error("Nao foi possivel abrir o comprovante.");
                                }
                              }}
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm" variant="destructive" className="h-9 w-9 p-0"
                            disabled={deletingPaymentId === p.id}
                            aria-label="Excluir confirmação"
                            onClick={() => handleDeletePayment(p.id)}
                          >
                            {deletingPaymentId === p.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="hidden md:block overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Motorista</TableHead>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(confirmedPayments as any[]).map((p: any) => {
                      const driver = p.carcontrol_drivers;
                      const veh    = p.carcontrol_vehicles;
                      return (
                        <TableRow
                        key={p.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setDetailPayment(p)}
                      >
                          <TableCell>
                            <div>
                              <span className="font-mono text-sm font-semibold">
                                {p.schedule_date ? fmtDate(p.schedule_date) : (p.data ? fmtDate(p.data) : "—")}
                              </span>
                              {p.schedule_date && p.data && p.schedule_date !== p.data && (
                                <div className="text-xs text-muted-foreground">
                                  Pago em {fmtDate(p.data)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="neu-sm w-7 h-7 grid place-items-center flex-shrink-0">
                                <User className="w-3.5 h-3.5 text-primary" />
                              </div>
                              <span className="text-sm font-medium">{driver?.nome ?? "—"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {veh ? (
                              <div className="flex items-center gap-2">
                                <div className="neu-sm w-7 h-7 grid place-items-center flex-shrink-0">
                                  <Car className="w-3.5 h-3.5 text-muted-foreground" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium">{veh.modelo}</div>
                                  <div className="text-xs text-muted-foreground font-mono">{veh.placa}</div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm capitalize">{p.metodo}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-display font-bold text-emerald-600">
                              {fmtBRL(p.valor)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="w-3 h-3" />
                              Confirmado
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {p.comprovante_url && (
                                <Button
                                  size="sm" variant="outline"
                                  className="h-8 w-8 p-0 text-blue-600 border-blue-200 hover:bg-blue-50"
                                  title="Ver comprovante"
                                  onClick={async () => {
                                    try {
                                      const url = await getComprovanteUrl(p.comprovante_url);
                                      window.open(url, "_blank", "noopener,noreferrer");
                                    } catch {
                                      toast.error("Nao foi possivel abrir o comprovante.");
                                    }
                                  }}
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              <Button
                                size="sm" variant="destructive" className="h-8 w-8 p-0"
                                disabled={deletingPaymentId === p.id}
                                title="Excluir confirmação"
                                onClick={() => handleDeletePayment(p.id)}
                              >
                                {deletingPaymentId === p.id
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : <Trash2 className="w-3.5 h-3.5" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog: Programacao */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="max-h-[88vh] w-full overflow-hidden sm:max-h-[92vh] max-w-[44rem]">
          <DialogHeader>
            <DialogTitle>{editingScheduleId ? "Editar programacao" : "Nova programacao"}</DialogTitle>
            <DialogDescription>
              {editingScheduleId
                ? "Atualize os dados da recorrencia."
                : "Configure um pagamento recorrente mensal ou semanal."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="sm:max-h-[calc(88vh-12rem)] overflow-hidden rounded-3xl border border-primary/10 bg-background/90 p-1 shadow-sm">
            <div className="grid gap-4 p-3">
              <div>
                <Label htmlFor="sched-driver">Motorista *</Label>
                <Select value={scheduleForm.driver_id} onValueChange={handleScheduleDriverChange}>
                  <SelectTrigger id="sched-driver" className="bg-white">
                    <SelectValue placeholder="Selecione o motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sched-vehicle">Veiculo</Label>
                <Select
                  value={scheduleForm.vehicle_id}
                  onValueChange={(v) => setScheduleForm((f) => ({ ...f, vehicle_id: v }))}
                >
                  <SelectTrigger id="sched-vehicle" className="bg-white">
                    <SelectValue placeholder="Selecione o veiculo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.modelo} - {v.placa}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sched-desc">Descricao (opcional)</Label>
                <Select
                  value={scheduleForm.descricao}
                  onValueChange={(v) => setScheduleForm((f) => ({ ...f, descricao: v }))}
                >
                  <SelectTrigger id="sched-desc" className="bg-white">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aluguel">Aluguel</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sched-valor">Valor (R$) *</Label>
                  <Input
                    id="sched-valor"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    className="bg-white"
                    value={scheduleForm.valor}
                    onChange={(e) => setScheduleForm((f) => ({ ...f, valor: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="sched-metodo">Metodo</Label>
                  <Select
                    value={scheduleForm.metodo}
                    onValueChange={(v) => setScheduleForm((f) => ({ ...f, metodo: v }))}
                  >
                    <SelectTrigger id="sched-metodo" className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {METODOS.map((m) => (
                        <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="sched-tipo">Tipo de recorrencia</Label>
                <Select
                  value={scheduleForm.tipo_recorrencia}
                  onValueChange={(v) =>
                    setScheduleForm((f) => ({ ...f, tipo_recorrencia: v as "mensal" | "semanal" }))
                  }
                >
                  <SelectTrigger id="sched-tipo" className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal - todo dia X do mes</SelectItem>
                    <SelectItem value="semanal">Semanal - todo X-feira</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {scheduleForm.tipo_recorrencia === "mensal" && (
                <div>
                  <Label htmlFor="sched-diames">Dia do mes *</Label>
                  <Select
                    value={scheduleForm.dia_mes}
                    onValueChange={(v) => setScheduleForm((f) => ({ ...f, dia_mes: v }))}
                  >
                    <SelectTrigger id="sched-diames" className="bg-white">
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIAS_MES.map((d) => (
                        <SelectItem key={d} value={String(d)}>Dia {d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {scheduleForm.tipo_recorrencia === "semanal" && (
                <div>
                  <Label htmlFor="sched-diasemana">Dia da semana *</Label>
                  <Select
                    value={scheduleForm.dia_semana}
                    onValueChange={(v) => setScheduleForm((f) => ({ ...f, dia_semana: v }))}
                  >
                    <SelectTrigger id="sched-diasemana" className="bg-white">
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIAS_SEMANA.map((dia, idx) => (
                        <SelectItem key={idx} value={String(idx)}>{dia}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sched-inicio">Data de inicio *</Label>
                  <Input
                    id="sched-inicio"
                    type="date"
                    className="bg-white"
                    value={scheduleForm.data_inicio}
                    onChange={(e) => setScheduleForm((f) => ({ ...f, data_inicio: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="sched-fim">Data de encerramento</Label>
                  <Input
                    id="sched-fim"
                    type="date"
                    className="bg-white"
                    value={scheduleForm.data_fim}
                    onChange={(e) => setScheduleForm((f) => ({ ...f, data_fim: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-white px-4 py-3">
                <div>
                  <div className="text-sm font-medium">Programacao ativa</div>
                  <div className="text-xs text-muted-foreground">
                    Quando inativa, a recorrencia fica pausada e nao gera cobrancas.
                  </div>
                </div>
                <Switch
                  checked={scheduleForm.ativo}
                  onCheckedChange={(v) => setScheduleForm((f) => ({ ...f, ativo: v }))}
                  aria-label="Ativar ou pausar programacao"
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleOpen(false)} disabled={isSavingSchedule}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSchedule} disabled={isSavingSchedule}>
              {isSavingSchedule && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingScheduleId ? "Salvar alteracoes" : "Criar programacao"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Lancamento Manual */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-h-[83vh] w-full overflow-hidden sm:max-h-[90vh] max-w-[42rem]">
          <DialogHeader>
            <DialogTitle>{editingPaymentId ? "Editar pagamento" : "Registrar pagamento"}</DialogTitle>
            <DialogDescription>
              {editingPaymentId
                ? "Atualize os dados do pagamento e salve as alteracoes."
                : "Preencha os campos para registrar um novo pagamento."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="sm:max-h-[calc(83vh-11rem)] overflow-hidden rounded-3xl border border-primary/10 bg-background/90 p-1 shadow-sm">
            <div className="grid gap-4 p-3">
              <div>
                <Label htmlFor="pay-driver">Motorista *</Label>
                <Select value={paymentForm.driver_id} onValueChange={handlePaymentDriverChange}>
                  <SelectTrigger id="pay-driver" className="bg-white">
                    <SelectValue placeholder="Selecione o motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pay-vehicle">Veiculo</Label>
                <Select
                  value={paymentForm.vehicle_id}
                  onValueChange={(v) => setPaymentForm((f) => ({ ...f, vehicle_id: v }))}
                >
                  <SelectTrigger id="pay-vehicle" className="bg-white">
                    <SelectValue placeholder="Selecione o veiculo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.modelo} - {v.placa}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pay-data">Data *</Label>
                  <Input
                    id="pay-data"
                    type="date"
                    className="bg-white"
                    value={paymentForm.data}
                    onChange={(e) => setPaymentForm((f) => ({ ...f, data: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="pay-valor">Valor (R$) *</Label>
                  <Input
                    id="pay-valor"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    className="bg-white"
                    value={paymentForm.valor}
                    onChange={(e) => setPaymentForm((f) => ({ ...f, valor: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pay-metodo">Metodo de pagamento</Label>
                  <Select
                    value={paymentForm.metodo}
                    onValueChange={(v) => setPaymentForm((f) => ({ ...f, metodo: v }))}
                  >
                    <SelectTrigger id="pay-metodo" className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {METODOS.map((m) => (
                        <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pay-status">Status</Label>
                  <Select
                    value={paymentForm.status}
                    onValueChange={(v) => setPaymentForm((f) => ({ ...f, status: v }))}
                  >
                    <SelectTrigger id="pay-status" className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTS.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="pay-comprovante">Comprovante de pagamento (PDF)</Label>
                {paymentForm.comprovante_url && !comprovanteFile ? (
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 truncate">Comprovante anexado</span>
                    <button
                      type="button"
                      className="rounded p-0.5 hover:bg-blue-100"
                      title="Remover comprovante"
                      onClick={() => setPaymentForm((f) => ({ ...f, comprovante_url: null }))}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : comprovanteFile ? (
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 truncate">{comprovanteFile.name}</span>
                    <button
                      type="button"
                      className="rounded p-0.5 hover:bg-emerald-100"
                      title="Remover arquivo selecionado"
                      onClick={() => setComprovanteFile(null)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="pay-comprovante"
                    className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-white px-3 py-3 text-sm text-muted-foreground transition hover:border-primary/60 hover:bg-primary/5"
                  >
                    <Paperclip className="w-4 h-4 flex-shrink-0" />
                    <span>Clique para anexar um PDF</span>
                    <Input
                      id="pay-comprovante"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        if (file && file.type !== "application/pdf") {
                          toast.error("Apenas arquivos PDF sao aceitos.");
                          return;
                        }
                        if (file && file.size > 10 * 1024 * 1024) {
                          toast.error("O arquivo nao pode ultrapassar 10 MB.");
                          return;
                        }
                        setComprovanteFile(file);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentOpen(false)}
              disabled={isSavingPayment || isUploadingFile}
            >
              Cancelar
            </Button>
            <Button onClick={handleSavePayment} disabled={isSavingPayment || isUploadingFile}>
              {(isSavingPayment || isUploadingFile) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingPaymentId ? "Salvar alteracoes" : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Detalhes do Recebimento */}
      <Dialog open={!!detailPayment} onOpenChange={(o) => { if (!o) setDetailPayment(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Recebimento</DialogTitle>
            <DialogDescription>
              Informações completas do pagamento programado
            </DialogDescription>
          </DialogHeader>

          {detailPayment && (() => {
            const p = detailPayment as any;
            const driver = p.carcontrol_drivers;
            const veh = p.carcontrol_vehicles;
            return (
              <div className="space-y-3 py-2">
                {/* Datas e Status */}
                <div className="neu-inset p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Data da Ocorrência:</span>
                    <span className="font-mono text-sm font-semibold">
                      {p.schedule_date ? fmtDate(p.schedule_date) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Data do Pagamento:</span>
                    <span className="font-mono text-sm font-semibold">
                      {p.data ? fmtDate(p.data) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" />
                      Confirmado
                    </span>
                  </div>
                </div>

                {/* Motorista e Veículo */}
                <div className="neu-inset p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Motorista:</span>
                    <span className="text-sm font-medium">{driver?.nome ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Veículo:</span>
                    <span className="text-sm font-medium">
                      {veh ? `${veh.modelo} - ${veh.placa}` : "—"}
                    </span>
                  </div>
                </div>

                {/* Valor, Método e Comprovante */}
                <div className="neu-inset p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Valor:</span>
                    <span className="font-display font-bold text-lg text-emerald-600">
                      {fmtBRL(p.valor)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Método:</span>
                    <span className="text-sm font-medium capitalize">{p.metodo}</span>
                  </div>
                  {p.comprovante_url && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Comprovante:</span>
                      <Button
                        size="sm" variant="outline"
                        className="h-8 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={async () => {
                          try {
                            const url = await getComprovanteUrl(p.comprovante_url);
                            window.open(url, "_blank", "noopener,noreferrer");
                          } catch {
                            toast.error("Não foi possível abrir o comprovante.");
                          }
                        }}
                      >
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                        Ver PDF
                      </Button>
                    </div>
                  )}
                </div>

                {/* Observações / Abatimento */}
                {p.observacoes && (
                  <div className="neu-inset p-3 space-y-1.5">
                    <span className="text-sm text-muted-foreground">Observações:</span>
                    <p className="text-sm font-medium whitespace-pre-wrap">{p.observacoes}</p>
                  </div>
                )}
              </div>
            );
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailPayment(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default Pagamentos;
