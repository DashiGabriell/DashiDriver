// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { fmtBRL } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Check, X, Clock, AlertCircle, DollarSign, Calendar, Car, Repeat2, Edit3, Trash2, Loader2, ToggleLeft, ToggleRight, CheckCircle2, Receipt } from "lucide-react";
import { format, parseISO, isPast, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ParcelaSeguroPayment {
  id: string;
  vehicle_id: string;
  tipo: "parcela" | "seguro";
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: "pendente" | "pago" | "atrasado" | "cancelado";
  metodo_pagamento: string | null;
  observacoes: string | null;
  created_at: string;
}

interface Vehicle {
  id: string;
  modelo: string;
  placa: string;
  marca: string;
  parcela: number;
  seguro: number;
  vencimento_parcela: string;
  vencimento_seguro: string;
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
  banco: string | null;
  observacoes: string | null;
  user_id: string;
  created_at: string | null;
  carcontrol_vehicles?: Vehicle | null;
}

const DIAS_SEMANA = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado",
];
const DIAS_MES = Array.from({ length: 31 }, (_, i) => i + 1);

const METODOS_PAGAMENTO = [
  "Débito Automático",
  "Boleto Bancário",
  "PIX",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Transferência Bancária",
  "Dinheiro",
  "Cheque",
];

// Função para calcular data fim baseada na data início, parcelas e recorrência
function calcularDataFim(
  dataInicio: string,
  parcelasRestantes: number,
  tipoRecorrencia: "mensal" | "semanal"
): string {
  if (!dataInicio || !parcelasRestantes || parcelasRestantes <= 0) {
    return "";
  }

  const data = new Date(dataInicio + "T00:00:00");
  
  if (tipoRecorrencia === "mensal") {
    // Adiciona meses
    data.setMonth(data.getMonth() + parcelasRestantes);
  } else {
    // Adiciona semanas
    data.setDate(data.getDate() + (parcelasRestantes * 7));
  }

  return data.toISOString().slice(0, 10);
}

export default function ParcelaSeguro() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  
  // ──── Estados de Pagamentos ────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<ParcelaSeguroPayment | null>(null);
  const [formData, setFormData] = useState({
    vehicle_id: "",
    tipo: "parcela" as "parcela" | "seguro",
    valor: "",
    data_vencimento: "",
    data_pagamento: "",
    status: "pendente" as "pendente" | "pago" | "atrasado" | "cancelado",
    metodo_pagamento: "",
    observacoes: "",
  });

  // ──── Estados de Programações ──────────────────────────────────────────
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ParcelaSeguroSchedule | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    vehicle_id: "",
    tipo: "parcela" as "parcela" | "seguro",
    valor: "",
    tipo_recorrencia: "mensal" as "mensal" | "semanal",
    dia_mes: "1",
    dia_semana: "1",
    data_inicio: new Date().toISOString().slice(0, 10),
    data_fim: "",
    ativo: true,
    metodo_pagamento: "",
    banco: "",
    observacoes: "",
    parcelas_restantes: "",
  });

  // Query para buscar veículos
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carcontrol_vehicles")
        .select("id, modelo, placa, marca, parcela, seguro, vencimento_parcela, vencimento_seguro")
        .eq("user_id", session?.user?.id)
        .order("modelo");

      if (error) throw error;
      return data as Vehicle[];
    },
    enabled: !!session?.user?.id,
  });

  // Query para buscar pagamentos
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["parcela-seguro-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carcontrol_parcela_seguro_payments")
        .select("*")
        .eq("user_id", session?.user?.id)
        .order("data_vencimento", { ascending: false });

      if (error) throw error;
      return data as ParcelaSeguroPayment[];
    },
    enabled: !!session?.user?.id,
  });

  // Hook real-time para programações
  const { data: schedules, loading: loadingSchedules } = useRealtimeData(
    "carcontrol_parcela_seguro_schedules",
    {
      select: "*, carcontrol_vehicles!vehicle_id(*)",
      order: { column: "created_at", ascending: false },
    },
  );

  // ──── Hook realtime para pagamentos confirmados via programação ──────────
  // Busca pagamentos com status "pago" que vieram de uma programação (têm schedule_date)
  const { data: confirmedSchedulePayments } = useRealtimeData(
    "carcontrol_parcela_seguro_payments",
    {
      select: "*, carcontrol_vehicles!vehicle_id(modelo, placa, marca)",
      filter: (q) => q.eq("status", "pago").not("schedule_date", "is", null),
      order: { column: "schedule_date", ascending: false },
    }
  );

  // Mutation para criar/atualizar pagamento
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        user_id: session?.user?.id,
        vehicle_id: data.vehicle_id,
        tipo: data.tipo,
        valor: parseFloat(data.valor),
        data_vencimento: data.data_vencimento,
        data_pagamento: data.data_pagamento || null,
        status: data.status,
        metodo_pagamento: data.metodo_pagamento || null,
        observacoes: data.observacoes || null,
      };

      if (editingPayment) {
        const { error } = await supabase
          .from("carcontrol_parcela_seguro_payments")
          .update(payload)
          .eq("id", editingPayment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("carcontrol_parcela_seguro_payments")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parcela-seguro-payments"] });
      toast.success(editingPayment ? "Pagamento atualizado!" : "Pagamento registrado!");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Erro ao salvar pagamento: " + error.message);
    },
  });

  // Mutation para deletar pagamento
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("carcontrol_parcela_seguro_payments")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parcela-seguro-payments"] });
      toast.success("Pagamento excluído!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir pagamento: " + error.message);
    },
  });

  // ──── Mutations e handlers de Programações ─────────────────────────────
  const saveScheduleMutation = useMutation({
    mutationFn: async () => {
      // Converter valor formatado (1.234,56) para número (1234.56)
      const valorNumerico = parseFloat(
        scheduleForm.valor.replace(/\./g, '').replace(',', '.')
      );

      const payload: TablesInsert<"carcontrol_parcela_seguro_schedules"> = {
        vehicle_id: scheduleForm.vehicle_id || null,
        tipo: scheduleForm.tipo,
        valor: valorNumerico,
        tipo_recorrencia: scheduleForm.tipo_recorrencia,
        dia_mes: scheduleForm.tipo_recorrencia === "mensal" ? parseInt(scheduleForm.dia_mes) : null,
        dia_semana: scheduleForm.tipo_recorrencia === "semanal" ? parseInt(scheduleForm.dia_semana) : null,
        data_inicio: scheduleForm.data_inicio,
        data_fim: scheduleForm.data_fim || null,
        ativo: scheduleForm.ativo,
        metodo_pagamento: scheduleForm.metodo_pagamento || null,
        banco: scheduleForm.banco || null,
        observacoes: scheduleForm.observacoes || null,
        user_id: session!.user.id,
        parcelas_restantes: scheduleForm.parcelas_restantes ? parseInt(scheduleForm.parcelas_restantes) : null,
      } as any;

      if (editingSchedule) {
        const { error } = await supabase
          .from("carcontrol_parcela_seguro_schedules")
          .update(payload)
          .eq("id", editingSchedule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("carcontrol_parcela_seguro_schedules")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingSchedule ? "Programação atualizada!" : "Programação criada!");
      handleCloseScheduleDialog();
    },
    onError: (err: Error) => {
      toast.error("Erro ao salvar programação: " + err.message);
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("carcontrol_parcela_seguro_schedules")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Programação excluída!");
    },
    onError: (err: Error) => {
      toast.error("Erro ao excluir: " + err.message);
    },
  });

  const toggleScheduleAtivo = async (schedule: ParcelaSeguroSchedule) => {
    const { error } = await supabase
      .from("carcontrol_parcela_seguro_schedules")
      .update({ ativo: !schedule.ativo })
      .eq("id", schedule.id);

    if (error) {
      toast.error("Erro ao alterar status: " + error.message);
    } else {
      toast.success(
        !schedule.ativo ? "Programação ativada!" : "Programação desativada!"
      );
    }
  };

  const handleOpenScheduleDialog = (schedule?: ParcelaSeguroSchedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      
      // Formatar valor para exibição (1234.56 -> 1.234,56)
      const valorFormatado = schedule.valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      
      setScheduleForm({
        vehicle_id: schedule.vehicle_id || "",
        tipo: schedule.tipo,
        valor: valorFormatado,
        tipo_recorrencia: schedule.tipo_recorrencia,
        dia_mes: (schedule.dia_mes || 1).toString(),
        dia_semana: (schedule.dia_semana || 1).toString(),
        data_inicio: schedule.data_inicio,
        data_fim: schedule.data_fim || "",
        ativo: schedule.ativo,
        metodo_pagamento: schedule.metodo_pagamento || "",
        banco: schedule.banco || "",
        observacoes: schedule.observacoes || "",
        parcelas_restantes: (schedule as any).parcelas_restantes?.toString() || "",
      });
    } else {
      setEditingSchedule(null);
      setScheduleForm({
        vehicle_id: "",
        tipo: "parcela",
        valor: "",
        tipo_recorrencia: "mensal",
        dia_mes: "1",
        dia_semana: "1",
        data_inicio: new Date().toISOString().slice(0, 10),
        data_fim: "",
        ativo: true,
        metodo_pagamento: "",
        banco: "",
        observacoes: "",
        parcelas_restantes: "",
      });
    }
    setScheduleDialogOpen(true);
  };

  const handleCloseScheduleDialog = () => {
    setScheduleDialogOpen(false);
    setEditingSchedule(null);
  };

  const recurrenceLabel = (schedule: ParcelaSeguroSchedule) => {
    if (schedule.tipo_recorrencia === "semanal" && schedule.dia_semana !== null) {
      return `Toda ${DIAS_SEMANA[schedule.dia_semana]}`;
    }
    if (schedule.tipo_recorrencia === "mensal" && schedule.dia_mes !== null) {
      return `Todo dia ${schedule.dia_mes}`;
    }
    return "—";
  };

  const handleOpenDialog = (payment?: ParcelaSeguroPayment) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({
        vehicle_id: payment.vehicle_id,
        tipo: payment.tipo,
        valor: payment.valor.toString(),
        data_vencimento: payment.data_vencimento,
        data_pagamento: payment.data_pagamento || "",
        status: payment.status,
        metodo_pagamento: payment.metodo_pagamento || "",
        observacoes: payment.observacoes || "",
      });
    } else {
      setEditingPayment(null);
      setFormData({
        vehicle_id: "",
        tipo: "parcela",
        valor: "",
        data_vencimento: "",
        data_pagamento: "",
        status: "pendente",
        metodo_pagamento: "",
        observacoes: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPayment(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicle_id || !formData.valor || !formData.data_vencimento) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleQuickAdd = (vehicleId: string, tipo: "parcela" | "seguro") => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    const valor = tipo === "parcela" ? vehicle.parcela : vehicle.seguro;
    const dataVencimento = tipo === "parcela" ? vehicle.vencimento_parcela : vehicle.vencimento_seguro;

    setFormData({
      vehicle_id: vehicleId,
      tipo,
      valor: valor.toString(),
      data_vencimento: dataVencimento,
      data_pagamento: "",
      status: "pendente",
      metodo_pagamento: "",
      observacoes: "",
    });
    setEditingPayment(null);
    setDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      pago: { variant: "default", icon: Check, label: "Pago" },
      pendente: { variant: "secondary", icon: Clock, label: "Pendente" },
      atrasado: { variant: "destructive", icon: AlertCircle, label: "Atrasado" },
      cancelado: { variant: "outline", icon: X, label: "Cancelado" },
    };

    const config = variants[status] || variants.pendente;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle ? `${vehicle.marca} ${vehicle.modelo} - ${vehicle.placa}` : "Veículo não encontrado";
  };

  const filterPayments = (tipo: "parcela" | "seguro") => {
    return payments.filter((p) => p.tipo === tipo);
  };

  const calculateTotals = (tipo: "parcela" | "seguro") => {
    const filtered = filterPayments(tipo);
    const total = filtered.reduce((acc, p) => acc + p.valor, 0);
    const pago = filtered.filter((p) => p.status === "pago").reduce((acc, p) => acc + p.valor, 0);
    const pendente = filtered.filter((p) => p.status === "pendente").reduce((acc, p) => acc + p.valor, 0);
    const atrasado = filtered.filter((p) => p.status === "atrasado").reduce((acc, p) => acc + p.valor, 0);

    return { total, pago, pendente, atrasado };
  };

  const renderPaymentTable = (tipo: "parcela" | "seguro") => {
    const filtered = filterPayments(tipo);
    const totals = calculateTotals(tipo);

    return (
      <div className="space-y-4">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "Total", value: totals.total, labelCls: "", valueCls: "" },
            { label: "Pago", value: totals.pago, labelCls: "text-green-600", valueCls: "text-green-600" },
            { label: "Pendente", value: totals.pendente, labelCls: "text-yellow-600", valueCls: "text-yellow-600" },
            { label: "Atrasado", value: totals.atrasado, labelCls: "text-red-600", valueCls: "text-danger" },
          ].map((kpi) => (
            <Card key={kpi.label} className="min-w-0">
              <CardHeader className="p-4 pb-4 md:p-6 md:pb-3">
                <CardDescription className={kpi.labelCls}>{kpi.label}</CardDescription>
                <CardTitle className={`text-base sm:text-xl md:text-2xl tabular-nums break-words ${kpi.valueCls}`}>
                  {fmtBRL(kpi.value)}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Botões de Ação Rápida */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg">Adicionar Pagamento Rápido</CardTitle>
            <CardDescription>
              Toque em um veículo para adicionar um pagamento de {tipo}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {vehicles.map((vehicle) => (
                <Button
                  key={vehicle.id}
                  variant="outline"
                  className="justify-start gap-2 h-11 sm:h-10 min-w-0"
                  onClick={() => handleQuickAdd(vehicle.id, tipo)}
                >
                  <Car className="h-4 w-4" />
                  <span className="truncate">
                    {vehicle.marca} {vehicle.modelo} - {vehicle.placa}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Pagamentos */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle>Histórico de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum pagamento de {tipo} registrado
              </div>
            ) : (
              <>
              <ul className="md:hidden space-y-3">
                {filtered.map((payment) => (
                  <li key={payment.id} className="rounded-xl border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 text-sm font-medium break-words">{getVehicleInfo(payment.vehicle_id)}</p>
                      <span className="shrink-0 font-semibold tabular-nums">{fmtBRL(payment.valor)}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                      {getStatusBadge(payment.status)}
                      <span>Vence {format(parseISO(payment.data_vencimento), "dd/MM/yyyy", { locale: ptBR })}</span>
                      {payment.data_pagamento && (
                        <span>Pago {format(parseISO(payment.data_pagamento), "dd/MM/yyyy", { locale: ptBR })}</span>
                      )}
                      {payment.metodo_pagamento && <span className="capitalize">{payment.metodo_pagamento}</span>}
                    </div>
                    <div className="mt-3 flex gap-2 border-t pt-3">
                      <Button variant="outline" size="sm" className="h-10 flex-1" onClick={() => handleOpenDialog(payment)}>
                        <Edit3 className="h-4 w-4" /> Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 flex-1 text-danger hover:text-danger hover:bg-danger/10"
                        onClick={() => {
                          if (confirm("Deseja realmente excluir este pagamento?")) {
                            deleteMutation.mutate(payment.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" /> Excluir
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {getVehicleInfo(payment.vehicle_id)}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">
                            {fmtBRL(payment.valor)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(parseISO(payment.data_vencimento), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          {payment.data_pagamento
                            ? format(parseISO(payment.data_pagamento), "dd/MM/yyyy", { locale: ptBR })
                            : "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>{payment.metodo_pagamento || "-"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(payment)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Deseja realmente excluir este pagamento?")) {
                                deleteMutation.mutate(payment.id);
                              }
                            }}
                          >
                            Excluir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // ──── Renderizar Card de Programações Ativas ───────────────────────────
  const renderSchedulesCard = (tipo: "parcela" | "seguro") => {
    const activeSchedules = (schedules || []).filter(
      (s) => s.tipo === tipo && s.ativo
    );

    if (activeSchedules.length === 0) {
      return null;
    }

    return (
      <Card className="neu mb-4">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2">
            <Repeat2 className="h-5 w-5 text-primary" />
            Programações Ativas
          </CardTitle>
          <CardDescription>
            {activeSchedules.length} programação(ões) ativa(s) para {tipo}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <ul className="md:hidden space-y-3">
            {activeSchedules.map((schedule) => (
              <li key={schedule.id} className="rounded-xl border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Car className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{schedule.carcontrol_vehicles?.modelo || "N/A"}</p>
                      <p className="text-xs text-muted-foreground">{schedule.carcontrol_vehicles?.placa}</p>
                    </div>
                  </div>
                  <span className="shrink-0 font-medium text-green-600 tabular-nums">{fmtBRL(schedule.valor)}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{recurrenceLabel(schedule)}</span>
                  <span>
                    {format(parseISO(schedule.data_inicio), "dd/MM/yyyy", { locale: ptBR })}
                    {" → "}
                    {schedule.data_fim
                      ? format(parseISO(schedule.data_fim), "dd/MM/yyyy", { locale: ptBR })
                      : "sem fim"}
                  </span>
                  {(schedule as any).parcelas_restantes ? (
                    <span>{(schedule as any).parcelas_restantes} parcelas restantes</span>
                  ) : null}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
                  <button
                    type="button"
                    onClick={() => toggleScheduleAtivo(schedule)}
                    className="flex h-10 items-center gap-1.5 text-sm"
                  >
                    {schedule.ativo ? (
                      <ToggleRight className="h-5 w-5 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                    )}
                    <span className={schedule.ativo ? "text-green-600" : "text-gray-500"}>
                      {schedule.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-10 w-10 p-0" aria-label="Editar programação" onClick={() => handleOpenScheduleDialog(schedule)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 p-0 text-danger hover:text-danger hover:bg-danger/10"
                      aria-label="Excluir programação"
                      onClick={() => {
                        if (confirm("Deseja realmente excluir esta programação?")) {
                          deleteScheduleMutation.mutate(schedule.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="hidden md:block overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Parcelas Restantes</TableHead>
                  <TableHead>Recorrência</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {schedule.carcontrol_vehicles?.modelo || "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {schedule.carcontrol_vehicles?.placa}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-green-600">
                        {fmtBRL(schedule.valor)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {(schedule as any).parcelas_restantes || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>{recurrenceLabel(schedule)}</TableCell>
                    <TableCell>
                      {format(parseISO(schedule.data_inicio), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {schedule.data_fim
                        ? format(parseISO(schedule.data_fim), "dd/MM/yyyy", { locale: ptBR })
                        : "Sem fim"}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleScheduleAtivo(schedule)}
                        className="flex items-center gap-1 text-sm"
                      >
                        {schedule.ativo ? (
                          <ToggleRight className="h-5 w-5 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-gray-400" />
                        )}
                        <span className={schedule.ativo ? "text-green-600" : "text-gray-500"}>
                          {schedule.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </button>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenScheduleDialog(schedule)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Deseja realmente excluir esta programação?")) {
                            deleteScheduleMutation.mutate(schedule.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ──── Renderizar Aba de Pagamentos Confirmados ────────────────────────
  const renderConfirmedPaymentsTab = () => {
    const confirmed = (confirmedSchedulePayments as any[]) ?? [];
    const totalValor = confirmed.reduce((s: number, p: any) => s + (p.valor || 0), 0);
    const totalParcelas = confirmed.filter((p: any) => p.tipo === "parcela").length;
    const totalSeguros = confirmed.filter((p: any) => p.tipo === "seguro").length;

    return (
      <div className="neu p-4 sm:p-6">
        <div className="mb-5">
          <h2 className="font-display text-lg sm:text-xl font-bold flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            Pagamentos Confirmados
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Parcelas e seguros confirmados via programação de pagamentos no Dashboard.
          </p>
        </div>

        {/* Cards de resumo */}
        {confirmed.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
            <div className="neu-inset px-4 py-3 rounded-xl">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Total confirmado</div>
              <div className="font-display text-xl font-bold text-emerald-600 mt-1">
                {fmtBRL(totalValor)}
              </div>
            </div>
            <div className="neu-inset px-4 py-3 rounded-xl">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Parcelas</div>
              <div className="font-display text-xl font-bold mt-1">{totalParcelas}</div>
            </div>
            <div className="neu-inset px-4 py-3 rounded-xl col-span-2 md:col-span-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Seguros</div>
              <div className="font-display text-xl font-bold mt-1">{totalSeguros}</div>
            </div>
          </div>
        )}

        {confirmed.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Nenhum pagamento confirmado ainda</p>
            <p className="text-xs mt-1">
              Confirme pagamentos na aba "Pagamentos" do Dashboard para vê-los aqui.
            </p>
          </div>
        ) : (
          <>
          <ul className="md:hidden space-y-3">
            {confirmed.map((p: any) => {
              const veh = p.carcontrol_vehicles;
              const isParcela = p.tipo === "parcela";
              return (
                <li key={p.id} className="neu-inset p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{veh ? veh.modelo : "—"}</p>
                      {veh && <p className="text-xs text-muted-foreground font-mono">{veh.placa}</p>}
                    </div>
                    <span className={`shrink-0 font-display font-bold tabular-nums ${isParcela ? "text-blue-600" : "text-orange-600"}`}>
                      {fmtBRL(p.valor)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${isParcela ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                      {isParcela ? "Parcela" : "Seguro"}
                    </span>
                    <span className="font-mono">
                      {p.schedule_date ? format(parseISO(p.schedule_date), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                    </span>
                    {p.data_pagamento && (
                      <span>Pago {format(parseISO(p.data_pagamento), "dd/MM/yyyy", { locale: ptBR })}</span>
                    )}
                    {p.metodo_pagamento && <span className="capitalize">{p.metodo_pagamento}</span>}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" />
                      Confirmado
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-9 w-9 p-0"
                      aria-label="Excluir confirmação"
                      onClick={() => {
                        if (confirm("Deseja excluir este pagamento confirmado?")) {
                          deleteMutation.mutate(p.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="hidden md:block overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Programada</TableHead>
                  <TableHead>Data Pagamento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {confirmed.map((p: any) => {
                  const veh = p.carcontrol_vehicles;
                  const isParcela = p.tipo === "parcela";
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <span className="font-mono text-sm font-semibold">
                          {p.schedule_date
                            ? format(parseISO(p.schedule_date), "dd/MM/yyyy", { locale: ptBR })
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {p.data_pagamento
                            ? format(parseISO(p.data_pagamento), "dd/MM/yyyy", { locale: ptBR })
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                          isParcela
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }`}>
                          <Car className="w-3 h-3" />
                          {isParcela ? "Parcela" : "Seguro"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {veh ? (
                          <div>
                            <div className="text-sm font-medium">{veh.modelo}</div>
                            <div className="text-xs text-muted-foreground font-mono">{veh.placa}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm capitalize">{p.metodo_pagamento || "—"}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-display font-bold ${isParcela ? "text-blue-600" : "text-orange-600"}`}>
                          {fmtBRL(p.valor)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Confirmado
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                          title="Excluir confirmação"
                          onClick={() => {
                            if (confirm("Deseja excluir este pagamento confirmado?")) {
                              deleteMutation.mutate(p.id);
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
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
    );
  };

  return (
    <AppShell>
      <Topbar
        title="Financiamento & Seguro"
        subtitle="Gerencie os pagamentos de financiamentos e seguros dos seus veículos"
        helpPath="/ajuda/gestao/financiamento-seguro"
      />
      <div className="space-y-6">
        <div className="-mt-2 grid grid-cols-2 gap-2 sm:flex sm:justify-end md:-mt-4">
          <Button onClick={() => handleOpenScheduleDialog()} variant="outline" className="h-11 sm:h-10 text-xs sm:text-sm">
            <Repeat2 className="mr-1.5 h-4 w-4 shrink-0" />
            Nova Programação
          </Button>
          <Button onClick={() => handleOpenDialog()} className="h-11 sm:h-10 text-xs sm:text-sm">
            <Plus className="mr-1.5 h-4 w-4 shrink-0" />
            Novo Pagamento
          </Button>
        </div>

        <Tabs defaultValue="parcela" className="space-y-4">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0 sm:grid sm:max-w-2xl sm:grid-cols-3 sm:bg-muted sm:p-1">
            <TabsTrigger value="parcela" className="flex-1 gap-2 py-2 text-xs sm:text-sm data-[state=active]:bg-muted sm:data-[state=active]:bg-background">
              <DollarSign className="h-4 w-4" />
              Parcelas
            </TabsTrigger>
            <TabsTrigger value="seguro" className="flex-1 gap-2 py-2 text-xs sm:text-sm data-[state=active]:bg-muted sm:data-[state=active]:bg-background">
              <Calendar className="h-4 w-4" />
              Seguros
            </TabsTrigger>
            <TabsTrigger value="confirmados" className="flex-1 gap-2 py-2 text-xs sm:text-sm data-[state=active]:bg-muted sm:data-[state=active]:bg-background">
              <Receipt className="h-4 w-4" />
              Confirmados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parcela" className="space-y-4">
            {renderSchedulesCard("parcela")}
            {renderPaymentTable("parcela")}
          </TabsContent>

          <TabsContent value="seguro" className="space-y-4">
            {renderSchedulesCard("seguro")}
            {renderPaymentTable("seguro")}
          </TabsContent>

          <TabsContent value="confirmados" className="space-y-4">
            {renderConfirmedPaymentsTab()}
          </TabsContent>
        </Tabs>

        {/* Dialog de Criar/Editar */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[83vh] w-full overflow-hidden sm:max-h-[90vh] max-w-[42rem]">
            <DialogHeader>
              <DialogTitle>
                {editingPayment ? "Editar Pagamento" : "Novo Pagamento"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do pagamento de {formData.tipo}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="sm:max-h-[calc(83vh-11rem)] overflow-hidden rounded-3xl border border-primary/10 bg-background/90 p-1 shadow-sm">
              <form onSubmit={handleSubmit} className="grid gap-4 p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehicle_id">Veículo *</Label>
                    <Select
                      value={formData.vehicle_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, vehicle_id: value })
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Selecione o veículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.marca} {vehicle.modelo} - {vehicle.placa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value: "parcela" | "seguro") =>
                        setFormData({ ...formData, tipo: value })
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parcela">Parcela</SelectItem>
                        <SelectItem value="seguro">Seguro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valor">Valor (R$) *</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      className="bg-white"
                      value={formData.valor}
                      onChange={(e) =>
                        setFormData({ ...formData, valor: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
                    <Input
                      id="data_vencimento"
                      type="date"
                      className="bg-white"
                      value={formData.data_vencimento}
                      onChange={(e) =>
                        setFormData({ ...formData, data_vencimento: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="atrasado">Atrasado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="data_pagamento">Data de Pagamento</Label>
                    <Input
                      id="data_pagamento"
                      type="date"
                      className="bg-white"
                      value={formData.data_pagamento}
                      onChange={(e) =>
                        setFormData({ ...formData, data_pagamento: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="metodo_pagamento">Método de Pagamento</Label>
                  <Input
                    id="metodo_pagamento"
                    className="bg-white"
                    value={formData.metodo_pagamento}
                    onChange={(e) =>
                      setFormData({ ...formData, metodo_pagamento: e.target.value })
                    }
                    placeholder="Ex: PIX, Boleto, Cartão..."
                  />
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    className="bg-white"
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData({ ...formData, observacoes: e.target.value })
                    }
                    placeholder="Informações adicionais..."
                    rows={3}
                  />
                </div>

                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </DialogFooter>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Dialog de Programação */}
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogContent className="max-h-[83vh] w-full overflow-hidden sm:max-h-[90vh] max-w-[42rem]">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? "Editar Programação" : "Nova Programação"}
              </DialogTitle>
              <DialogDescription>
                Configure a programação de {scheduleForm.tipo}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="sm:max-h-[calc(83vh-11rem)] overflow-hidden rounded-3xl border border-primary/10 bg-background/90 p-1 shadow-sm">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!scheduleForm.vehicle_id || !scheduleForm.valor || !scheduleForm.data_inicio || !scheduleForm.parcelas_restantes) {
                    toast.error("Preencha todos os campos obrigatórios (Veículo, Valor, Data Início e Parcelas Restantes)");
                    return;
                  }
                  saveScheduleMutation.mutate();
                }}
                className="grid gap-4 p-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schedule_vehicle_id">Veículo *</Label>
                    <Select
                      value={scheduleForm.vehicle_id}
                      onValueChange={(value) =>
                        setScheduleForm({ ...scheduleForm, vehicle_id: value })
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Selecione o veículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.marca} {vehicle.modelo} - {vehicle.placa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="schedule_tipo">Tipo *</Label>
                    <Select
                      value={scheduleForm.tipo}
                      onValueChange={(value: "parcela" | "seguro") =>
                        setScheduleForm({ ...scheduleForm, tipo: value })
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parcela">Parcela</SelectItem>
                        <SelectItem value="seguro">Seguro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schedule_valor">Valor (R$) *</Label>
                    <Input
                      id="schedule_valor"
                      type="text"
                      value={scheduleForm.valor}
                      onChange={(e) => {
                        // Remove tudo que não é número
                        let value = e.target.value.replace(/\D/g, '');
                        
                        // Converte para número e formata
                        if (value) {
                          const numValue = parseInt(value) / 100;
                          value = numValue.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          });
                        }
                        
                        setScheduleForm({ ...scheduleForm, valor: value });
                      }}
                      required
                      placeholder="0,00"
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="schedule_parcelas_restantes">
                      Parcelas Restantes *
                    </Label>
                    <Input
                      id="schedule_parcelas_restantes"
                      type="number"
                      min="1"
                      step="1"
                      value={scheduleForm.parcelas_restantes}
                      onChange={(e) => {
                        const novasParcelas = e.target.value;
                        const dataFimCalculada = calcularDataFim(
                          scheduleForm.data_inicio,
                          parseInt(novasParcelas) || 0,
                          scheduleForm.tipo_recorrencia
                        );
                        setScheduleForm({ 
                          ...scheduleForm, 
                          parcelas_restantes: novasParcelas,
                          data_fim: dataFimCalculada
                        });
                      }}
                      required
                      placeholder="Ex: 12"
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schedule_tipo_recorrencia">Recorrência *</Label>
                    <Select
                      value={scheduleForm.tipo_recorrencia}
                      onValueChange={(value: "mensal" | "semanal") => {
                        const dataFimCalculada = calcularDataFim(
                          scheduleForm.data_inicio,
                          parseInt(scheduleForm.parcelas_restantes) || 0,
                          value
                        );
                        setScheduleForm({ 
                          ...scheduleForm, 
                          tipo_recorrencia: value,
                          data_fim: dataFimCalculada
                        });
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                {scheduleForm.tipo_recorrencia === "mensal" && (
                    <div>
                      <Label htmlFor="schedule_dia_mes">Dia do Mês *</Label>
                      <Select
                        value={scheduleForm.dia_mes}
                        onValueChange={(value) =>
                          setScheduleForm({ ...scheduleForm, dia_mes: value })
                        }
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIAS_MES.map((dia) => (
                            <SelectItem key={dia} value={dia.toString()}>
                              Dia {dia}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {scheduleForm.tipo_recorrencia === "semanal" && (
                    <div>
                      <Label htmlFor="schedule_dia_semana">Dia da Semana *</Label>
                      <Select
                        value={scheduleForm.dia_semana}
                        onValueChange={(value) =>
                          setScheduleForm({ ...scheduleForm, dia_semana: value })
                        }
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIAS_SEMANA.map((dia, idx) => (
                            <SelectItem key={idx} value={idx.toString()}>
                              {dia}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>



                {scheduleForm.tipo_recorrencia === "semanal" && (
                  <div>
                    <Label htmlFor="schedule_dia_semana">Dia da Semana *</Label>
                    <Select
                      value={scheduleForm.dia_semana}
                      onValueChange={(value) =>
                        setScheduleForm({ ...scheduleForm, dia_semana: value })
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIAS_SEMANA.map((dia, idx) => (
                          <SelectItem key={idx} value={idx.toString()}>
                            {dia}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schedule_data_inicio">Data Início *</Label>
                    <Input
                      id="schedule_data_inicio"
                      type="date"
                      value={scheduleForm.data_inicio}
                      onChange={(e) => {
                        const novaDataInicio = e.target.value;
                        const dataFimCalculada = calcularDataFim(
                          novaDataInicio,
                          parseInt(scheduleForm.parcelas_restantes) || 0,
                          scheduleForm.tipo_recorrencia
                        );
                        setScheduleForm({ 
                          ...scheduleForm, 
                          data_inicio: novaDataInicio,
                          data_fim: dataFimCalculada
                        });
                      }}
                      required
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="schedule_data_fim">
                      Data Fim (calculada automaticamente)
                    </Label>
                    <Input
                      id="schedule_data_fim"
                      type="date"
                      value={scheduleForm.data_fim}
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                      title="Este campo é calculado automaticamente com base na Data Início, Parcelas Restantes e Recorrência"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Calculado: Data Início + {scheduleForm.parcelas_restantes || 0} {scheduleForm.tipo_recorrencia === "mensal" ? "meses" : "semanas"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schedule_metodo_pagamento">Método de Pagamento</Label>
                    <Select
                      value={scheduleForm.metodo_pagamento}
                      onValueChange={(value) =>
                        setScheduleForm({ ...scheduleForm, metodo_pagamento: value })
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Selecione o método" />
                      </SelectTrigger>
                      <SelectContent>
                        {METODOS_PAGAMENTO.map((metodo) => (
                          <SelectItem key={metodo} value={metodo}>
                            {metodo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="schedule_banco">Banco ou Seguradora</Label>
                    <Input
                      id="schedule_banco"
                      type="text"
                      value={scheduleForm.banco}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, banco: e.target.value })
                      }
                      placeholder="Ex: Banco do Brasil, Itaú, Santander..."
                      className="bg-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="schedule_observacoes">Observações</Label>
                  <Textarea
                    id="schedule_observacoes"
                    value={scheduleForm.observacoes}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, observacoes: e.target.value })
                    }
                    rows={3}
                    className="bg-white"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="schedule_ativo"
                    checked={scheduleForm.ativo}
                    onCheckedChange={(checked) =>
                      setScheduleForm({ ...scheduleForm, ativo: checked })
                    }
                  />
                  <Label htmlFor="schedule_ativo" className="cursor-pointer">
                    Programação ativa
                  </Label>
                </div>

                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={handleCloseScheduleDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saveScheduleMutation.isPending}>
                    {saveScheduleMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
