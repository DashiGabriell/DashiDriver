import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentual" | "fixo";
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  min_amount: number | null;
  expires_at: string | null;
  active: boolean;
  created_at: string | null;
}

export interface CouponInput {
  code: string;
  description: string;
  discount_type: "percentual" | "fixo";
  discount_value: number;
  max_uses: number | null;
  min_amount: number | null;
  expires_at: string | null;
}

export interface CouponUsageSummary {
  totalUses: number;
  uniqueUsers: number;
  users: { name: string | null; email: string | null }[];
}

export interface CouponUsage {
  id: string;
  user_id: string;
  plan: string;
  amount: number;
  discount_amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  profile_name: string | null;
  profile_email: string | null;
}

export function useCoupons() {
  return useQuery({
    queryKey: ["dev-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Coupon[];
    },
  });
}

export function useCouponUsage(code: string | null) {
  return useQuery({
    queryKey: ["dev-coupon-usage", code],
    enabled: !!code,
    queryFn: async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error("Sessao expirada");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-coupon-usage`,
        {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ couponCode: code }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erro ao carregar uso do cupom");
      }

      return response.json() as Promise<CouponUsage[]>;
    },
  });
}

export function useAllCouponUsage() {
  return useQuery({
    queryKey: ["dev-coupon-usage-all"],
    queryFn: async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error("Sessao expirada");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-coupon-usage`,
        {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erro ao carregar uso de cupons");
      }

      const data: Record<string, CouponUsageSummary> = await response.json();
      return new Map(Object.entries(data));
    },
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CouponInput) => {
      const { error } = await supabase.from("coupons").insert({
        code: input.code.toUpperCase(),
        description: input.description || null,
        discount_type: input.discount_type,
        discount_value: input.discount_value,
        max_uses: input.max_uses,
        min_amount: input.min_amount || null,
        expires_at: input.expires_at || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-coupons"] });
      toast.success("Cupom criado com sucesso!");
    },
    onError: (err) => {
      toast.error(`Erro ao criar cupom: ${(err as Error).message}`);
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Coupon> & { id: string }) => {
      const payload: Record<string, unknown> = {};
      if (updates.code !== undefined) payload.code = updates.code.toUpperCase();
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.discount_type !== undefined) payload.discount_type = updates.discount_type;
      if (updates.discount_value !== undefined) payload.discount_value = updates.discount_value;
      if (updates.max_uses !== undefined) payload.max_uses = updates.max_uses;
      if (updates.min_amount !== undefined) payload.min_amount = updates.min_amount;
      if (updates.expires_at !== undefined) payload.expires_at = updates.expires_at;
      if (updates.active !== undefined) payload.active = updates.active;

      const { error } = await supabase.from("coupons").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-coupons"] });
      toast.success("Cupom atualizado!");
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar cupom: ${(err as Error).message}`);
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-coupons"] });
      toast.success("Cupom removido!");
    },
    onError: (err) => {
      toast.error(`Erro ao remover cupom: ${(err as Error).message}`);
    },
  });
}
