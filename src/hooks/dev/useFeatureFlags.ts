import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string | null;
  updated_at: string | null;
}

export function useFeatureFlags() {
  return useQuery({
    queryKey: ["dev-feature-flags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feature_flags")
        .select("id, key, enabled, description, created_at, updated_at")
        .order("key", { ascending: true });

      if (error) throw error;
      return (data ?? []) as FeatureFlag[];
    },
  });
}

export function useToggleFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("feature_flags")
        .update({ enabled })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-feature-flags"] });
      toast.success("Feature flag atualizada!");
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar: ${(err as Error).message}`);
    },
  });
}

export function useCreateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      key,
      description,
    }: {
      key: string;
      description: string;
    }) => {
      const { error } = await supabase
        .from("feature_flags")
        .insert({ key, description, enabled: false });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-feature-flags"] });
      toast.success("Feature flag criada!");
    },
    onError: (err) => {
      toast.error(`Erro ao criar: ${(err as Error).message}`);
    },
  });
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      key,
      description,
    }: {
      id: string;
      key?: string;
      description?: string;
    }) => {
      const updates: Record<string, string | boolean> = {};
      if (key !== undefined) updates.key = key;
      if (description !== undefined) updates.description = description;

      const { error } = await supabase
        .from("feature_flags")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-feature-flags"] });
      toast.success("Feature flag atualizada!");
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar: ${(err as Error).message}`);
    },
  });
}

export function useDeleteFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("feature_flags")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-feature-flags"] });
      toast.success("Feature flag removida!");
    },
    onError: (err) => {
      toast.error(`Erro ao remover: ${(err as Error).message}`);
    },
  });
}

export type { FeatureFlag };
