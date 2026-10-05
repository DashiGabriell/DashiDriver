import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChecklistStepper, type ChecklistStep } from "@/components/checklist/ChecklistStepper";
import { ChecklistCameraCapture } from "@/components/checklist/ChecklistCameraCapture";
import { ChecklistImageGrid, type ChecklistImage } from "@/components/checklist/ChecklistImageGrid";
import { supabase } from "@/integrations/supabase/client";
import { checklistService } from "@/integrations/supabase/services/checklistService";
import { ChecklistSteps, STORAGE_BUCKET } from "@/lib/checklist/constants";
import { Camera, CheckCircle2, Loader2, Car, XCircle, Clock, Check } from "lucide-react";
import { toast } from "sonner";

interface SharedChecklist {
  checklist_id: string;
  company_id: string;
  vehicle_id: string;
  vehicle_placa: string;
  vehicle_modelo: string;
  vehicle_ano: number | null;
  vehicle_cor: string | null;
  driver_name: string | null;
  type: string;
  status: string;
  notes: string | null;
  started_at: string;
  finished_at: string | null;
  images: any[];
}

const VistoriaCompartilhada = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const { data: checklist, isLoading, isError } = useQuery({
    queryKey: ["shared-checklist", token],
    queryFn: () => checklistService.getSharedByToken(token!),
    enabled: !!token,
  });

  const checklistData: SharedChecklist | null = checklist?.error ? null : checklist;

  const steps: ChecklistStep[] = useMemo(() => {
    if (!checklistData) return [];
    const baseSteps = ChecklistSteps[checklistData.type as keyof typeof ChecklistSteps] || ChecklistSteps.entrega;
    return baseSteps.map(step => ({
      ...step,
      status: (checklistData.images?.some((img: any) => img.step_key === step.key)
        ? "completed"
        : "pending") as any,
    }));
  }, [checklistData]);

  const currentStep = steps[currentStepIndex];
  const isComplete = steps.every(s => s.status === "completed");
  const capturedImages: ChecklistImage[] = useMemo(() => {
    return (checklistData?.images || []).map((img: any) => ({
      id: img.id,
      image_url: img.image_url,
      step_key: img.step_key,
      step_label: img.step_label,
      taken_at: img.taken_at,
    }));
  }, [checklistData]);

  const addImageMutation = useMutation({
    mutationFn: async ({ file, step }: { file: File; step: ChecklistStep }) => {
      const timestamp = Date.now();
      const path = `shared/${token}/${step.key}_${timestamp}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(path);

      await checklistService.addSharedImage(token!, {
        stepKey: step.key,
        stepLabel: step.label,
        stepOrder: step.order,
        imageUrl: publicUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared-checklist", token] });
      toast.success("Foto enviada!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao enviar foto");
    },
  });

  const handleCapture = async (file: File) => {
    if (!currentStep) return;
    await addImageMutation.mutateAsync({ file, step: currentStep });
    const nextPendingIndex = steps.findIndex((s, i) => i > currentStepIndex && s.status === "pending");
    if (nextPendingIndex !== -1) {
      setCurrentStepIndex(nextPendingIndex);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background grid place-items-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !checklistData) {
    return (
      <div className="min-h-screen bg-background grid place-items-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <XCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <CardTitle>Link inválido</CardTitle>
            <CardDescription>
              Esta vistoria não foi encontrada ou o link expirou.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (checklistData.status === "finalizado") {
    return (
      <div className="min-h-screen bg-background grid place-items-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <CardTitle>Vistoria finalizada</CardTitle>
            <CardDescription>
              Esta vistoria já foi concluída. Obrigado!
            </CardDescription>
          </CardHeader>
          {capturedImages.length > 0 && (
            <CardContent>
              <p className="text-sm font-medium mb-3 text-left">Fotos enviadas:</p>
              <ChecklistImageGrid images={capturedImages} />
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Car className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Vistoria do Veículo</h1>
            <p className="text-sm text-muted-foreground">
              {checklistData.vehicle_placa} - {checklistData.vehicle_modelo}
            </p>
          </div>
        </div>

        {checklistData.driver_name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Motorista: {checklistData.driver_name}
          </div>
        )}

        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Passos da Vistoria
          </h2>
          <div className="flex items-center gap-2">
            {steps.map((step, i) => (
              <button
                key={step.key}
                onClick={() => setCurrentStepIndex(i)}
                className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                  step.status === "completed"
                    ? "bg-green-500 text-white"
                    : i === currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step.status === "completed" ? <Check className="w-4 h-4" /> : step.order}
              </button>
            ))}
          </div>
        </div>

        {currentStep && (
          <div className="space-y-4">
            <ChecklistCameraCapture
              key={currentStep.key}
              stepKey={currentStep.key}
              stepLabel={currentStep.label}
              required={currentStep.required}
              onCapture={handleCapture}
              cameraOnly
            />
          </div>
        )}

        {capturedImages.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Fotos Capturadas ({capturedImages.length}/{steps.length})
            </h2>
            <ChecklistImageGrid images={capturedImages} />
          </div>
        )}

        {isComplete && (
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
              <div>
                <p className="font-semibold text-green-700 dark:text-green-400">
                  Vistoria concluída!
                </p>
                <p className="text-sm text-muted-foreground">
                  Todas as fotos foram enviadas. A empresa será notificada.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VistoriaCompartilhada;
