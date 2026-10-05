import { supabase } from "@/integrations/supabase/client";

export interface ChatbotConfig {
  model: string;
  model_fallback: string;
  system_prompt: string;
  max_tokens: number;
  temperature: number;
  max_history_messages: number;
  knowledge_search_enabled: boolean;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ChatResponse {
  response: string;
  suggestedPages: string[];
}

export const chatbotService = {
  async getConfig(): Promise<{ enabled: boolean; metadata: ChatbotConfig } | null> {
    const { data, error } = await supabase
      .from("feature_flags")
      .select("enabled, metadata")
      .eq("key", "chatbot")
      .maybeSingle();

    if (error || !data) return null;
    return data as { enabled: boolean; metadata: ChatbotConfig };
  },

  async updateConfig(config: Partial<ChatbotConfig> & { enabled?: boolean }): Promise<void> {
    const { data: existing } = await supabase
      .from("feature_flags")
      .select("metadata")
      .eq("key", "chatbot")
      .maybeSingle();

    const currentMetadata = (existing?.metadata ?? {}) as ChatbotConfig;
    const { enabled, ...metadataUpdates } = config;

    const updates: Record<string, unknown> = {};
    if (enabled !== undefined) updates.enabled = enabled;
    updates.metadata = { ...currentMetadata, ...metadataUpdates };

    const { error } = await supabase
      .from("feature_flags")
      .update(updates)
      .eq("key", "chatbot");

    if (error) throw error;
  },

  async sendMessage(params: {
    message: string;
    history: { role: string; content: string }[];
    contextPages: string[];
    currentPage: string;
  }): Promise<ChatResponse> {
    const { data, error } = await supabase.functions.invoke("chatbot-query", {
      body: params,
    });

    if (error) throw new Error(error.message || "Erro ao processar mensagem");
    if (data?.error) throw new Error(data.error);

    return {
      response: data.response,
      suggestedPages: data.suggestedPages ?? [],
    };
  },

  async getHistory(userId: string, limit = 50): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from("chatbot_conversations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).reverse() as ChatMessage[];
  },

  async clearHistory(userId: string): Promise<void> {
    const { error } = await supabase
      .from("chatbot_conversations")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
  },
};
