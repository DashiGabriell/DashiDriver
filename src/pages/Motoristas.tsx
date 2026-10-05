import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtBRL, fmtDate } from "@/lib/utils";
import { Phone, IdCard, Plus, Loader2, Edit3, Trash2, FileText, Download, Upload, X, Image as ImageIcon, LayoutGrid, TableIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/integrations/supabase/auth";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { driverService } from "@/integrations/supabase/services/driverService";
import { vehicleService } from "@/integrations/supabase/services/vehicleService";
import { getErrorMessage } from "@/integrations/supabase/services/errors";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motoristaSchema, MotoristaInput } from "@/lib/validators/motorista";

type Driver = Tables<"carcontrol_drivers">;
type DriverInsert = TablesInsert<"carcontrol_drivers">;
type Vehicle = Tables<"carcontrol_vehicles">;

type DriverFormValues = DriverInsert & { id?: string; email?: string };

const statusOptions = [
  { value: "ativo", label: "Ativo" },
  { value: "atrasado", label: "Atrasado" },
  { value: "encerrado", label: "Encerrado" },
];

const statusCls: Record<string, string> = {
  ativo: "text-success",
  atrasado: "text-danger",
  encerrado: "text-muted-foreground",
};

const DRIVER_DOCUMENTS_BUCKET = "driver-documents";
const DRIVER_PHOTOS_BUCKET = "driver-photos";

const initialFormValues: DriverFormValues = {
  nome: "",
  cpf: "",
  cnh: "",
  telefone: "",
  inicio: new Date().toISOString().slice(0, 10),
  caucao: 0,
  valor_semanal: 0,
  status: "ativo",
  veiculo_id: null,
  foto_url: null,
  contrato_url: null,
  antecedentes_url: null,
  comprovante_residencia_url: null,
  email: "",
};

const Motoristas = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<
    (Driver & { carcontrol_vehicles?: Vehicle | null; valor_semanal?: number })[]
  >([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formValues, setFormValues] = useState<DriverFormValues>(initialFormValues);
  const form = useForm<MotoristaInput>({
    resolver: zodResolver(motoristaSchema),
    values: {
      nome: formValues.nome,
      cpf: formValues.cpf.replace(/\D/g, ''),
      cnh: formValues.cnh,
      telefone: formValues.telefone,
      inicio: formValues.inicio,
      email: formValues.email || '',
    },
  });
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  
  // Estados para arquivos
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [contratoFile, setContratoFile] = useState<File | null>(null);
  const [antecedentesFile, setAntecedentesFile] = useState<File | null>(null);
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null);
  
  const { session } = useAuth();

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, []);

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      const driversWithSchedules = await driverService.listWithWeeklyValue();
      setDrivers(driversWithSchedules);
    } catch (error: unknown) {
      toast.error("Erro ao carregar motoristas: " + getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const full = await vehicleService.list();
      setVehicles([...full].sort((a, b) => (a.modelo || "").localeCompare(b.modelo || "")));
    } catch {
      // RLS / empty tenant — leave vehicles empty
    }
  };

  const fetchValorSemanalFromSchedule = async (driverId: string): Promise<number> => {
    return driverService.getActiveWeeklyValue(driverId);
  };

  const openCreateModal = () => {
    setSelectedDriver(null);
    setFormValues({ ...initialFormValues, valor_semanal: 0 });
    setFotoFile(null);
    setContratoFile(null);
    setAntecedentesFile(null);
    setComprovanteFile(null);
    setIsFormOpen(true);
  };

  const openEditModal = async (driver: Driver) => {
    setSelectedDriver(driver);
    setFotoFile(null);
    setContratoFile(null);
    setAntecedentesFile(null);
    setComprovanteFile(null);
    
    // Buscar o valor semanal da programação de pagamento ativa
    const valorSemanal = driver.id ? await fetchValorSemanalFromSchedule(driver.id) : 0;
    
    // Preencher o formulário com os dados do motorista e o valor semanal da programação
    setFormValues({ 
      ...(driver as DriverFormValues), 
      valor_semanal: valorSemanal 
    });
    
    setIsFormOpen(true);
  };

  const closeModal = () => {
    setSelectedDriver(null);
    setFormValues(initialFormValues);
    setFotoFile(null);
    setContratoFile(null);
    setAntecedentesFile(null);
    setComprovanteFile(null);
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

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9)
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  };

  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, "");
    return numbers.length === 11;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  const handleFieldChange = (field: keyof DriverFormValues, value: string | number | null) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleCurrencyFieldChange = (field: keyof DriverFormValues, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: parseBRL(value) }));
  };

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    setFormValues(prev => ({ ...prev, cpf: formatted }));
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setFormValues(prev => ({ ...prev, telefone: formatted }));
  };

  const getDocumentStoragePath = (url: string | null) => {
    if (!url) return "";
    try {
      const urlObj = new URL(url);
      const prefix = `/storage/v1/object/public/${DRIVER_DOCUMENTS_BUCKET}/`;
      return urlObj.pathname.includes(prefix) ? urlObj.pathname.replace(prefix, "") : "";
    } catch {
      return "";
    }
  };

  const uploadDocument = async (file: File, driverId: string, docType: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${driverId}/${docType}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(DRIVER_DOCUMENTS_BUCKET)
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(DRIVER_DOCUMENTS_BUCKET)
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error: any) {

      throw error;
    }
  };

  const removeExistingDocument = async (url: string | null, docType: string) => {
    if (!url) return;
    
    try {
      const path = getDocumentStoragePath(url);
      if (!path) throw new Error("Caminho de storage inválido para remoção");

      const { error } = await supabase.storage
        .from(DRIVER_DOCUMENTS_BUCKET)
        .remove([path]);

      if (error) throw error;

      // Atualizar formValues
      const field = `${docType}_url` as keyof DriverFormValues;
      setFormValues(prev => ({ ...prev, [field]: null }));
      
      toast.success(`${docType === "contrato" ? "Contrato" : docType === "antecedentes" ? "Antecedentes" : "Comprovante"} removido com sucesso`);
    } catch (error: any) {
      toast.error("Erro ao remover documento: " + error.message);
    }
  };

  const downloadDocument = (url: string | null, filename: string) => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.download = filename;
    a.click();
  };

  const handleFileChange = (
    file: File | null,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (!file) {
      setter(null);
      return;
    }

    // Validar se é PDF
    if (file.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são permitidos");
      return;
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. Máximo 5MB");
      return;
    }

    setter(file);
  };

  // Funções específicas para foto do motorista
  const getPhotoStoragePath = (url: string | null) => {
    if (!url) return "";
    try {
      const urlObj = new URL(url);
      const prefix = `/storage/v1/object/public/${DRIVER_PHOTOS_BUCKET}/`;
      return urlObj.pathname.includes(prefix) ? urlObj.pathname.replace(prefix, "") : "";
    } catch {
      return "";
    }
  };

  const uploadPhoto = async (file: File, driverId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${driverId}/foto/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(DRIVER_PHOTOS_BUCKET)
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(DRIVER_PHOTOS_BUCKET)
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error: any) {

      throw error;
    }
  };

  const removeExistingPhoto = async (url: string | null) => {
    if (!url) return;
    
    try {
      const path = getPhotoStoragePath(url);
      if (!path) throw new Error("Caminho de storage inválido para remoção");

      const { error } = await supabase.storage
        .from(DRIVER_PHOTOS_BUCKET)
        .remove([path]);

      if (error) throw error;

      setFormValues(prev => ({ ...prev, foto_url: null }));
      toast.success("Foto removida com sucesso");
    } catch (error: any) {
      toast.error("Erro ao remover foto: " + error.message);
    }
  };

  const handlePhotoChange = (file: File | null) => {
    if (!file) {
      setFotoFile(null);
      return;
    }

    // Validar se é imagem
    const validImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validImageTypes.includes(file.type)) {
      toast.error("Apenas imagens (JPG, PNG, WEBP, GIF) são permitidas");
      return;
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Imagem muito grande. Máximo 5MB");
      return;
    }

    setFotoFile(file);
  };

  const saveDriver = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      setIsSaving(true);
      const dataToSave: DriverInsert = {
        nome: formValues.nome,
        cpf: formValues.cpf,
        cnh: formValues.cnh,
        telefone: formValues.telefone,
        inicio: formValues.inicio,
        caucao: Number(formValues.caucao),
        valor_semanal: Number(formValues.valor_semanal),
        status: formValues.status,
        veiculo_id: formValues.veiculo_id || null,
        foto_url: formValues.foto_url,
        contrato_url: formValues.contrato_url,
        antecedentes_url: formValues.antecedentes_url,
        comprovante_residencia_url: formValues.comprovante_residencia_url,
        user_id: selectedDriver?.user_id ?? session?.user?.id ?? undefined,
      };

      let savedDriverId: string;
      let savedDriver: Driver & { carcontrol_vehicles?: Vehicle | null; valor_semanal?: number };

      if (selectedDriver?.id) {
        savedDriver = await driverService.update(selectedDriver.id, dataToSave);
        savedDriverId = savedDriver.id;
      } else {
        savedDriver = await driverService.create(dataToSave);
        savedDriverId = savedDriver.id;
      }

      // Upload dos novos arquivos (foto e documentos)
      const updatedUrls: Partial<Driver> = {};

      if (fotoFile) {
        const url = await uploadPhoto(fotoFile, savedDriverId);
        if (url) updatedUrls.foto_url = url;
      }

      if (contratoFile) {
        const url = await uploadDocument(contratoFile, savedDriverId, "contrato");
        if (url) updatedUrls.contrato_url = url;
      }

      if (antecedentesFile) {
        const url = await uploadDocument(antecedentesFile, savedDriverId, "antecedentes");
        if (url) updatedUrls.antecedentes_url = url;
      }

      if (comprovanteFile) {
        const url = await uploadDocument(comprovanteFile, savedDriverId, "comprovante_residencia");
        if (url) updatedUrls.comprovante_residencia_url = url;
      }

      // Se houver novos arquivos, atualizar o registro
      if (Object.keys(updatedUrls).length > 0) {
        savedDriver = await driverService.update(savedDriverId, updatedUrls);
      } else {
        savedDriver = (await driverService.getById(savedDriverId)) ?? savedDriver;
      }

      if (selectedDriver?.id) {
        setDrivers((prev) => prev.map((d) => (d.id === savedDriver.id ? savedDriver : d)));
        toast.success("Motorista atualizado com sucesso");
      } else {
        setDrivers((prev) => [savedDriver, ...(prev || [])]);
        toast.success("Motorista cadastrado com sucesso");
      }

      closeModal();
    } catch (error: unknown) {
      toast.error("Erro ao salvar motorista: " + getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteDriver = async (driver: Driver) => {
    const confirmed = window.confirm(`Excluir o motorista ${driver.nome}?`);
    if (!confirmed) return;

    try {
      await driverService.remove(driver.id);
      setDrivers((prev) => prev.filter((d) => d.id !== driver.id));
      toast.success("Motorista excluído com sucesso");
    } catch (error: unknown) {
      toast.error("Erro ao excluir motorista: " + getErrorMessage(error));
    }
  };

  return (
    <AppShell>
      <Topbar 
        title="Motoristas" 
        subtitle={`${drivers.length} contratos cadastrados`}
        onCreate={openCreateModal}
        createLabel="Novo motorista"
        helpPath="/ajuda/gestao/motoristas"
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("cards")}
            className="flex items-center gap-2"
          >
            <LayoutGrid className="w-4 h-4" /> Cards
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="flex items-center gap-2"
          >
            <TableIcon className="w-4 h-4" /> Tabela
          </Button>
        </div>
        
        {/* <button 
          className="neu-interactive px-4 py-2.5 flex items-center gap-2 text-sm font-medium"
          onClick={openCreateModal}
        >
          <Plus className="w-4 h-4" /> Novo motorista
        </button> */}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {drivers.map((d, i) => {
            const v = d.carcontrol_vehicles;
            return (
              <div key={d.id} className={`neu p-6 animate-blur-in delay-${(i % 4) * 75} transition-shadow duration-200 shadow-sm shadow-gray-200 hover:shadow-md hover:shadow-gray-400/40 cursor-pointer`} onClick={() => navigate(`/motoristas/${d.id}`)}>
                <div className="flex items-start gap-4">
                  {d.foto_url ? (
                    <img 
                      src={d.foto_url} 
                      alt={d.nome}
                      className="neu-sm w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="neu-sm w-14 h-14 grid place-items-center font-display font-bold text-lg">
                      {d.nome.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-bold leading-tight">{d.nome}</h3>
                    <div className="text-sm text-muted-foreground">CPF {d.cpf}</div>
                  </div>
                  <span className={`chip ${statusCls[d.status] || "text-muted-foreground"} capitalize`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" /> {d.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div className="neu-inset px-4 py-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Veículo</div>
                    <div className="text-sm font-semibold mt-0.5">
                      {v ? (
                        <>
                          {v.modelo} <span className="font-mono text-xs text-muted-foreground">{v.placa}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground text-xs">Sem veículo</span>
                      )}
                    </div>
                  </div>
                  <div className="neu-inset px-4 py-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Semanal</div>
                    <div className="text-sm font-semibold mt-0.5">{fmtBRL(d.valor_semanal)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {d.telefone}</span>
                  <span className="flex items-center gap-1.5"><IdCard className="w-4 h-4" /> CNH {d.cnh?.slice(0, 6)}â€¦</span>
                  <span className="ml-auto text-xs">desde {d.inicio ? fmtDate(d.inicio) : "â€”"}</span>
                </div>

                {/* Indicadores de documentos */}
                {(d.contrato_url || d.antecedentes_url || d.comprovante_residencia_url) && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
                    <span className="text-xs text-muted-foreground">Documentos:</span>
                    {d.contrato_url && (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Contrato
                      </span>
                    )}
                    {d.antecedentes_url && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Antecedentes
                      </span>
                    )}
                    {d.comprovante_residencia_url && (
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Comprovante
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 mt-5 pt-5 border-t border-border/60">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); openEditModal(d); }}
                  >
                    <Edit3 className="w-3 h-3" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => { e.stopPropagation(); deleteDriver(d); }}
                  >
                    <Trash2 className="w-3 h-3" /> Excluir
                  </Button>
                </div>
              </div>
            );
          })}
          {drivers.length === 0 && (
            <div className="col-span-full neu p-10 text-center text-muted-foreground">
              Nenhum motorista cadastrado
            </div>
          )}
        </div>
      ) : (
        <div className="neu overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Foto</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Valor Semanal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Documentos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((d) => {
                const v = d.carcontrol_vehicles;
                return (
                  <TableRow key={d.id} className="cursor-pointer hover:bg-muted/40" onClick={() => navigate(`/motoristas/${d.id}`)}>
                    <TableCell>
                      {d.foto_url ? (
                        <img 
                          src={d.foto_url} 
                          alt={d.nome}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                          {d.nome.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>{d.nome}</div>
                      <div className="text-xs text-muted-foreground">CNH: {d.cnh}</div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{d.cpf}</TableCell>
                    <TableCell className="text-sm">{d.telefone}</TableCell>
                    <TableCell>
                      {v ? (
                        <div>
                          <div className="font-medium text-sm">{v.modelo}</div>
                          <div className="font-mono text-xs text-muted-foreground">{v.placa}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sem veículo</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">{fmtBRL(d.valor_semanal)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        d.status === 'ativo' ? 'bg-emerald-100 text-emerald-700' :
                        d.status === 'atrasado' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {d.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {d.contrato_url && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">
                            C
                          </span>
                        )}
                        {d.antecedentes_url && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                            A
                          </span>
                        )}
                        {d.comprovante_residencia_url && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">
                            R
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); openEditModal(d); }}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => { e.stopPropagation(); deleteDriver(d); }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {drivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                    Nenhum motorista cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[83vh] w-full overflow-hidden sm:max-h-[90vh] max-w-[42rem]">
          <DialogHeader>
            <DialogTitle>{selectedDriver ? "Editar motorista" : "Cadastrar motorista"}</DialogTitle>
            <DialogDescription>
              {selectedDriver
                ? "Atualize os dados do motorista e salve as alterações."
                : "Preencha os campos para cadastrar um novo motorista."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(83vh-11rem)] overflow-hidden rounded-3xl border border-primary/10 bg-background/90 p-1 shadow-sm">
            <div className="grid gap-4 p-3">
              <div>
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  className="bg-white"
                  value={formValues.nome ?? ""}
                  onChange={e => handleFieldChange("nome", e.target.value)}
                />
              </div>

              {/* Foto do Motorista */}
              <div>
                <Label htmlFor="foto" className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Foto do Motorista
                  </span>
                  {formValues.foto_url && !fotoFile && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => window.open(formValues.foto_url!, "_blank")}
                      >
                        <ImageIcon className="w-3 h-3 mr-1" /> Ver
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={() => removeExistingPhoto(formValues.foto_url ?? null)}
                      >
                        <X className="w-3 h-3 mr-1" /> Remover
                      </Button>
                    </div>
                  )}
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="foto"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="bg-white"
                    onChange={e => handlePhotoChange(e.target.files?.[0] || null)}
                  />
                  {fotoFile && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setFotoFile(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {fotoFile && (
                  <div className="flex items-center gap-2 mt-2">
                    <img 
                      src={URL.createObjectURL(fotoFile)} 
                      alt="Preview" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                    />
                    <p className="text-xs text-muted-foreground">
                      {fotoFile.name} ({(fotoFile.size / 1024).toFixed(0)} KB)
                    </p>
                  </div>
                )}
                {formValues.foto_url && !fotoFile && (
                  <div className="flex items-center gap-2 mt-2">
                    <img 
                      src={formValues.foto_url} 
                      alt="Foto atual" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                    />
                    <p className="text-xs text-success">Foto cadastrada</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    className="bg-white"
                    placeholder="000.000.000-00"
                    value={formValues.cpf ?? ""}
                    onChange={e => handleCPFChange(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cnh">CNH</Label>
                  <Input
                    id="cnh"
                    className="bg-white"
                    value={formValues.cnh ?? ""}
                    onChange={e => handleFieldChange("cnh", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    className="bg-white"
                    placeholder="(00) 00000-0000"
                    value={formValues.telefone ?? ""}
                    onChange={e => handlePhoneChange(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="inicio">Data de início</Label>
                  <Input
                    id="inicio"
                    type="date"
                    className="bg-white"
                    value={formValues.inicio ?? ""}
                    onChange={e => handleFieldChange("inicio", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="caucao">Caução (R$)</Label>
                  <Input
                    id="caucao"
                    type="text"
                    inputMode="decimal"
                    className="bg-white"
                    placeholder="R$ 0,00"
                    value={formatCurrency(formValues.caucao ?? 0)}
                    onChange={e => handleCurrencyFieldChange("caucao", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="valor_semanal" className="flex items-center gap-2">
                    Valor semanal (R$)
                    <span className="text-xs text-muted-foreground font-normal">(somente leitura)</span>
                  </Label>
                  <Input
                    id="valor_semanal"
                    type="text"
                    inputMode="decimal"
                    className="bg-muted cursor-not-allowed"
                    placeholder="R$ 0,00"
                    value={formatCurrency(formValues.valor_semanal ?? 0)}
                    disabled
                    readOnly
                    title="Este valor vem da programação de pagamento ativa. Para alterar, edite a programação na página de Recebimentos."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formValues.valor_semanal > 0 
                      ? "Valor definido na programação de pagamento" 
                      : "Sem programação de pagamento ativa"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formValues.status ?? "ativo"}
                    onValueChange={value => handleFieldChange("status", value)}
                  >
                    <SelectTrigger id="status" className="bg-white border border-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="veiculo_id">Veículo (opcional)</Label>
                  <Select
                    value={formValues.veiculo_id ?? "none"}
                    onValueChange={value => handleFieldChange("veiculo_id", value === "none" ? null : value)}
                  >
                    <SelectTrigger id="veiculo_id" className="bg-white border border-input">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem veículo</SelectItem>
                      {vehicles.map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.modelo} - {v.placa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Documentos PDF */}
              <div className="border-t border-border/60 pt-4 mt-2">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Documentos (PDF)
                </h3>

                {/* Contrato */}
                <div className="mb-4">
                  <Label htmlFor="contrato" className="flex items-center justify-between">
                    <span>Contrato</span>
                    {formValues.contrato_url && !contratoFile && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => downloadDocument(formValues.contrato_url ?? null, "contrato.pdf")}
                        >
                          <Download className="w-3 h-3 mr-1" /> Baixar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                          onClick={() => removeExistingDocument(formValues.contrato_url ?? null, "contrato")}
                        >
                          <X className="w-3 h-3 mr-1" /> Remover
                        </Button>
                      </div>
                    )}
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="contrato"
                      type="file"
                      accept="application/pdf"
                      className="bg-white"
                      onChange={e => handleFileChange(e.target.files?.[0] || null, setContratoFile)}
                    />
                    {contratoFile && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setContratoFile(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {contratoFile && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {contratoFile.name} ({(contratoFile.size / 1024).toFixed(0)} KB)
                    </p>
                  )}
                  {formValues.contrato_url && !contratoFile && (
                    <p className="text-xs text-success mt-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Documento anexado
                    </p>
                  )}
                </div>

                {/* Antecedentes Criminais */}
                <div className="mb-4">
                  <Label htmlFor="antecedentes" className="flex items-center justify-between">
                    <span>Antecedentes Criminais</span>
                    {formValues.antecedentes_url && !antecedentesFile && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => downloadDocument(formValues.antecedentes_url ?? null, "antecedentes.pdf")}
                        >
                          <Download className="w-3 h-3 mr-1" /> Baixar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                          onClick={() => removeExistingDocument(formValues.antecedentes_url ?? null, "antecedentes")}
                        >
                          <X className="w-3 h-3 mr-1" /> Remover
                        </Button>
                      </div>
                    )}
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="antecedentes"
                      type="file"
                      accept="application/pdf"
                      className="bg-white"
                      onChange={e => handleFileChange(e.target.files?.[0] || null, setAntecedentesFile)}
                    />
                    {antecedentesFile && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setAntecedentesFile(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {antecedentesFile && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {antecedentesFile.name} ({(antecedentesFile.size / 1024).toFixed(0)} KB)
                    </p>
                  )}
                  {formValues.antecedentes_url && !antecedentesFile && (
                    <p className="text-xs text-success mt-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Documento anexado
                    </p>
                  )}
                </div>

                {/* Comprovante de Residência */}
                <div>
                  <Label htmlFor="comprovante" className="flex items-center justify-between">
                    <span>Comprovante de Residência</span>
                    {formValues.comprovante_residencia_url && !comprovanteFile && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => downloadDocument(formValues.comprovante_residencia_url ?? null, "comprovante.pdf")}
                        >
                          <Download className="w-3 h-3 mr-1" /> Baixar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                          onClick={() => removeExistingDocument(formValues.comprovante_residencia_url ?? null, "comprovante_residencia")}
                        >
                          <X className="w-3 h-3 mr-1" /> Remover
                        </Button>
                      </div>
                    )}
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="comprovante"
                      type="file"
                      accept="application/pdf"
                      className="bg-white"
                      onChange={e => handleFileChange(e.target.files?.[0] || null, setComprovanteFile)}
                    />
                    {comprovanteFile && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setComprovanteFile(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {comprovanteFile && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {comprovanteFile.name} ({(comprovanteFile.size / 1024).toFixed(0)} KB)
                    </p>
                  )}
                  {formValues.comprovante_residencia_url && !comprovanteFile && (
                    <p className="text-xs text-success mt-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Documento anexado
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal} type="button">
              Cancelar
            </Button>
            <Button onClick={saveDriver} disabled={isSaving}>
              {isSaving ? "Salvando..." : selectedDriver ? "Salvar alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default Motoristas;
