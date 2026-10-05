import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { VehicleCard } from "@/components/VehicleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Filter, Plus, Loader2, Info, LayoutGrid, Table as TableIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/integrations/supabase/auth";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { fmtBRL } from "@/lib/utils";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { veiculoSchema, VeiculoInput } from "@/lib/validators/veiculo";
import { marcas } from "@/data/marcasModelos";
import { kmHistoryService } from "@/integrations/supabase/services/kmHistoryService";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Vehicle = Tables<"carcontrol_vehicles">;
type VehicleInsert = TablesInsert<"carcontrol_vehicles">;
type Schedule = Tables<"carcontrol_parcela_seguro_schedules">;

type VehicleFormValues = VehicleInsert & { id?: string };

const filters = [
  { key: "todos", label: "Todos" },
  { key: "alugado", label: "Alugados" },
  { key: "disponivel", label: "Disponíveis" },
  { key: "oficina", label: "Oficina" },
] as const;

const statusOptions = [
  { value: "disponivel", label: "Disponível" },
  { value: "alugado", label: "Alugado" },
  { value: "oficina", label: "Na oficina" },
  { value: "bloqueado", label: "Bloqueado" },
];

// Constante de cores de veículos
const CORES_VEICULOS = [
  { value: "branco", label: "Branco" },
  { value: "preto", label: "Preto" },
  { value: "prata", label: "Prata" },
  { value: "cinza", label: "Cinza" },
  { value: "vermelho", label: "Vermelho" },
  { value: "azul", label: "Azul" },
  { value: "verde", label: "Verde" },
  { value: "amarelo", label: "Amarelo" },
  { value: "laranja", label: "Laranja" },
  { value: "marrom", label: "Marrom" },
  { value: "bege", label: "Bege" },
  { value: "dourado", label: "Dourado" },
  { value: "outro", label: "Outro" },
];

const initialFormValues: VehicleFormValues = {
  marca: "",
  modelo: "",
  ano: new Date().getFullYear(),
  placa: "",
  cor: "",
  status: "disponivel",
  km_atual: 0,
  km_inicial: 0,
  parcela: 0,
  parcelas_restantes: 0,
  banco: "",
  seguro: 0,
  vencimento_parcela: new Date().toISOString().slice(0, 10),
  vencimento_seguro: new Date().toISOString().slice(0, 10),
  photo_urls: [],
  documento_url: "",
};

const VEHICLE_PHOTOS_BUCKET = "vehicle-photos";
const VEHICLE_DOCUMENTS_BUCKET = "vehicle-documents";

const Veiculos = () => {
  const [active, setActive] = useState<typeof filters[number]["key"]>("todos");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formValues, setFormValues] = useState<VehicleFormValues>(initialFormValues);
  const form = useForm<VeiculoInput>({
    resolver: zodResolver(veiculoSchema),
    values: {
      marca: formValues.marca,
      modelo: formValues.modelo,
      placa: formValues.placa,
      vencimento_parcela: formValues.vencimento_parcela,
      vencimento_seguro: formValues.vencimento_seguro,
      ano: formValues.ano?.toString() || '',
      cor: formValues.cor,
    },
  });
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehiclePhotos, setVehiclePhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [existingDocumentUrl, setExistingDocumentUrl] = useState<string | null>(null);
  const { session } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("carcontrol_vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar veículos: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar programações ativas de um veículo específico
  const fetchSchedulesForVehicle = async (vehicleId: string) => {
    try {
      setIsLoadingSchedules(true);
      const { data, error } = await supabase
        .from("carcontrol_parcela_seguro_schedules")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .eq("ativo", true);

      if (error) throw error;
      setSchedules(data || []);
      return data || [];
    } catch (error: any) {
      toast.error("Erro ao carregar programações: " + error.message);
      return [];
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  // Função para calcular próximo vencimento baseado na programação
  const calcularProximoVencimento = (schedule: Schedule): string => {
    const hoje = new Date();
    const dataInicio = new Date(schedule.data_inicio);
    
    if (schedule.tipo_recorrencia === "mensal" && schedule.dia_mes) {
      const proximoVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), schedule.dia_mes);
      
      // Se o dia já passou neste mês, pegar o próximo mês
      if (proximoVencimento < hoje) {
        proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);
      }
      
      return proximoVencimento.toISOString().slice(0, 10);
    }
    
    if (schedule.tipo_recorrencia === "semanal" && schedule.dia_semana !== null) {
      const diaAtual = hoje.getDay();
      const diasAteProximo = (schedule.dia_semana - diaAtual + 7) % 7;
      const proximoVencimento = new Date(hoje);
      proximoVencimento.setDate(hoje.getDate() + (diasAteProximo === 0 ? 7 : diasAteProximo));
      
      return proximoVencimento.toISOString().slice(0, 10);
    }
    
    // Fallback: retornar data de início se não conseguir calcular
    return dataInicio.toISOString().slice(0, 10);
  };

  // Função para preencher campos automáticos baseado nas programações
  const preencherCamposAutomaticos = (schedulesList: Schedule[]) => {
    const parcelaSchedule = schedulesList.find(s => s.tipo === "parcela");
    const seguroSchedule = schedulesList.find(s => s.tipo === "seguro");

    const updates: Partial<VehicleFormValues> = {};

    if (parcelaSchedule) {
      updates.parcela = parcelaSchedule.valor;
      updates.vencimento_parcela = calcularProximoVencimento(parcelaSchedule);
      // Calcular parcelas restantes baseado em data_fim
      if (parcelaSchedule.data_fim) {
        const hoje = new Date();
        const dataFim = new Date(parcelaSchedule.data_fim);
        const mesesRestantes = Math.max(0, Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        updates.parcelas_restantes = mesesRestantes;
      }
    } else {
      updates.parcela = 0;
      updates.parcelas_restantes = 0;
    }

    if (seguroSchedule) {
      updates.seguro = seguroSchedule.valor;
      updates.vencimento_seguro = calcularProximoVencimento(seguroSchedule);
    } else {
      updates.seguro = 0;
    }

    setFormValues(prev => ({ ...prev, ...updates }));
  };

  const openCreateModal = () => {
    setSelectedVehicle(null);
    setFormValues(initialFormValues);
    setExistingPhotos([]);
    setVehiclePhotos([]);
    setDocumentFile(null);
    setExistingDocumentUrl(null);
    setIsFormOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormValues({ ...vehicle });
    setExistingPhotos(vehicle.photo_urls ?? []);
    setVehiclePhotos([]);
    setDocumentFile(null);
    setExistingDocumentUrl(vehicle.documento_url ?? null);
    setIsFormOpen(true);
    
    // Buscar programações do veículo e preencher campos automáticos
    if (vehicle.id) {
      fetchSchedulesForVehicle(vehicle.id).then(schedulesList => {
        if (schedulesList.length > 0) {
          preencherCamposAutomaticos(schedulesList);
        }
      });
    }
  };

  const closeModal = () => {
    setSelectedVehicle(null);
    setFormValues(initialFormValues);
    setExistingPhotos([]);
    setVehiclePhotos([]);
    setDocumentFile(null);
    setExistingDocumentUrl(null);
    setSchedules([]);
    setIsFormOpen(false);
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

  const handleFieldChange = (field: keyof VehicleFormValues, value: string | number) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleCurrencyFieldChange = (field: keyof VehicleFormValues, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: parseBRL(value) }));
  };

  const getPhotoStoragePath = (photoUrl: string) => {
    try {
      const url = new URL(photoUrl);
      const prefix = `/storage/v1/object/public/${VEHICLE_PHOTOS_BUCKET}/`;
      return url.pathname.includes(prefix) ? url.pathname.replace(prefix, "") : "";
    } catch {
      return "";
    }
  };

  const getFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

  const handlePhotoFilesChange = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const totalSelected = existingPhotos.length + vehiclePhotos.length + newFiles.length;

    if (totalSelected > 5) {
      toast.error("O limite é de 5 fotos por veículo.");
      return;
    }

    setVehiclePhotos(prev => {
      const existingKeys = new Set(prev.map(getFileKey));
      const mergedFiles = [...prev];

      newFiles.forEach(file => {
        const key = getFileKey(file);
        if (!existingKeys.has(key)) {
          existingKeys.add(key);
          mergedFiles.push(file);
        }
      });

      return mergedFiles;
    });
  };

  const removeExistingPhoto = async (photoUrl: string) => {
    try {
      const path = getPhotoStoragePath(photoUrl);
      if (!path) throw new Error("Caminho de storage inválido para remoção");

      const { error } = await supabase.storage.from(VEHICLE_PHOTOS_BUCKET).remove([path]);
      if (error) throw error;

      setExistingPhotos(prev => prev.filter(url => url !== photoUrl));
      setFormValues(prev => ({ ...prev, photo_urls: prev.photo_urls?.filter(url => url !== photoUrl) || [] }));
      toast.success("Foto removida com sucesso");
    } catch (error: any) {
      toast.error("Erro ao remover foto: " + error.message);
    }
  };

  const removePendingPhoto = (fileKey: string) => {
    setVehiclePhotos(prev => prev.filter(file => getFileKey(file) !== fileKey));
  };

  const getDocumentStoragePath = (url: string) => {
    try {
      const parsed = new URL(url);
      const prefix = `/storage/v1/object/public/${VEHICLE_DOCUMENTS_BUCKET}/`;
      return parsed.pathname.includes(prefix) ? parsed.pathname.replace(prefix, "") : "";
    } catch {
      return "";
    }
  };

  const handleDocumentFileChange = (file: File | null) => {
    if (!file) { setDocumentFile(null); return; }
    if (file.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são aceitos.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("O documento deve ter no máximo 5MB.");
      return;
    }
    setDocumentFile(file);
  };

  const removeExistingDocument = async () => {
    if (!existingDocumentUrl || !selectedVehicle?.id) return;
    try {
      const path = getDocumentStoragePath(existingDocumentUrl);
      if (path) {
        await supabase.storage.from(VEHICLE_DOCUMENTS_BUCKET).remove([path]);
      }
      const { error } = await supabase
        .from("carcontrol_vehicles")
        .update({ documento_url: null, updated_at: new Date().toISOString() })
        .eq("id", selectedVehicle.id);

      if (error) throw error;
      setExistingDocumentUrl(null);
      setFormValues(prev => ({ ...prev, documento_url: "" }));
      toast.success("Documento removido com sucesso");
    } catch (error: any) {
      toast.error("Erro ao remover documento: " + error.message);
    }
  };

  const saveVehicle = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const totalPhotos = existingPhotos.length + vehiclePhotos.length;
    if (totalPhotos > 5) {
      toast.error("O limite é de 5 fotos por veículo.");
      return;
    }

    try {
      setIsSaving(true);
      const dataToSave: VehicleInsert = {
        marca: formValues.marca,
        modelo: formValues.modelo,
        ano: Number(formValues.ano),
        placa: formValues.placa,
        cor: formValues.cor,
        status: formValues.status,
        km_atual: Number(formValues.km_atual),
        km_inicial: Number(formValues.km_inicial),
        parcela: Number(formValues.parcela),
        parcelas_restantes: Number(formValues.parcelas_restantes),
        banco: formValues.banco,
        seguro: Number(formValues.seguro),
        vencimento_parcela: formValues.vencimento_parcela,
        vencimento_seguro: formValues.vencimento_seguro,
        photo_urls: existingPhotos,
      };

      const commonPayload = {
        ...dataToSave,
        user_id: selectedVehicle?.user_id ?? session?.user?.id ?? undefined,
      };

      const uploadNewPhotos = async (vehicleId: string, currentUrls: string[] = []) => {
        if (vehiclePhotos.length === 0) return currentUrls;

        const uploadedUrls: string[] = [];
        for (const file of vehiclePhotos) {
          const fileName = `${crypto.randomUUID()}-${file.name}`;
          const filePath = `${vehicleId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from(VEHICLE_PHOTOS_BUCKET)
            .upload(filePath, file, { cacheControl: "3600", upsert: false });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from(VEHICLE_PHOTOS_BUCKET)
            .getPublicUrl(filePath);

          uploadedUrls.push(publicUrlData.publicUrl);
        }

        return [...currentUrls, ...uploadedUrls];
      };

      const finalizeVehicleUpdate = async (vehicleId: string, urls: string[]) => {
        const { data, error } = await supabase
          .from("carcontrol_vehicles")
          .update({ photo_urls: urls })
          .eq("id", vehicleId)
          .select()
          .single();

        if (error) throw error;
        return data;
      };

      const uploadDocument = async (vehicleId: string) => {
        if (!documentFile) return;
        const ext = documentFile.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const filePath = `${vehicleId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(VEHICLE_DOCUMENTS_BUCKET)
          .upload(filePath, documentFile, { cacheControl: "3600", upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from(VEHICLE_DOCUMENTS_BUCKET)
          .getPublicUrl(filePath);

        const { error: updateError } = await supabase
          .from("carcontrol_vehicles")
          .update({ documento_url: publicUrlData.publicUrl, updated_at: new Date().toISOString() })
          .eq("id", vehicleId);

        if (updateError) throw updateError;
      };

      if (selectedVehicle?.id) {
        const { data, error } = await supabase
          .from("carcontrol_vehicles")
          .update(commonPayload)
          .eq("id", selectedVehicle.id)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const savedVehicle = data;
          const finalUrls = await uploadNewPhotos(savedVehicle.id, existingPhotos);
          const updatedVehicle = finalUrls.length
            ? await finalizeVehicleUpdate(savedVehicle.id, finalUrls)
            : savedVehicle;

          await uploadDocument(savedVehicle.id);

          setVehicles(prev => prev.map(v => (v.id === updatedVehicle.id ? updatedVehicle : v)));
          toast.success("Veículo atualizado com sucesso");

          // Registrar KM no histórico se foi alterado
          const companyId = (selectedVehicle as any).company_id || (savedVehicle as any).company_id;
          if (companyId && Number(formValues.km_atual) > 0) {
            await kmHistoryService.record({
              company_id: companyId,
              vehicle_id: savedVehicle.id,
              km: Number(formValues.km_atual),
              source: 'manual_edit',
              userId: session?.user?.id,
            });
            await kmHistoryService.updateVehicleKm(savedVehicle.id, Number(formValues.km_atual));
          }
        } else {
          toast.error("Veículo não encontrado para atualização.");
        }
      } else {
        const { data, error } = await supabase
          .from("carcontrol_vehicles")
          .insert(commonPayload)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const savedVehicle = data;
          const finalUrls = await uploadNewPhotos(savedVehicle.id, existingPhotos);
          const updatedVehicle = finalUrls.length
            ? await finalizeVehicleUpdate(savedVehicle.id, finalUrls)
            : savedVehicle;

          await uploadDocument(savedVehicle.id);

          setVehicles(prev => [updatedVehicle, ...(prev || [])]);
          toast.success("Veículo cadastrado com sucesso");

          // Registrar KM inicial no histórico
          const companyId = (savedVehicle as any).company_id;
          if (companyId && Number(formValues.km_atual) > 0) {
            await kmHistoryService.record({
              company_id: companyId,
              vehicle_id: savedVehicle.id,
              km: Number(formValues.km_atual),
              source: 'manual_edit',
              userId: session?.user?.id,
            });
            await kmHistoryService.updateVehicleKm(savedVehicle.id, Number(formValues.km_atual));
          }
        } else {
          toast.error("Erro inesperado ao cadastrar veículo.");
        }
      }

      closeModal();
    } catch (error: any) {
      toast.error("Erro ao salvar veículo: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteVehicle = async (vehicle: Vehicle) => {
    const confirmed = window.confirm(`Excluir o veículo ${vehicle.modelo} (${vehicle.placa})?`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("carcontrol_vehicles")
        .delete()
        .eq("id", vehicle.id);

      if (error) throw error;
      setVehicles(prev => prev.filter(v => v.id !== vehicle.id));
      toast.success("Veículo excluído com sucesso");
    } catch (error: any) {
      toast.error("Erro ao excluir veículo: " + error.message);
    }
  };

  const list = vehicles.filter(v => active === "todos" || v.status === active);

  return (
    <AppShell>
      <Topbar
        title="Veículos"
        subtitle={`${vehicles.length} veículos cadastrados na sua frota`}
        onCreate={openCreateModal}
        createLabel="Novo registro"
        helpPath="/ajuda/gestao/veiculos"
      />

      <div className="flex flex-wrap items-center gap-3 mb-6 animate-blur-in">
        <div className="neu-sm p-1.5 flex gap-1">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActive(f.key)}
              className={`px-4 py-2 text-sm rounded-xl font-medium transition-all ${
                active === f.key ? "neu-press text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button className="neu-interactive px-4 py-2.5 flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4" /> Filtros
        </button>
        
        {/* Botões de alternância de visualização */}
        <div className="neu-sm p-1.5 flex gap-1">
          <button
            onClick={() => setViewMode("cards")}
            className={`px-3 py-2 text-sm rounded-xl font-medium transition-all flex items-center gap-2 ${
              viewMode === "cards" ? "neu-press text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Visualização em cards"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Cards</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-2 text-sm rounded-xl font-medium transition-all flex items-center gap-2 ${
              viewMode === "table" ? "neu-press text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Visualização em tabela"
          >
            <TableIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Tabela</span>
          </button>
        </div>
        
        <button
          type="button"
          className="neu-interactive ml-auto px-4 py-2.5 flex items-center gap-2 text-sm font-medium"
          onClick={openCreateModal}
        >
          <Plus className="w-4 h-4" /> Cadastrar veículo
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {list.map((v, i) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              delay={`delay-${(i % 4) * 75}`}
              onEdit={openEditModal}
              onDelete={deleteVehicle}
            />
          ))}
        </div>
      ) : (
        <div className="neu rounded-3xl overflow-hidden animate-blur-in">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">Marca/Modelo</TableHead>
                  <TableHead className="font-bold">Placa</TableHead>
                  <TableHead className="font-bold">Ano</TableHead>
                  <TableHead className="font-bold">Cor</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold text-right">KM Atual</TableHead>
                  <TableHead className="font-bold text-right">Parcelas</TableHead>
                  <TableHead className="font-bold text-right">Banco</TableHead>
                  <TableHead className="font-bold text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum veículo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((v) => {
                    const statusColors = {
                      disponivel: "bg-green-500/10 text-green-700 border-green-200",
                      alugado: "bg-blue-500/10 text-blue-700 border-blue-200",
                      oficina: "bg-orange-500/10 text-orange-700 border-orange-200",
                      bloqueado: "bg-red-500/10 text-red-700 border-red-200",
                    };
                    
                    const statusLabels = {
                      disponivel: "Disponível",
                      alugado: "Alugado",
                      oficina: "Na oficina",
                      bloqueado: "Bloqueado",
                    };

                    return (
                      <TableRow key={v.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase">{v.marca}</span>
                            <span className="font-semibold">{v.modelo}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono font-semibold">{v.placa}</span>
                        </TableCell>
                        <TableCell>{v.ano}</TableCell>
                        <TableCell className="capitalize">{v.cor}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={statusColors[v.status as keyof typeof statusColors] || ""}
                          >
                            {statusLabels[v.status as keyof typeof statusLabels] || v.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {v.km_atual.toLocaleString()} km
                        </TableCell>
                        <TableCell className="text-right">
                          {v.parcelas_restantes > 0 ? `${v.parcelas_restantes} parc.` : "Quitado"}
                        </TableCell>
                        <TableCell className="text-right">{v.banco}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(v)}
                              className="h-8 px-3"
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteVehicle(v)}
                              className="h-8 px-3"
                            >
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[83vh] w-full overflow-hidden sm:max-h-[90vh] max-w-[42rem]">
          <DialogHeader>
            <DialogTitle>{selectedVehicle ? "Editar veículo" : "Cadastrar veículo"}</DialogTitle>
            <DialogDescription>
              {selectedVehicle
                ? "Atualize os dados do veículo e salve as alterações."
                : "Preencha os campos para cadastrar um novo veículo na frota."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(83vh-11rem)] overflow-hidden rounded-3xl border border-primary/10 bg-background/90 p-1 shadow-sm">
            <div className="grid gap-4 p-3">
              <div>
                <Label htmlFor="marca">Marca</Label>
                <Select
                  value={formValues.marca ?? ""}
                  onValueChange={value => {
                    handleFieldChange("marca", value);
                    handleFieldChange("modelo", "");
                  }}
                >
                  <SelectTrigger id="marca" className="bg-white border border-input">
                    <SelectValue placeholder="Selecione a marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {marcas.map(m => (
                      <SelectItem key={m.nome} value={m.nome}>{m.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="modelo">Modelo</Label>
                <Select
                  value={formValues.modelo ?? ""}
                  onValueChange={value => handleFieldChange("modelo", value)}
                  disabled={!formValues.marca}
                >
                  <SelectTrigger id="modelo" className="bg-white border border-input">
                    <SelectValue placeholder={formValues.marca ? "Selecione o modelo" : "Escolha a marca primeiro"} />
                  </SelectTrigger>
                  <SelectContent>
                    {marcas.find(m => m.nome === formValues.marca)?.modelos.map(mod => (
                      <SelectItem key={mod} value={mod}>{mod}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ano">Ano</Label>
                <Input
                  id="ano"
                  type="number"
                  className="bg-white"
                  value={formValues.ano ?? ""}
                  onChange={e => handleFieldChange("ano", Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="placa">Placa</Label>
                <Input
                  id="placa"
                  className="bg-white"
                  value={formValues.placa ?? ""}
                  onChange={e => handleFieldChange("placa", e.target.value.toUpperCase())}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cor">Cor</Label>
                <Select
                  value={formValues.cor ?? ""}
                  onValueChange={value => handleFieldChange("cor", value)}
                >
                  <SelectTrigger id="cor" className="bg-white border border-input">
                    <SelectValue placeholder="Selecione a cor" />
                  </SelectTrigger>
                  <SelectContent>
                    {CORES_VEICULOS.map(cor => (
                      <SelectItem key={cor.value} value={cor.value}>
                        {cor.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formValues.status ?? "disponivel"}
                  onValueChange={value => handleFieldChange("status", value)}
                >
                  <SelectTrigger id="status" className="bg-white border border-input" />
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="km_atual">KM atual</Label>
                <Input
                  id="km_atual"
                  type="number"
                  className="bg-white"
                  value={formValues.km_atual ?? ""}
                  onChange={e => handleFieldChange("km_atual", Number(e.target.value))}
                  disabled={!selectedVehicle}
                />
                {!selectedVehicle && (
                  <p className="text-xs text-muted-foreground mt-1">
                    KM atual só pode ser atualizado ao editar o veículo
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="km_inicial">KM inicial</Label>
                <Input
                  id="km_inicial"
                  type="number"
                  className="bg-white"
                  value={formValues.km_inicial ?? ""}
                  onChange={e => handleFieldChange("km_inicial", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor="parcela">Valor da parcela (R$)</Label>
                  {schedules.some(s => s.tipo === "parcela") && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <Info className="w-3 h-3" />
                      <span>Auto</span>
                    </div>
                  )}
                </div>
                <Input
                  id="parcela"
                  type="text"
                  inputMode="decimal"
                  className="bg-white"
                  placeholder="R$ 0,00"
                  value={formatCurrency(formValues.parcela ?? 0)}
                  onChange={e => handleCurrencyFieldChange("parcela", e.target.value)}
                  disabled={!selectedVehicle || schedules.some(s => s.tipo === "parcela")}
                />
                {!selectedVehicle ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Campo gerenciado por programações de pagamento
                  </p>
                ) : schedules.some(s => s.tipo === "parcela") && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Valor preenchido automaticamente da programação de parcela
                  </p>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor="parcelas_restantes">Parcelas restantes</Label>
                  {schedules.some(s => s.tipo === "parcela") && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <Info className="w-3 h-3" />
                      <span>Auto</span>
                    </div>
                  )}
                </div>
                <Input
                  id="parcelas_restantes"
                  type="number"
                  className="bg-white"
                  value={formValues.parcelas_restantes ?? ""}
                  onChange={e => handleFieldChange("parcelas_restantes", Number(e.target.value))}
                  disabled={!selectedVehicle || schedules.some(s => s.tipo === "parcela")}
                />
                {!selectedVehicle ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Campo gerenciado por programações de pagamento
                  </p>
                ) : schedules.some(s => s.tipo === "parcela") && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculado automaticamente baseado na data fim da programação
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="banco">Banco</Label>
                <Input
                  id="banco"
                  className="bg-gray-100 cursor-not-allowed"
                  value={formValues.banco ?? ""}
                  readOnly
                  disabled
                  title="Este campo é gerenciado pela programação de pagamento e não pode ser editado"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Campo gerenciado por programações de pagamento
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor="seguro">Seguro (R$)</Label>
                  {schedules.some(s => s.tipo === "seguro") && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <Info className="w-3 h-3" />
                      <span>Auto</span>
                    </div>
                  )}
                </div>
                <Input
                  id="seguro"
                  type="text"
                  inputMode="decimal"
                  className="bg-white"
                  placeholder="R$ 0,00"
                  value={formatCurrency(formValues.seguro ?? 0)}
                  onChange={e => handleCurrencyFieldChange("seguro", e.target.value)}
                  disabled={!selectedVehicle || schedules.some(s => s.tipo === "seguro")}
                />
                {!selectedVehicle ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Campo gerenciado por programações de pagamento
                  </p>
                ) : schedules.some(s => s.tipo === "seguro") && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Valor preenchido automaticamente da programação de seguro
                  </p>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="photo_upload">Fotos do veículo</Label>
                <span className="text-xs text-muted-foreground">
                  {existingPhotos.length + vehiclePhotos.length}/5 selecionadas
                </span>
              </div>
              <Input
                id="photo_upload"
                type="file"
                accept="image/*"
                multiple
                className="bg-white"
                onChange={e => handlePhotoFilesChange(e.target.files)}
                disabled={existingPhotos.length + vehiclePhotos.length >= 5}
              />
              <div className="mt-3 grid grid-cols-2 gap-3">
                {existingPhotos.map(url => (
                  <div key={url} className="relative overflow-hidden rounded-2xl border border-border/80 bg-slate-50">
                    <img src={url} alt="Foto do veículo" className="h-24 w-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-2 right-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
                      onClick={() => removeExistingPhoto(url)}
                    >
                      Remover
                    </button>
                  </div>
                ))}
                {vehiclePhotos.map(file => {
                  const fileKey = getFileKey(file);
                  return (
                    <div key={fileKey} className="relative overflow-hidden rounded-2xl border border-border/80 bg-slate-50">
                      <img src={URL.createObjectURL(file)} alt={file.name} className="h-24 w-full object-cover" />
                      <button
                        type="button"
                        className="absolute top-2 right-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
                        onClick={() => removePendingPhoto(fileKey)}
                      >
                        Remover
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>Documento do Veículo (PDF)</Label>
              {existingDocumentUrl ? (
                <div className="mt-1 flex items-center gap-3 rounded-2xl border border-border/80 bg-slate-50 p-3">
                  <a
                    href={existingDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary underline underline-offset-2 hover:text-primary/80"
                  >
                    Abrir documento atual
                  </a>
                  <button
                    type="button"
                    className="ml-auto rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-500/20"
                    onClick={removeExistingDocument}
                  >
                    Remover
                  </button>
                </div>
              ) : documentFile ? (
                <div className="mt-1 flex items-center gap-3 rounded-2xl border border-border/80 bg-slate-50 p-3">
                  <span className="text-sm font-medium truncate flex-1">{documentFile.name}</span>
                  <button
                    type="button"
                    className="rounded-full bg-black/70 px-2 py-1 text-xs text-white"
                    onClick={() => setDocumentFile(null)}
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <Input
                  id="documento_upload"
                  type="file"
                  accept="application/pdf"
                  className="mt-1 bg-white"
                  onChange={e => {
                    const file = e.target.files?.[0] || null;
                    handleDocumentFileChange(file);
                    e.target.value = "";
                  }}
                />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Label htmlFor="vencimento_parcela">Vencimento da parcela</Label>
                {schedules.some(s => s.tipo === "parcela") && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Info className="w-3 h-3" />
                    <span>Auto</span>
                  </div>
                )}
              </div>
              <Input
                id="vencimento_parcela"
                type="date"
                className="bg-white"
                value={formValues.vencimento_parcela ?? ""}
                onChange={e => handleFieldChange("vencimento_parcela", e.target.value)}
                disabled={!selectedVehicle || schedules.some(s => s.tipo === "parcela")}
              />
              {!selectedVehicle ? (
                <p className="text-xs text-muted-foreground mt-1">
                  Campo gerenciado por programações de pagamento
                </p>
              ) : schedules.some(s => s.tipo === "parcela") && (
                <p className="text-xs text-muted-foreground mt-1">
                  Próximo vencimento calculado automaticamente da programação
                </p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Label htmlFor="vencimento_seguro">Vencimento seguro</Label>
                {schedules.some(s => s.tipo === "seguro") && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Info className="w-3 h-3" />
                    <span>Auto</span>
                  </div>
                )}
              </div>
              <Input
                id="vencimento_seguro"
                type="date"
                className="bg-white"
                value={formValues.vencimento_seguro ?? ""}
                onChange={e => handleFieldChange("vencimento_seguro", e.target.value)}
                disabled={!selectedVehicle || schedules.some(s => s.tipo === "seguro")}
              />
              {!selectedVehicle ? (
                <p className="text-xs text-muted-foreground mt-1">
                  Campo gerenciado por programações de pagamento
                </p>
              ) : schedules.some(s => s.tipo === "seguro") && (
                <p className="text-xs text-muted-foreground mt-1">
                  Próximo vencimento calculado automaticamente da programação
                </p>
              )}
            </div>
          </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal} type="button">
              Cancelar
            </Button>
            <Button onClick={saveVehicle} disabled={isSaving}>
              {isSaving ? "Salvando..." : selectedVehicle ? "Salvar alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default Veiculos;
;
