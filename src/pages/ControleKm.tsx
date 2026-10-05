import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { useCarcontrolUser } from "@/hooks/useCarcontrolUser";
import { kmHistoryService, type FleetKmControlRow } from "@/integrations/supabase/services/kmHistoryService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import {
  Car,
  Gauge,
  AlertTriangle,
  TrendingUp,
  Loader2,
  Check,
  X,
  AlertCircle,
  Settings2,
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type FilterType = "all" | "ok" | "exceeded";

export default function ControleKm() {
  const { company } = useCarcontrolUser();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [limitsOpen, setLimitsOpen] = useState(false);
  const [limitForm, setLimitForm] = useState<Record<string, string>>({});
  const [savingLimits, setSavingLimits] = useState(false);

  const { data: fleet = [], isLoading } = useQuery({
    queryKey: ["fleet_km_control", company?.id],
    queryFn: () => kmHistoryService.getFleetKmControl(company!.id),
    enabled: !!company?.id,
  });

  const setLimitMutation = useMutation({
    mutationFn: ({ vehicleId, limit }: { vehicleId: string; limit: number }) =>
      kmHistoryService.setWeeklyLimit(vehicleId, limit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fleet_km_control"] });
      toast.success("Limite semanal atualizado");
    },
    onError: () => {
      toast.error("Erro ao atualizar limite");
    },
  });

  const filtered = fleet.filter((v) => {
    if (filter === "ok") return v.excedente <= 0;
    if (filter === "exceeded") return v.excedente > 0;
    return true;
  });

  const totalVehicles = fleet.length;
  const exceededCount = fleet.filter((v) => v.excedente > 0).length;
  const okCount = totalVehicles - exceededCount;
  const avgKm = fleet.reduce((acc, v) => acc + v.km_semana_atual, 0) / Math.max(totalVehicles, 1);

  const handleStartEdit = useCallback((vehicle: FleetKmControlRow) => {
    setEditingId(vehicle.vehicle_id);
    setEditValue(String(vehicle.limite_semanal || ""));
  }, []);

  const handleSaveLimit = useCallback((vehicleId: string) => {
    const limit = parseInt(editValue, 10);
    if (isNaN(limit) || limit < 0) {
      toast.error("Informe um valor válido");
      return;
    }
    setLimitMutation.mutate({ vehicleId, limit });
    setEditingId(null);
  }, [editValue, setLimitMutation]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditValue("");
  }, []);

  const openLimitsDialog = useCallback(() => {
    const form: Record<string, string> = {};
    for (const v of fleet) {
      form[v.vehicle_id] = String(v.limite_semanal || "");
    }
    setLimitForm(form);
    setLimitsOpen(true);
  }, [fleet]);

  const handleSaveAllLimits = useCallback(async () => {
    setSavingLimits(true);
    const entries = Object.entries(limitForm);
    let successCount = 0;
    let errorCount = 0;
    for (const [vehicleId, value] of entries) {
      const limit = parseInt(value, 10);
      if (!isNaN(limit) && limit >= 0) {
        try {
          await kmHistoryService.setWeeklyLimit(vehicleId, limit);
          successCount++;
        } catch {
          errorCount++;
        }
      }
    }
    setSavingLimits(false);
    setLimitsOpen(false);
    queryClient.invalidateQueries({ queryKey: ["fleet_km_control"] });
    if (errorCount > 0) {
      toast.error(`${errorCount} veículo(s) com erro`);
    } else {
      toast.success(`${successCount} limite(s) atualizado(s)`);
    }
  }, [limitForm, queryClient]);

  return (
    <AppShell>
      <Topbar title="Controle de KM" />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold">Controle de KM</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhamento semanal de quilometragem da frota
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="neu p-5 animate-blur-in flex items-center gap-4">
            <img src="/assets/carroAmarelo.png" alt="Frota total" className="w-12 h-12 object-contain flex-shrink-0" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                Frota total
              </div>
              <div className="font-display text-xl font-bold text-foreground">
                {totalVehicles}
              </div>
            </div>
          </div>

          <div className="neu p-5 animate-blur-in delay-75 flex items-center gap-4">
            <img src="/assets/limite.png" alt="Dentro do limite" className="w-12 h-12 object-contain flex-shrink-0" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                Dentro do limite
              </div>
              <div className="font-display text-xl font-bold text-emerald-500">
                {okCount}
              </div>
            </div>
          </div>

          <div className="neu p-5 animate-blur-in delay-150 flex items-center gap-4">
            <img src="/assets/alerta.png" alt="Excedendo limite" className="w-12 h-12 object-contain flex-shrink-0" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                Excedendo limite
              </div>
              <div className={`font-display text-xl font-bold ${exceededCount > 0 ? "text-danger" : "text-foreground"}`}>
                {exceededCount}
              </div>
            </div>
          </div>

          <div className="neu p-5 animate-blur-in delay-300 flex items-center gap-4">
            <img src="/assets/up.png" alt="KM médio semanal" className="w-12 h-12 object-contain flex-shrink-0" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                KM médio semanal
              </div>
              <div className="font-display text-xl font-bold text-foreground">
                {Math.round(avgKm).toLocaleString("pt-BR")}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            {(["all", "ok", "exceeded"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className="rounded-full"
              >
                {f === "all" && "Todos"}
                {f === "ok" && "Dentro do Limite"}
                {f === "exceeded" && "Excedendo"}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={openLimitsDialog}>
            <Settings2 className="w-4 h-4 mr-2" />
            Configurar Limites
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="neu rounded-3xl p-12 text-center">
            <Gauge className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground text-lg font-medium">
              {fleet.length === 0
                ? "Nenhum veículo encontrado na frota"
                : "Nenhum veículo neste filtro"}
            </p>
          </div>
        ) : (
          <div className="neu rounded-3xl overflow-hidden animate-blur-in">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">Veículo</TableHead>
                    <TableHead className="font-bold text-right">KM Atual</TableHead>
                    <TableHead className="font-bold text-right">KM Esta Semana</TableHead>
                    <TableHead className="font-bold text-right">Limite Semanal</TableHead>
                    <TableHead className="font-bold text-right">Excedente</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((v) => {
                    const isExceeded = v.excedente > 0;
                    return (
                      <TableRow
                        key={v.vehicle_id}
                        className={`hover:bg-muted/30 transition-colors ${
                          isExceeded ? "bg-danger/5" : ""
                        }`}
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase">{v.placa}</span>
                            <span className="font-semibold">{v.modelo}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {v.km_atual?.toLocaleString("pt-BR") || "0"} km
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {v.km_semana_atual?.toLocaleString("pt-BR") || "0"} km
                        </TableCell>
                        <TableCell className="text-right">
                          {editingId === v.vehicle_id ? (
                            <div className="flex items-center justify-end gap-1">
                              <Input
                                type="number"
                                min={0}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveLimit(v.vehicle_id);
                                  if (e.key === "Escape") handleCancelEdit();
                                }}
                                className="w-24 h-8 text-right text-sm"
                                autoFocus
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleSaveLimit(v.vehicle_id)}
                              >
                                <Check className="w-4 h-4 text-emerald-500" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={handleCancelEdit}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(v)}
                              className="font-mono hover:text-primary transition-colors cursor-pointer"
                              title="Clique para editar"
                            >
                              {v.limite_semanal > 0
                                ? `${v.limite_semanal.toLocaleString("pt-BR")} km`
                                : "—"}
                            </button>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {v.limite_semanal > 0 ? (
                            <span className={isExceeded ? "text-danger font-bold" : "text-emerald-500"}>
                              {isExceeded ? "+" : ""}
                              {v.excedente.toLocaleString("pt-BR")} km
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {v.limite_semanal > 0 ? (
                            isExceeded ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-danger bg-danger/10 px-3 py-1 rounded-full">
                                <AlertCircle className="w-3 h-3" />
                                Excedido
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                                <Check className="w-3 h-3" />
                                OK
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-muted-foreground">Sem limite</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      <Dialog open={limitsOpen} onOpenChange={setLimitsOpen}>
        <DialogContent className="max-h-[85vh] w-full sm:max-h-[90vh] max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurar Limites Semanais</DialogTitle>
            <DialogDescription>
              Defina o limite de quilometragem semanal para cada veículo da frota.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(85vh-12rem)] space-y-3 pr-1">
            {fleet.map((v) => (
              <div
                key={v.vehicle_id}
                className="flex items-center gap-4 neu-sm p-4 rounded-2xl"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-muted-foreground uppercase font-mono">{v.placa}</span>
                  <p className="font-semibold truncate">{v.modelo}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground uppercase">KM semana</div>
                    <div className="font-mono text-sm">{v.km_semana_atual.toLocaleString("pt-BR")}</div>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`limit-${v.vehicle_id}`} className="sr-only">
                      Limite {v.placa}
                    </Label>
                    <Input
                      id={`limit-${v.vehicle_id}`}
                      type="number"
                      min={0}
                      placeholder="Limite"
                      value={limitForm[v.vehicle_id] ?? ""}
                      onChange={(e) =>
                        setLimitForm((prev) => ({ ...prev, [v.vehicle_id]: e.target.value }))
                      }
                      className="w-24 h-9 text-right text-sm"
                    />
                    <span className="text-xs text-muted-foreground">km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setLimitsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAllLimits} disabled={savingLimits}>
              {savingLimits ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Salvar Todos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
