import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { useCompany } from "./useCompany";
import { supportTicketService } from "@/integrations/supabase/services/supportTicketService";

const TICKETS_QUERY_KEY = ["support_tickets"];

export function useSupportTickets() {
  const { user } = useAuth();
  const { data: company } = useCompany();
  const queryClient = useQueryClient();

  const userTicketsQuery = useQuery({
    queryKey: [...TICKETS_QUERY_KEY, "user", user?.id],
    enabled: !!user?.id && !!company?.id,
    queryFn: async () => {
      if (!company?.id) return [];
      return supportTicketService.listByCompany(company.id);
    },
  });

  const allTicketsQuery = useQuery({
    queryKey: [...TICKETS_QUERY_KEY, "all"],
    enabled: false,
    queryFn: async () => {
      return supportTicketService.listAll();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: {
      subject: string;
      message: string;
      files?: File[];
    }) => {
      if (!user?.id || !company?.id) throw new Error("Usuário ou empresa não encontrados");
      return supportTicketService.create({
        ...input,
        user_id: user.id,
        company_id: company.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...TICKETS_QUERY_KEY, "user", user?.id] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "open" | "in_progress" | "resolved" | "closed";
    }) => {
      return supportTicketService.updateStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: { status?: string; priority?: string };
    }) => {
      return supportTicketService.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY });
    },
  });

  return {
    userTickets: userTicketsQuery.data ?? [],
    userTicketsLoading: userTicketsQuery.isLoading,
    userTicketsError: userTicketsQuery.error,
    allTickets: allTicketsQuery.data ?? [],
    allTicketsLoading: allTicketsQuery.isLoading,
    allTicketsError: allTicketsQuery.error,
    fetchAllTickets: () => allTicketsQuery.refetch(),
    createTicket: createMutation.mutateAsync,
    creatingTicket: createMutation.isPending,
    updateStatus: updateStatusMutation.mutateAsync,
    updatingStatus: updateStatusMutation.isPending,
    updateTicket: updateMutation.mutateAsync,
    updatingTicket: updateMutation.isPending,
  };
}
