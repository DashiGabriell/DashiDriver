import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/integrations/supabase/auth";
import { chatbotService, type ChatMessage, type ChatbotConfig } from "@/integrations/supabase/services/chatbotService";
import { searchKnowledgeBase, getContextForRoutes } from "@/lib/ajuda-knowledge-base";
import { useLocation } from "react-router-dom";

const CHATBOT_QUERY_KEY = ["chatbot"];

interface SendMessageInput {
  message: string;
  history: { role: string; content: string }[];
}

export function useChatbotConfig() {
  return useQuery({
    queryKey: [...CHATBOT_QUERY_KEY, "config"],
    queryFn: () => chatbotService.getConfig(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useChatbotHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...CHATBOT_QUERY_KEY, "history", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      return chatbotService.getHistory(user.id);
    },
  });
}

export function useSendMessage() {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ message, history }: SendMessageInput) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      const relevantPages = searchKnowledgeBase(message, 3);
      const contextPages = relevantPages.length > 0
        ? [getContextForRoutes(relevantPages.map((p) => p.route))]
        : [];

      const currentPage = location.pathname;

      return chatbotService.sendMessage({
        message,
        history,
        contextPages,
        currentPage,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CHATBOT_QUERY_KEY, "history", user?.id] });
    },
  });
}

export function useClearChatHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      return chatbotService.clearHistory(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CHATBOT_QUERY_KEY, "history", user?.id] });
    },
  });
}

export function useUpdateChatbotConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Partial<ChatbotConfig> & { enabled?: boolean }) => {
      return chatbotService.updateConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CHATBOT_QUERY_KEY, "config"] });
    },
  });
}
