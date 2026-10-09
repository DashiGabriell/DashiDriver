import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ChecklistImageUpload } from "@/components/checklist/ChecklistImageUpload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Loader2,
  Trash2,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Image as ImageIcon,
  Save,
  Share2,
  Check,
  Copy,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { checklistService } from "@/integrations/supabase/services/checklistService";
import { kmHistoryService } from "@/integrations/supabase/services/kmHistoryService";
import { fmtDate } from "@/lib/utils";
import { toast } from "sonner";
import { ChecklistSteps } from "@/lib/checklist/constants";
import { useChecklistDetail } from "@/hooks/useChecklistDetail";

const statusConfig = {
  em_andamento: {
    label: "Em Andamento",
    color: "bg-blue-500",
    icon: Clock,
  },
  finalizado: {
    label: "Finalizado",
    color: "bg-green-500",
    icon: CheckCircle2,
  },
  cancelado: {
    label: "Cancelado",
    color: "bg-red-500",
    icon: AlertCircle,
  },
};

const typeConfig = {
  entrega: "Entrega",
  devolucao: "Devolução",
  avaria: "Avaria",
  manutencao: "Manutenção",
};

export default function ChecklistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [notes, setNotes] = useState<string>("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [ultimoKm, setUltimoKm] = useState<number | null>(null);

  // Buscar detalhes do checklist
  const { data: checklist, isLoading, error } = useChecklistDetail(id);

  // Atualizar notas quando checklist carregar
  React.useEffect(() => {
    if (checklist?.notes) {
      setNotes(checklist.notes);
    }
  }, [checklist?.notes]);

  // Buscar último KM do veículo
  React.useEffect(() => {
    if (checklist?.vehicle_id) {
      kmHistoryService.getLastKm(checklist.vehicle_id).then(setUltimoKm).catch(() => {});
    }
  }, [checklist?.vehicle_id]);

  // Mutation para adicionar imagem
  const addImageMutation = useMutation({
    mutationFn: async ({ file, observation, km }: { file: File; observation?: string; km?: number }) => {
      if (!checklist || !selectedStep) {
        throw new Error("Dados incompletos");
      }

      // 1. Upload para storage
      const fileName = `${checklist.checklist_id}/${selectedStep}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("checklists")
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      // 2. Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from("checklists")
        .getPublicUrl(uploadData.path);

      // 3. Registrar no banco
      const stepConfig = ChecklistSteps[checklist.type as keyof typeof ChecklistSteps]?.find(
        (s) => s.key === selectedStep
      );

      const { data: imageData, error: dbError } = await supabase
        .from("carcontrol_checklist_images")
        .insert({
          checklist_id: checklist.checklist_id,
          company_id: checklist.company_id,
          step_key: selectedStep,
          step_label: stepConfig?.label || selectedStep,
          step_order: stepConfig?.order || 0,
          position: (checklist.images?.length || 0) + 1,
          image_url: publicUrlData.publicUrl,
          thumbnail_url: publicUrlData.publicUrl,
          watermarked_url: publicUrlData.publicUrl,
          details: observation || null,
          odometro_km: km || null,
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return imageData;
    },
    onSuccess: () => {
      toast.success("Imagem adicionada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["checklist", id] });
      setSelectedStep(null);
      setIsUploadingImage(false);
    },
    onError: (error) => {

      toast.error("Erro ao adicionar imagem. Tente novamente.");
      setIsUploadingImage(false);
    },
  });

  // Mutation para deletar imagem
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const { error } = await supabase
        .from("carcontrol_checklist_images")
        .delete()
        .eq("id", imageId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Imagem removida com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["checklist", id] });
      setDeleteImageId(null);
    },
    onError: (error) => {

      toast.error("Erro ao remover imagem. Tente novamente.");
    },
  });

  // Mutation para finalizar checklist
  const finalizeMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("ID do checklist não fornecido");

      const { data, error } = await supabase
        .from("carcontrol_checklists")
        .update({
          status: "finalizado",
          finished_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Registrar KM no histórico se houver imagem do painel com odometro_km
      if (checklist?.images) {
        const painelImage = checklist.images.find(
          (img) => img.step_key === "painel" && img.odometro_km
        );
        if (painelImage) {
          const { data: userData } = await supabase.auth.getUser();
          await kmHistoryService.record({
            company_id: checklist.company_id,
            vehicle_id: checklist.vehicle_id,
            km: painelImage.odometro_km ?? 0,
            source: "checklist",
            source_id: id,
            observation: painelImage.details || undefined,
            userId: userData.user?.id,
          }).catch(() => {});
        }
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Checklist finalizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["checklist", id] });
    },
    onError: (error) => {

      toast.error("Erro ao finalizar checklist. Tente novamente.");
    },
  });

  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("ID do checklist não fornecido");
      const result = await checklistService.createShareToken(id);
      const fullUrl = `${window.location.origin}${result.url}`;
      return fullUrl;
    },
    onSuccess: (url) => {
      setShareLink(url);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao gerar link de compartilhamento");
    },
  });

  // Mutation para salvar notas
  const saveNotesMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("ID do checklist não fornecido");

      const { error } = await supabase
        .from("carcontrol_checklists")
        .update({ notes })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Observações salvas com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["checklist", id] });
    },
    onError: (error) => {

      toast.error("Erro ao salvar observações. Tente novamente.");
    },
  });

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await saveNotesMutation.mutateAsync();
    } finally {
      setIsSavingNotes(false);
    }
  };

  const imagesByStep = useMemo(() => {
    if (!checklist?.images) return {};

    return checklist.images.reduce(
      (acc, image) => {
        if (!acc[image.step_key]) {
          acc[image.step_key] = [];
        }
        acc[image.step_key].push(image);
        return acc;
      },
      {} as Record<string, typeof checklist.images>
    );
  }, [checklist?.images]);

  // Obter steps do tipo de checklist
  const steps = useMemo(() => {
    if (!checklist) return [];
    return ChecklistSteps[checklist.type as keyof typeof ChecklistSteps] || [];
  }, [checklist]);

  if (error) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/checklists")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold font-display">Erro</h1>
          </div>

          <Card className="border-red-500/50 bg-red-500/5">
            <CardContent className="pt-6">
              <p className="text-red-600">
                Erro ao carregar checklist. Tente novamente.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!checklist) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/checklists")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold font-display">Não encontrado</h1>
          </div>

          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Checklist não encontrado.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  const statusInfo = statusConfig[checklist.status as keyof typeof statusConfig];
  const typeLabel = typeConfig[checklist.type as keyof typeof typeConfig];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/checklists")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-display">
                {checklist.vehicle_modelo}
              </h1>
              <p className="text-muted-foreground mt-1">
                {checklist.vehicle_placa} • {typeLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${statusInfo?.color} text-white`}>
              {statusInfo?.label}
            </Badge>
            {checklist.status === "em_andamento" && (
              <>
                <Button
                  onClick={() => shareMutation.mutate()}
                  disabled={shareMutation.isPending}
                  variant="outline"
                  className="gap-2"
                >
                  {shareMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                  Compartilhar
                </Button>
                <Button
                  onClick={() => finalizeMutation.mutate()}
                  disabled={finalizeMutation.isPending}
                  className="gap-2"
                >
                  {finalizeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Finalizar
                </Button>
              </>
            )}
          </div>
        </div>

        {shareLink && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-semibold text-primary">Link compartilhado!</p>
                  <p className="text-xs text-muted-foreground break-all">{shareLink}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const msg = encodeURIComponent(
                        `Olá! Aqui está o link para realizar a vistoria do veículo ${checklist.vehicle_placa}:\n\n${shareLink}`
                      );
                      window.open(`https://wa.me/?text=${msg}`, "_blank");
                    }}
                    className="gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Motorista</p>
                <p className="font-semibold">{checklist.driver_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-semibold">{typeLabel}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Iniciado em</p>
                <p className="font-semibold">
                  {fmtDate(checklist.started_at)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fotos</p>
                <p className="font-semibold">{checklist.total_images}</p>
              </div>
            </div>

            {checklist.notes && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Notas</p>
                <p className="text-sm mt-1">{checklist.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observações */}
        {checklist.status === "em_andamento" && (
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Adicione observações sobre este checklist..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px] resize-none"
                maxLength={1000}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {notes.length}/1000 caracteres
                </p>
                <Button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes || saveNotesMutation.isPending}
                  className="gap-2"
                >
                  {isSavingNotes || saveNotesMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar Observações
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Abas */}
        <Tabs defaultValue="imagens" className="space-y-4">
          <TabsList>
            <TabsTrigger value="imagens">
              Imagens ({checklist.total_images})
            </TabsTrigger>
            <TabsTrigger value="passos">Passos</TabsTrigger>
          </TabsList>

          {/* Aba de Imagens */}
          <TabsContent value="imagens" className="space-y-4">
            {checklist.status === "em_andamento" && (
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Imagem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!selectedStep ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Selecione um passo para adicionar uma imagem:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {steps.map((step) => (
                          <Button
                            key={step.key}
                            variant="outline"
                            onClick={() => setSelectedStep(step.key)}
                            className="justify-start"
                          >
                            {step.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">
                          Passo: {steps.find((s) => s.key === selectedStep)?.label}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedStep(null)}
                        >
                          Voltar
                        </Button>
                      </div>
                      <ChecklistImageUpload
                        onImageSelected={(file, km, observation) => {
                          setIsUploadingImage(true);
                          addImageMutation.mutate({ file, km, observation });
                        }}
                        isLoading={isUploadingImage}
                        disabled={isUploadingImage}
                        stepKey={selectedStep || undefined}
                        ultimoKm={ultimoKm}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Grid de Imagens */}
            {checklist.images && checklist.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {checklist.images.map((image) => (
                  <Card key={image.id} className="overflow-hidden group">
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      <img
                        src={image.thumbnail_url}
                        alt={image.step_label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() =>
                            window.open(image.image_url, "_blank")
                          }
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        {checklist.status === "em_andamento" && (
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => setDeleteImageId(image.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="text-xs font-semibold truncate">
                        {image.step_label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fmtDate(image.taken_at)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">
                    Nenhuma imagem adicionada ainda
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba de Passos */}
          <TabsContent value="passos" className="space-y-4">
            <div className="space-y-2">
              {steps.map((step) => {
                const stepImages = imagesByStep[step.key] || [];
                const isCompleted = stepImages.length > 0;

                return (
                  <Card key={step.key}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                          )}
                          <div>
                            <p className="font-semibold">{step.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {stepImages.length} foto
                              {stepImages.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        {step.required && (
                          <Badge variant="outline">Obrigatório</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de confirmação de delete */}
      <AlertDialog open={!!deleteImageId} onOpenChange={() => setDeleteImageId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Remover imagem?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. A imagem será removida permanentemente.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteImageId) {
                  deleteImageMutation.mutate(deleteImageId);
                }
              }}
              disabled={deleteImageMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteImageMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Remover"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
