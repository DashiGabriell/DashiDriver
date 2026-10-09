import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { fmtBRL, fmtDate } from "@/lib/utils";
import { useCountAnimation } from "@/hooks/useCountAnimation";
import { Wrench, Plus, Loader2, Edit3, Trash2, Camera, Eye, X, ExternalLink } from "lucide-react";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { useState, useRef } from "react";
import { useAuth } from "@/integrations/supabase/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { kmHistoryService } from "@/integrations/supabase/services/kmHistoryService";
import { maintenanceService } from "@/integrations/supabase/services/maintenanceService";
import { getErrorMessage } from "@/integrations/supabase/services/errors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { manutencaoSchema, ManutencaoInput } from "@/lib/validators/manutencao";

const tipoCls: Record<string, string> = {
  preventiva: "text-success",
  corretiva: "text-warning",
  emergencial: "text-danger",
};

interface MaintenanceFormData {
  vehicle_id: string;
  tipo: "preventiva" | "corretiva" | "emergencial";
  servico: string;
  oficina: string;
  data: string;
  valor: string;
  km_atual: string;
  proximo_km: string;
  observacoes: string;
  photo_url: string;
}

const MAINTENANCE_PHOTOS_BUCKET = "maintenance-photos";

const Manutencao = () => {
  const { session } = useAuth();
  const { data: maintenances, loading: loadingMaintenances } = useRealtimeData("carcontrol_maintenances", {
    select: "*, carcontrol_vehicles!vehicle_id(*)"
  });
  const { data: vehicles, loading: loadingVehicles } = useRealtimeData("carcontrol_vehicles");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const [viewingMaintenance, setViewingMaintenance] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<MaintenanceFormData>({
    vehicle_id: "",
    tipo: "preventiva",
    servico: "",
    oficina: "",
    data: new Date().toISOString().slice(0, 10),
    valor: "",
    km_atual: "",
    proximo_km: "",
    observacoes: "",
    photo_url: "",
  });
  const form = useForm<ManutencaoInput>({
    resolver: zodResolver(manutencaoSchema),
    values: {
      vehicle_id: formData.vehicle_id,
      servico: formData.servico,
      oficina: formData.oficina,
      data: formData.data,
      valor: formData.valor,
      observacao: formData.observacoes,
    },
  });

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const total = maintenances.reduce((s, m) => s + (m.valor || 0), 0);
  const servicos = maintenances.length;
  const emOficina = vehicles.filter(v => v.status === "oficina").length;

  const totalRef = useCountAnimation(total, 2, 0, true);
  const servicosRef = useCountAnimation(servicos, 2, 0.075);
  const emOficinaRef = useCountAnimation(emOficina, 2, 0.15);

  const openCreateModal = () => {
    setSelectedMaintenance(null);
    setFormData({
      vehicle_id: "",
      tipo: "preventiva",
      servico: "",
      oficina: "",
      data: new Date().toISOString().slice(0, 10),
      valor: "",
      km_atual: "",
      proximo_km: "",
      observacoes: "",
      photo_url: "",
    });
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setIsFormOpen(true);
  };

  const openEditModal = (e: React.MouseEvent, maintenance: any) => {
    e.stopPropagation();
    setSelectedMaintenance(maintenance);
    setFormData({
      vehicle_id: maintenance.vehicle_id || "",
      tipo: maintenance.tipo || "preventiva",
      servico: maintenance.servico || "",
      oficina: maintenance.oficina || "",
      data: maintenance.data || new Date().toISOString().slice(0, 10),
      valor: maintenance.valor?.toString() || "",
      km_atual: maintenance.km_atual?.toString() || "",
      proximo_km: maintenance.proximo_km?.toString() || "",
      observacoes: maintenance.observacoes || "",
      photo_url: maintenance.photo_url || "",
    });
    setSelectedPhoto(null);
    setPhotoPreview(maintenance.photo_url || null);
    setIsFormOpen(true);
  };

  const openDetailsModal = (maintenance: any) => {
    setViewingMaintenance(maintenance);
    setIsDetailsOpen(true);
  };

  const closeModal = () => {
    setSelectedMaintenance(null);
    setIsFormOpen(false);
    setSelectedPhoto(null);
    setPhotoPreview(null);
  };

  const formatCurrency = (value: number) => fmtBRL(value || 0);
  
  const parseBRL = (value: string) => {
    const normalized = value
      .replace(/\s/g, "")
      .replace(/R\$/g, "")
      .replace(/\./g, "")
      .replace(/,/g, ".")
      .replace(/[^0-9.]/g, "");
    return Number(normalized ? parseFloat(normalized) : 0);
  };

  const handleFieldChange = (field: keyof MaintenanceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB");
        return;
      }
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setFormData(prev => ({ ...prev, photo_url: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadPhoto = async (maintenanceId: string): Promise<string | null> => {
    if (!selectedPhoto) return formData.photo_url || null;

    try {
      const fileExt = selectedPhoto.name.split('.').pop();
      const fileName = `${maintenanceId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(MAINTENANCE_PHOTOS_BUCKET)
        .upload(filePath, selectedPhoto);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(MAINTENANCE_PHOTOS_BUCKET)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {

      toast.error("Erro ao enviar foto: " + error.message);
      return null;
    }
  };

  const saveMaintenance = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      setIsSaving(true);
      
      let finalPhotoUrl = formData.photo_url;
      const maintenanceId = selectedMaintenance?.id || crypto.randomUUID();

      if (selectedPhoto) {
        const uploadedUrl = await uploadPhoto(maintenanceId);
        if (uploadedUrl) finalPhotoUrl = uploadedUrl;
      }

      const dataToSave = {
        id: maintenanceId,
        vehicle_id: formData.vehicle_id,
        tipo: formData.tipo,
        servico: formData.servico,
        oficina: formData.oficina,
        data: formData.data,
        valor: parseFloat(formData.valor) || 0,
        km_atual: formData.km_atual ? parseInt(formData.km_atual) : null,
        proximo_km: formData.proximo_km ? parseInt(formData.proximo_km) : null,
        observacoes: formData.observacoes || null,
        photo_url: finalPhotoUrl || null,
        user_id: session?.user?.id,
      };

      if (selectedMaintenance?.id) {
        await maintenanceService.update(selectedMaintenance.id, dataToSave);
        toast.success("Manutenção atualizada com sucesso");
      } else {
        await maintenanceService.create(dataToSave);
        toast.success("Manutenção cadastrada com sucesso");
      }

      // Registrar KM no histórico
      if (formData.km_atual) {
        const vehicle = (vehicles as any[])?.find((v: any) => v.id === formData.vehicle_id);
        if (vehicle?.company_id) {
          await kmHistoryService.record({
            company_id: vehicle.company_id,
            vehicle_id: formData.vehicle_id,
            km: parseInt(formData.km_atual),
            source: 'maintenance',
            source_id: maintenanceId,
            userId: session?.user?.id,
          });
          await kmHistoryService.updateVehicleKm(formData.vehicle_id, parseInt(formData.km_atual));
        }
      }

      closeModal();
    } catch (error: unknown) {
      toast.error("Erro ao salvar manutenção: " + getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteMaintenance = async (e: React.MouseEvent, maintenance: any) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Excluir a manutenção "${maintenance.servico}"?`);
    if (!confirmed) return;

    try {
      await maintenanceService.remove(maintenance.id);
      toast.success("Manutenção excluída com sucesso");
    } catch (error: unknown) {
      toast.error("Erro ao excluir manutenção: " + getErrorMessage(error));
    }
  };

  if (loadingMaintenances || loadingVehicles) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Topbar 
        title="Manutenção" 
        subtitle="Histórico completo da oficina"
        onCreate={openCreateModal}
        createLabel="Registrar Manutenção"
        helpPath="/ajuda/gestao/manutencao"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 mb-6 md:mb-8">
        <div className="col-span-2 md:col-span-1 neu p-4 md:p-6 animate-blur-in transition-shadow duration-200 shadow-sm shadow-gray-200 hover:shadow-md hover:shadow-gray-400/40">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Gasto total</div>
          <div className="font-display text-2xl md:text-3xl font-bold mt-2 tabular-nums">
            R$ <span ref={totalRef}>0,00</span>
          </div>
        </div>
        <div className="neu p-4 md:p-6 animate-blur-in delay-75 transition-shadow duration-200 shadow-sm shadow-gray-200 hover:shadow-md hover:shadow-gray-400/40 min-w-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground leading-tight">Serviços realizados</div>
          <div className="font-display text-2xl md:text-3xl font-bold mt-2 tabular-nums"><span ref={servicosRef}>0</span></div>
        </div>
        <div className="neu p-4 md:p-6 animate-blur-in delay-150 transition-shadow duration-200 shadow-sm shadow-gray-200 hover:shadow-md hover:shadow-gray-400/40 flex items-center justify-between min-w-0">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground leading-tight">Em oficina</div>
            <div className="font-display text-2xl md:text-3xl font-bold mt-2 text-warning tabular-nums"><span ref={emOficinaRef}>0</span></div>
          </div>
          {/* <button 
            className="neu-interactive px-4 py-2.5 text-sm font-medium flex items-center gap-2"
            onClick={openCreateModal}
          >
            <Plus className="w-4 h-4" /> Registrar
          </button> */}
        </div>
      </div>

      {/* Lista mobile */}
      <ul className="md:hidden space-y-3 animate-blur-in">
        {maintenances.map((m: any) => {
          const v = m.carcontrol_vehicles;
          return (
            <li key={m.id} className="neu p-4">
              <button type="button" className="w-full text-left" onClick={() => openDetailsModal(m)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug break-words flex items-center gap-1.5">
                      {m.servico}
                      {m.photo_url && <Camera className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {v ? `${v.modelo} · ${v.placa}` : "Sem veículo"}
                    </p>
                  </div>
                  <span className="font-display font-bold tabular-nums shrink-0">{fmtBRL(m.valor)}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium capitalize ${
                    m.tipo === 'preventiva' ? 'bg-emerald-100 text-emerald-700' :
                    m.tipo === 'corretiva' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {m.tipo}
                  </span>
                  <span>{m.data ? fmtDate(m.data) : "—"}</span>
                  {m.km_atual ? <span className="tabular-nums">{m.km_atual.toLocaleString("pt-BR")} km</span> : null}
                  {m.oficina && <span className="truncate max-w-full">{m.oficina}</span>}
                </div>
              </button>
              <div className="mt-3 flex items-center justify-end gap-2 border-t border-border/60 pt-3">
                <Button size="sm" variant="outline" className="h-10 flex-1" onClick={(e) => openEditModal(e, m)}>
                  <Edit3 className="w-4 h-4" /> Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 w-10 p-0 text-danger hover:text-danger hover:bg-danger/10"
                  aria-label="Excluir manutenção"
                  onClick={(e) => deleteMaintenance(e, m)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </li>
          );
        })}
        {maintenances.length === 0 && (
          <li className="neu p-10 text-center text-muted-foreground">Nenhum histórico de manutenção</li>
        )}
      </ul>

      {/* Tabela de Manutenções */}
      <div className="hidden md:block neu overflow-x-auto animate-blur-in">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Veículo</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Oficina</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>KM Atual</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {maintenances.map((m: any) => {
              const v = m.carcontrol_vehicles;
              return (
                <TableRow 
                  key={m.id} 
                  className="hover:bg-muted/40 cursor-pointer transition-colors group"
                  onClick={() => openDetailsModal(m)}
                >
                  <TableCell className="font-medium">
                    {v ? (
                      <div>
                        <div className="font-medium text-sm">{v.modelo}</div>
                        <div className="font-mono text-xs text-muted-foreground">{v.placa}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem veículo</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium group-hover:text-primary transition-colors flex items-center gap-2">
                    {m.servico}
                    {m.photo_url && <Camera className="w-3.5 h-3.5 text-muted-foreground" />}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      m.tipo === 'preventiva' ? 'bg-emerald-100 text-emerald-700' :
                      m.tipo === 'corretiva' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {m.tipo}
                    </span>
                  </TableCell>
                  <TableCell>{m.oficina}</TableCell>
                  <TableCell>{m.data ? fmtDate(m.data) : "—"}</TableCell>
                  <TableCell>
                    {m.km_atual ? m.km_atual.toLocaleString("pt-BR") + " km" : "—"}
                  </TableCell>
                  <TableCell className="font-semibold">{fmtBRL(m.valor)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => { e.stopPropagation(); openDetailsModal(m); }}
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => openEditModal(e, m)}
                      >
                        <Edit3 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-danger hover:text-danger hover:bg-danger/10"
                        onClick={(e) => deleteMaintenance(e, m)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {maintenances.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  Nenhum histórico de manutenção
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <DialogTitle className="sr-only">Detalhes da manutencao</DialogTitle>
          {viewingMaintenance && (
            <div className="flex flex-col">
              <div className="bg-gradient-to-br from-primary/10 via-background to-background p-5 pr-12 sm:p-8 border-b border-primary/5">
                <div className="flex justify-between items-start mb-5 sm:mb-6">
                  <div className="min-w-0">
                    <Badge variant="outline" className={`mb-3 uppercase tracking-widest text-[10px] font-bold ${
                      viewingMaintenance.tipo === 'preventiva' ? 'border-success/30 text-success bg-success/5' :
                      viewingMaintenance.tipo === 'corretiva' ? 'border-warning/30 text-warning bg-warning/5' :
                      'border-danger/30 text-danger bg-danger/5'
                    }`}>
                      Manutenção {viewingMaintenance.tipo}
                    </Badge>
                    <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight leading-tight sm:leading-none text-foreground uppercase break-words">
                      {viewingMaintenance.servico}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Data</span>
                    <p className="font-medium">{fmtDate(viewingMaintenance.data)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Valor</span>
                    <p className="font-bold text-primary">{fmtBRL(viewingMaintenance.valor)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">KM Atual</span>
                    <p className="font-medium">{viewingMaintenance.km_atual?.toLocaleString() || "—"} km</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Próxima Revisão</span>
                    <p className="font-medium">{viewingMaintenance.proximo_km?.toLocaleString() || "—"} km</p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 bg-background">
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Veículo & Oficina</h4>
                      <div className="neu-sm p-4 bg-muted/30 border-none space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Wrench className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{viewingMaintenance.carcontrol_vehicles?.modelo}</p>
                            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{viewingMaintenance.carcontrol_vehicles?.placa}</p>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-border/50">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Local da Manutenção</p>
                          <p className="text-sm font-medium">{viewingMaintenance.oficina}</p>
                        </div>
                      </div>
                    </div>

                    {viewingMaintenance.observacoes && (
                      <div>
                        <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Observações Adicionais</h4>
                        <div className="neu-sm p-4 bg-muted/30 border-none">
                          <p className="text-sm text-muted-foreground leading-relaxed italic">
                            "{viewingMaintenance.observacoes}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Registro Fotográfico</h4>
                    {viewingMaintenance.photo_url ? (
                      <div className="group relative rounded-3xl overflow-hidden border border-border/50 shadow-neu-sm aspect-[4/3] bg-muted/20">
                        <img 
                          src={viewingMaintenance.photo_url} 
                          alt="Comprovante" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 flex items-end justify-end p-3 transition-opacity md:items-center md:justify-center md:p-0 md:bg-black/40 md:opacity-0 md:group-hover:opacity-100">
                          <a 
                            href={viewingMaintenance.photo_url} 
                            target="_blank" 
                            rel="noreferrer"
                            aria-label="Abrir foto em nova aba"
                            className="bg-black/50 md:bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/40 transition-colors"
                          >
                            <ExternalLink className="w-6 h-6 text-white" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/50 aspect-[4/3] bg-muted/10 text-muted-foreground gap-2">
                        <Camera className="w-8 h-8 opacity-20" />
                        <p className="text-xs font-medium opacity-40">Nenhuma foto anexada</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/50 [&>button]:flex-1 sm:[&>button]:flex-none [&>button]:h-11 sm:[&>button]:h-10">
                  <Button 
                    variant="outline" 
                    className="rounded-xl font-bold uppercase tracking-widest text-[10px]"
                    onClick={(e) => { setIsDetailsOpen(false); openEditModal(e as any, viewingMaintenance); }}
                  >
                    Editar Registro
                  </Button>
                  <Button 
                    className="rounded-xl font-bold uppercase tracking-widest text-[10px]"
                    onClick={() => setIsDetailsOpen(false)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Criar/Editar */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[83vh] w-full overflow-hidden sm:max-h-[90vh] max-w-[42rem] p-0 rounded-3xl border-none shadow-2xl">
          <DialogHeader className="p-5 pb-0 pr-12 sm:p-8 sm:pb-0">
            <DialogTitle className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight">
              {selectedMaintenance ? "Editar Manutenção" : "Registrar Manutenção"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              {selectedMaintenance
                ? "Atualize os dados da manutenção e salve as alterações."
                : "Preencha os campos para registrar uma nova manutenção na frota."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="sm:max-h-[calc(83vh-11rem)] px-5 sm:px-8 py-4">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle_id" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Veículo *</Label>
                  <Select
                    value={formData.vehicle_id}
                    onValueChange={(value) => handleFieldChange("vehicle_id", value)}
                  >
                    <SelectTrigger id="vehicle_id" className="bg-white border-none shadow-neu-sm rounded-xl h-12 focus:ring-primary/20">
                      <SelectValue placeholder="Selecione o veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle: any) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.modelo} - {vehicle.placa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo de Serviço *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: "preventiva" | "corretiva" | "emergencial") => 
                      handleFieldChange("tipo", value)
                    }
                  >
                    <SelectTrigger id="tipo" className="bg-white border-none shadow-neu-sm rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventiva">Preventiva</SelectItem>
                      <SelectItem value="corretiva">Corretiva</SelectItem>
                      <SelectItem value="emergencial">Emergencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Data do Serviço *</Label>
                  <Input
                    id="data"
                    type="date"
                    className="bg-white border-none shadow-neu-sm rounded-xl h-12"
                    value={formData.data}
                    onChange={(e) => handleFieldChange("data", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Valor Gasto (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    className="bg-white border-none shadow-neu-sm rounded-xl h-12"
                    placeholder="0,00"
                    value={formData.valor}
                    onChange={(e) => handleFieldChange("valor", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="servico" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Descrição do Serviço *</Label>
                <Input
                  id="servico"
                  className="bg-white border-none shadow-neu-sm rounded-xl h-12"
                  placeholder="Ex: Troca de óleo, Revisão completa..."
                  value={formData.servico}
                  onChange={(e) => handleFieldChange("servico", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="oficina" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome da Oficina / Mecânico *</Label>
                <Input
                  id="oficina"
                  className="bg-white border-none shadow-neu-sm rounded-xl h-12"
                  placeholder="Onde o serviço foi realizado?"
                  value={formData.oficina}
                  onChange={(e) => handleFieldChange("oficina", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="km_atual" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">KM Atual do Veículo</Label>
                  <Input
                    id="km_atual"
                    type="number"
                    className="bg-white border-none shadow-neu-sm rounded-xl h-12"
                    placeholder="Ex: 50000"
                    value={formData.km_atual}
                    onChange={(e) => handleFieldChange("km_atual", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proximo_km" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">KM Próxima Revisão</Label>
                  <Input
                    id="proximo_km"
                    type="number"
                    className="bg-white border-none shadow-neu-sm rounded-xl h-12"
                    placeholder="Ex: 60000"
                    value={formData.proximo_km}
                    onChange={(e) => handleFieldChange("proximo_km", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Anexar Foto da Manutenção / Comprovante</Label>
                <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-border/50 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all bg-muted/10 group"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handlePhotoChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                    <Camera className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-primary">Toque para selecionar foto</span>
                    <span className="text-[10px] text-muted-foreground/60 uppercase tracking-tighter">Máximo 5MB</span>
                  </div>

                  {photoPreview && (
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-border shadow-neu-sm">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={removePhoto}
                        aria-label="Remover foto"
                        className="absolute top-1 right-1 bg-black/60 p-2 rounded-full text-white hover:bg-black transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Observações e Notas</Label>
                <Textarea
                  id="observacoes"
                  className="bg-white border-none shadow-neu-sm rounded-2xl focus:ring-primary/10"
                  placeholder="Algum detalhe importante sobre a manutenção?"
                  rows={3}
                  value={formData.observacoes}
                  onChange={(e) => handleFieldChange("observacoes", e.target.value)}
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2 p-5 pt-4 sm:p-8 sm:pt-4 [&>button]:h-11 sm:[&>button]:h-10">
            <Button variant="ghost" onClick={closeModal} type="button" className="rounded-xl font-bold uppercase tracking-widest text-[10px]">
              Cancelar
            </Button>
            <Button 
              onClick={saveMaintenance} 
              disabled={isSaving}
              className="rounded-xl font-bold uppercase tracking-widest text-[10px] min-w-[140px] shadow-neu-accent"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Salvando...
                </span>
              ) : selectedMaintenance ? "Atualizar Registro" : "Salvar Manutenção"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default Manutencao;
