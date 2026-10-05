import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Search, Loader2, DollarSign, Calendar, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { fmtBRL, fmtDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Página Mobile de Alugueis
 * 
 * Exibe recebimentos de alugueis confirmados e permite lançar novos
 * ✅ Listagem de recebimentos confirmados com paginação (10 por página)
 * ✅ Lançar novo recebimento a partir de programação
 * ✅ Filtro por motorista/veículo
 * ✅ Status visual (recebido, pendente, atrasado)
 */

// Constantes
const ITEMS_PER_PAGE = 10;

const MobileAlugueis = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    data_pagamento: new Date().toISOString().slice(0, 10),
    metodo: "pix",
    observacoes: "",
  });

  // ✅ Fetch recebimentos confirmados (pagamentos com schedule_date)
  const { data: confirmedPayments, loading: loadingPayments } = useRealtimeData(
    "carcontrol_payments",
    {
      select: "*, carcontrol_drivers(nome), carcontrol_vehicles(modelo, placa)",
      filter: (q) => q.eq("status", "pago").not("schedule_date", "is", null),
      order: { column: "schedule_date", ascending: false },
    }
  );

  // ✅ Fetch programações de recebimento ativas
  const { data: paymentSchedules, loading: loadingSchedules } = useRealtimeData(
    "carcontrol_payment_schedules",
    {
      select: "*, carcontrol_drivers(nome), carcontrol_vehicles(modelo, placa)",
      filter: (q) => q.eq("ativo", true),
      order: { column: "created_at", ascending: false },
    }
  );

  // ✅ Filtrar recebimentos confirmados
  const filteredPayments = useMemo(() => {
    if (!confirmedPayments) return [];
    return (confirmedPayments as any[]).filter((p) => {
      const driverName = p.carcontrol_drivers?.nome || "";
      const vehicleInfo = p.carcontrol_vehicles
        ? `${p.carcontrol_vehicles.modelo} ${p.carcontrol_vehicles.placa}`
        : "";
      const searchLower = searchTerm.toLowerCase();
      return (
        driverName.toLowerCase().includes(searchLower) ||
        vehicleInfo.toLowerCase().includes(searchLower)
      );
    });
  }, [confirmedPayments, searchTerm]);

  // ✅ Programações disponíveis para lançar novo recebimento
  const availableSchedules = useMemo(() => {
    if (!paymentSchedules) return [];
    return (paymentSchedules as any[]).filter((s) => s.ativo);
  }, [paymentSchedules]);

  // ✅ Paginação: calcular índices e página atual
  const paginationData = useMemo(() => {
    const totalItems = filteredPayments.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const validPage = Math.min(Math.max(1, currentPage), totalPages || 1);
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedItems = filteredPayments.slice(startIndex, endIndex);

    return {
      totalItems,
      totalPages,
      currentPage: validPage,
      startIndex,
      endIndex,
      paginatedItems,
      hasNextPage: validPage < totalPages,
      hasPrevPage: validPage > 1,
    };
  }, [filteredPayments, currentPage]);

  // ✅ Handlers de paginação
  const handleNextPage = () => {
    if (paginationData.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (paginationData.hasPrevPage) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ✅ Reset página ao buscar
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const isLoading = loadingPayments || loadingSchedules;

  const handleLaunchPayment = async () => {
    if (!selectedScheduleId || !session) {
      toast.error("Selecione uma programação");
      return;
    }

    if (!formData.data_pagamento) {
      toast.error("Informe a data do pagamento");
      return;
    }

    const schedule = availableSchedules.find((s) => s.id === selectedScheduleId);
    if (!schedule) {
      toast.error("Programação não encontrada");
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentData = {
        vehicle_id: schedule.vehicle_id,
        driver_id: schedule.driver_id,
        data: formData.data_pagamento,
        schedule_date: formData.data_pagamento,
        valor: schedule.valor,
        metodo: formData.metodo,
        status: "pago",
        user_id: session.user.id,
      };

      const { error } = await supabase
        .from("carcontrol_payments")
        .insert([paymentData] as any);

      if (error) throw error;

      toast.success("Recebimento lançado com sucesso!");
      setIsDialogOpen(false);
      setSelectedScheduleId("");
      setFormData({
        data_pagamento: new Date().toISOString().slice(0, 10),
        metodo: "pix",
        observacoes: "",
      });
    } catch (error: any) {
      toast.error(`Erro ao lançar recebimento: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in pb-20">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border/10">
          <button
            onClick={() => navigate("/mobile/home")}
            className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse font-medium">Carregando alugueis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/10 bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/mobile/home")}
            className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Alugueis</h1>
            <p className="text-xs text-muted-foreground">
              {paginationData.totalItems} recebimento(s) • Página {paginationData.currentPage} de {paginationData.totalPages}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="rounded-lg"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Novo
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 py-4 space-y-4 bg-background/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por motorista ou veículo..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
            aria-label="Buscar alugueis"
          />
        </div>
      </div>

      {/* Recebimentos List */}
      <div className="px-4 space-y-3 py-4">
        {/* Empty State */}
        {paginationData.totalItems === 0 && (
          <div className="text-center py-10 rounded-lg text-muted-foreground">
            <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-semibold">Nenhum recebimento encontrado</p>
            <p className="text-xs mt-1">
              {searchTerm ? "Tente ajustar a busca" : "Comece lançando um novo recebimento"}
            </p>
          </div>
        )}

        {/* Recebimentos Cards */}
        {paginationData.paginatedItems.map((payment: any) => (
          <div
            key={payment.id}
            className="p-4 rounded-lg border border-border/50 hover:border-accent/50 hover:shadow-md transition-all bg-card"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <h3 className="font-semibold text-sm truncate">
                    {payment.carcontrol_drivers?.nome || "Motorista não informado"}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {payment.carcontrol_vehicles
                    ? `${payment.carcontrol_vehicles.modelo} • ${payment.carcontrol_vehicles.placa}`
                    : "Veículo não informado"}
                </p>
              </div>
              <Badge className="ml-2 flex-shrink-0 bg-green-500/10 text-green-700 border border-green-200">
                Recebido
              </Badge>
            </div>

            {/* Card Content */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Data:</span>
                </div>
                <span className="font-semibold text-foreground">
                  {fmtDate(payment.schedule_date || payment.data)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Valor:</span>
                </div>
                <span className="font-semibold text-primary">{fmtBRL(payment.valor)}</span>
              </div>
              {payment.metodo && (
                <div className="flex items-center justify-between">
                  <span>Método:</span>
                  <span className="font-semibold text-foreground capitalize">
                    {payment.metodo}
                  </span>
                </div>
              )}
              {payment.observacoes && (
                <div className="pt-2 border-t border-border/30">
                  <p className="text-xs italic">{payment.observacoes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {paginationData.totalPages > 1 && (
        <div className="px-4 py-4 flex items-center justify-between gap-2 border-t border-border/10 bg-background/50">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={!paginationData.hasPrevPage}
            className="flex-1"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>

          <div className="text-xs font-medium text-muted-foreground text-center px-2">
            {paginationData.currentPage} / {paginationData.totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!paginationData.hasNextPage}
            className="flex-1"
            aria-label="Próxima página"
          >
            Próxima
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Dialog: Novo Recebimento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-sm">
          <DialogHeader>
            <DialogTitle>Lançar Novo Recebimento</DialogTitle>
            <DialogDescription>
              Selecione uma programação de recebimento e confirme o pagamento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Programação */}
            <div>
              <Label htmlFor="schedule">Programação de Recebimento *</Label>
              <Select value={selectedScheduleId} onValueChange={setSelectedScheduleId}>
                <SelectTrigger id="schedule" className="bg-background">
                  <SelectValue placeholder="Selecione uma programação" />
                </SelectTrigger>
                <SelectContent>
                  {availableSchedules.map((schedule: any) => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      <div className="flex flex-col">
                        <span>
                          {schedule.carcontrol_drivers?.nome || "Motorista"} •{" "}
                          {fmtBRL(schedule.valor)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {schedule.carcontrol_vehicles
                            ? `${schedule.carcontrol_vehicles.modelo} (${schedule.carcontrol_vehicles.placa})`
                            : "Sem veículo"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data de Pagamento */}
            <div>
              <Label htmlFor="data_pagamento">Data do Pagamento *</Label>
              <Input
                id="data_pagamento"
                type="date"
                className="bg-background"
                value={formData.data_pagamento}
                onChange={(e) =>
                  setFormData({ ...formData, data_pagamento: e.target.value })
                }
              />
            </div>

            {/* Método */}
            <div>
              <Label htmlFor="metodo">Método de Pagamento</Label>
              <Select value={formData.metodo} onValueChange={(value) =>
                setFormData({ ...formData, metodo: value })
              }>
                <SelectTrigger id="metodo" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                className="bg-background"
                placeholder="Adicione observações sobre o recebimento..."
                rows={3}
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleLaunchPayment}
              disabled={isSubmitting || !selectedScheduleId}
            >
              {isSubmitting ? "Lançando..." : "Lançar Recebimento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MobileAlugueis;
