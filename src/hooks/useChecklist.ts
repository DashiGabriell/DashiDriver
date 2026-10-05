import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistService } from '@/integrations/supabase/services/checklistService';
import { ChecklistInput } from '@/lib/checklist/validators';
import { toast } from 'sonner';

export function useChecklist(checklistId?: string) {
  const queryClient = useQueryClient();

  // Query para obter dados do checklist
  const query = useQuery({
    queryKey: ['checklist', checklistId],
    queryFn: () => checklistService.getById(checklistId!),
    enabled: !!checklistId,
  });

  // Mutation para criar checklist
  const createMutation = useMutation({
    mutationFn: (input: ChecklistInput) => checklistService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      queryClient.invalidateQueries({ queryKey: ['checklists-list'] });
    },
    onError: (error) => {

      toast.error('Não foi possível iniciar a vistoria.');
    },
  });

  // Mutation para finalizar checklist
  const finalizeMutation = useMutation({
    mutationFn: (id: string) => checklistService.finalize(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', checklistId] });
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      queryClient.invalidateQueries({ queryKey: ['checklists-list'] });
      toast.success('Vistoria finalizada com sucesso!');
    },
    onError: (error) => {

      toast.error('Erro ao finalizar vistoria.');
    },
  });

  // Mutation para cancelar checklist
  const cancelMutation = useMutation({
    mutationFn: (id: string) => checklistService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', checklistId] });
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      queryClient.invalidateQueries({ queryKey: ['checklists-list'] });
      toast.success('Vistoria cancelada.');
    },
  });

  return {
    checklist: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    finalize: finalizeMutation.mutateAsync,
    isFinalizing: finalizeMutation.isPending,
    cancel: cancelMutation.mutateAsync,
    isCanceling: cancelMutation.isPending,
  };
}

export function useChecklists(filters: Record<string, unknown> = {}) {
  const hasFilters = Object.keys(filters).length > 0;

  return useQuery({
    queryKey: hasFilters ? ["checklists", filters] : ["checklists-list"],
    queryFn: () =>
      hasFilters ? checklistService.list(filters as any) : checklistService.listDetailed(),
  });
}
