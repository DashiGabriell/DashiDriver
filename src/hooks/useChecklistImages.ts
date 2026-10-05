import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadChecklistImage, deleteStorageImage } from '@/lib/checklist/storage';
import { checklistService } from '@/integrations/supabase/services/checklistService';
import { toast } from 'sonner';

interface UploadParams {
  file: File;
  stepKey: string;
  stepLabel: string;
  stepOrder: number;
  position: number;
  observation?: string;
  odometroKm?: number;
  context: {
    companyId: string;
    vehicleId: string;
    checklistId: string;
    placa: string;
    empresa: string;
    tipo: string;
  };
}

export function useChecklistImages(checklistId: string) {
  const queryClient = useQueryClient();

  // Mutation para upload e registro de imagem
  const uploadMutation = useMutation({
    mutationFn: async (params: UploadParams) => {
      // 1. Upload para o Storage
      const storageResult = await uploadChecklistImage(
        params.file,
        params.stepKey,
        params.context
      );

      // 2. Registro no Banco de Dados
      return await checklistService.addImage({
        checklist_id: params.context.checklistId,
        company_id: params.context.companyId,
        step_key: params.stepKey,
        step_label: params.stepLabel,
        step_order: params.stepOrder,
        position: params.position,
        image_url: storageResult.imageUrl,
        thumbnail_url: storageResult.thumbnailUrl,
        watermarked_url: storageResult.watermarkedUrl,
        metadata: storageResult.metadata,
        details: params.observation || undefined,
        odometro_km: params.odometroKm || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', checklistId] });
      toast.success('Imagem processada e salva com sucesso!');
    },
    onError: (error) => {

      toast.error('Erro ao enviar imagem. Verifique sua conexão.');
    },
  });

  // Mutation para remover imagem
  const deleteMutation = useMutation({
    mutationFn: async (imageId: string) => {
      // 1. Remover do Banco e obter URLs
      const deletedData = await checklistService.deleteImage(imageId);
      
      // 2. Remover do Storage (Background)
      const urlsToRemove = [
        deletedData.image_url,
        deletedData.thumbnail_url,
        deletedData.watermarked_url
      ].filter(Boolean) as string[];
      
      await deleteStorageImage(urlsToRemove);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', checklistId] });
      toast.success('Imagem removida.');
    },
    onError: (error) => {

      toast.error('Erro ao remover imagem.');
    },
  });

  return {
    upload: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    deleteImage: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
