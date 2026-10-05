// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MobileHeader from "@/layouts/mobile/MobileHeader";
import { ChecklistStepper, type ChecklistStep } from "@/components/checklist/ChecklistStepper";
import { ChecklistCameraCapture } from "@/components/checklist/ChecklistCameraCapture";
import { ChecklistImageGrid, type ChecklistImage } from "@/components/checklist/ChecklistImageGrid";
import { ChecklistPDFViewer } from "@/components/checklist/ChecklistPDFViewer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, CheckCircle2, FileText, Camera, Loader2, Share2, Copy, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useChecklist } from "@/hooks/useChecklist";
import { useChecklistImages } from "@/hooks/useChecklistImages";
import { useChecklistPDF } from "@/hooks/useChecklistPDF";
import { ChecklistSteps } from "@/lib/checklist/constants";
import { checklistService } from "@/integrations/supabase/services/checklistService";
import { kmHistoryService } from "@/integrations/supabase/services/kmHistoryService";

const ChecklistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { checklist, isLoading: isLoadingChecklist, finalize, isFinalizing } = useChecklist(id);
  const { upload, deleteImage, isUploading } = useChecklistImages(id || "");
  const { generate, pdfUrl, isGenerating } = useChecklistPDF();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("captura");
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [ultimoKm, setUltimoKm] = useState<number | null>(null);

  // Buscar último KM registrado do veículo ao carregar
  useEffect(() => {
    if (checklist?.vehicle_id) {
      kmHistoryService.getLastKm(checklist.vehicle_id).then(setUltimoKm).catch(() => {});
    }
  }, [checklist?.vehicle_id]);

  const handleShare = async () => {
    if (!id) return;
    try {
      const result = await checklistService.createShareToken(id);
      const fullUrl = `${window.location.origin}${result.url}`;
      setShareLink(fullUrl);
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar link");
    }
  };

  // Definir passos baseados no tipo de checklist do banco
  const steps: ChecklistStep[] = useMemo(() => {
    if (!checklist) return [];
    
    const baseSteps = ChecklistSteps[checklist.type as keyof typeof ChecklistSteps] || ChecklistSteps.entrega;
    
    return baseSteps.map(step => ({
      ...step,
      status: (checklist.images?.some((img: any) => img.step_key === step.key) ? "completed" : "pending") as any
    }));
  }, [checklist]);

  const currentStep = steps[currentStepIndex];

  // Imagens formatadas para o grid
  const images: ChecklistImage[] = useMemo(() => {
    return checklist?.images || [];
  }, [checklist]);

  const handleCapture = async (file: File, km?: number, observation?: string) => {
    if (!checklist || !currentStep) return;

    try {
      await upload({
        file,
        stepKey: currentStep.key,
        stepLabel: currentStep.label,
        stepOrder: currentStep.order,
        position: images.length + 1,
        observation,
        odometroKm: km,
        context: {
          companyId: checklist.company_id,
          vehicleId: checklist.vehicle_id,
          checklistId: checklist.checklist_id,
          placa: checklist.vehicle_placa,
          empresa: "CarControl",
          tipo: checklist.type,
        }
      });

      if (km) {
        setUltimoKm(km);
      }

      // Avançar automaticamente para o próximo step pendente
      const nextPendingIndex = steps.findIndex((s, i) => i > currentStepIndex && s.status === "pending");
      if (nextPendingIndex !== -1) {
        setCurrentStepIndex(nextPendingIndex);
      } else {
        setActiveTab("resumo");
      }
    } catch (error) {

    }
  };

  const handleFinalize = async () => {
    const missingRequired = steps.filter(s => s.required && s.status !== "completed");
    if (missingRequired.length > 0) {
      toast.error(`Ainda faltam ${missingRequired.length} fotos obrigatórias.`);
      return;
    }

    try {
      await finalize(id!);
      setActiveTab("pdf");
    } catch (error) {

    }
  };

  if (isLoadingChecklist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="p-10 text-center">
        <p>Vistoria não encontrada.</p>
        <Button onClick={() => navigate("/mobile/checklists")} className="mt-4">Voltar</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-20">
      <MobileHeader />
      
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/mobile/checklists")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold font-display capitalize">Vistoria de {checklist.type.replace("_", " ")}</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">ID: {id?.slice(0, 8)}</p>
          </div>
          <div className="ml-auto">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {shareLink && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-primary">Link compartilhado!</p>
              <button onClick={() => setShareLink(null)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground break-all">{shareLink}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 gap-1.5 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
              <Button
                size="sm"
                className="flex-1 gap-1.5 text-xs"
                onClick={() => {
                  const msg = encodeURIComponent(
                    `Olá! Aqui está o link para realizar a vistoria do veículo ${checklist.vehicle_placa}:\n\n${shareLink}`
                  );
                  window.open(`https://wa.me/?text=${msg}`, "_blank");
                }}
              >
                <Share2 className="w-3.5 h-3.5" />
                WhatsApp
              </Button>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full neu p-1">
            <TabsTrigger value="captura" className="gap-2 data-[state=active]:neu-inset">
              <Camera className="w-4 h-4" />
              Captura
            </TabsTrigger>
            <TabsTrigger value="resumo" className="gap-2 data-[state=active]:neu-inset">
              <CheckCircle2 className="w-4 h-4" />
              Resumo
            </TabsTrigger>
            <TabsTrigger value="pdf" className="gap-2 data-[state=active]:neu-inset">
              <FileText className="w-4 h-4" />
              Relatório
            </TabsTrigger>
          </TabsList>

          <TabsContent value="captura" className="space-y-6 pt-4">
            <ChecklistStepper 
              steps={steps} 
              currentStepIndex={currentStepIndex}
              onStepChange={setCurrentStepIndex}
            />
            
            <div className="pt-4">
              {currentStep && (
                <ChecklistCameraCapture
                  stepKey={currentStep.key}
                  stepLabel={currentStep.label}
                  required={currentStep.required}
                  onCapture={handleCapture}
                  ultimoKm={ultimoKm}
                />
              )}
            </div>

            <div className="flex justify-between items-center px-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentStepIndex === 0}
                onClick={() => setCurrentStepIndex(prev => prev - 1)}
                className="neu active:neu-inset"
              >
                Anterior
              </Button>
              <Button 
                variant="outline"
                size="sm"
                disabled={currentStepIndex === steps.length - 1}
                onClick={() => setCurrentStepIndex(prev => prev + 1)}
                className="neu active:neu-inset"
              >
                Próximo
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="resumo" className="space-y-6 pt-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg font-display">Fotos Capturadas</h2>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {images.length} de {steps.length}
              </span>
            </div>

            <ChecklistImageGrid 
              images={images}
              onDelete={deleteImage}
            />

            <Button 
              className="w-full gap-2 h-14 text-lg font-bold shadow-lg" 
              onClick={handleFinalize}
              disabled={isFinalizing || checklist.status === "finalizado"}
            >
              {isFinalizing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : checklist.status === "finalizado" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {checklist.status === "finalizado" ? "Vistoria Finalizada" : "Finalizar Checklist"}
            </Button>
          </TabsContent>

          <TabsContent value="pdf" className="pt-4">
            <ChecklistPDFViewer 
              checklistId={id || ""} 
              pdfUrl={pdfUrl || undefined}
              onGenerate={() => generate(id!)}
              isGenerating={isGenerating}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChecklistDetail;
