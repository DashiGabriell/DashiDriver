import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "../_shared/rate-limit.ts";
import { chatbotQuerySchema } from "../_shared/schemas.ts";
import { readAndParseJsonBody } from "../_shared/validate.ts";

const ALLOWED_ORIGINS = [
  "https://dashidrive.com",
  "https://dashidrive.com.br",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:5173",
];

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin":
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatbotConfig {
  model: string;
  model_fallback: string;
  system_prompt: string;
  max_tokens: number;
  temperature: number;
  max_history_messages: number;
  knowledge_search_enabled: boolean;
}

const DEFAULT_CONFIG: ChatbotConfig = {
  model: "openai/gpt-4o",
  model_fallback: "openai/gpt-4o-mini",
  system_prompt:
    "Você é o assistente virtual de ajuda da plataforma DashiDrive. Sua função é responder dúvidas dos usuários EXCLUSIVAMENTE com base nas informações das páginas de ajuda fornecidas no contexto. Seja cordial, direto e prático. Se a resposta não estiver no contexto fornecido, informe que não encontrou essa informação específica e sugira que o usuário navegue pelas páginas de ajuda disponíveis. Sempre responda em português do Brasil.",
  max_tokens: 1024,
  temperature: 0.7,
  max_history_messages: 10,
  knowledge_search_enabled: true,
};

async function getChatbotConfig(supabaseAdmin: any): Promise<ChatbotConfig> {
  const { data, error } = await supabaseAdmin
    .from("feature_flags")
    .select("metadata, enabled")
    .eq("key", "chatbot")
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar config do chatbot:", error);
  }

  if (data?.enabled === false) {
    return { ...DEFAULT_CONFIG, enabled: false } as any;
  }

  return { ...DEFAULT_CONFIG, ...(data?.metadata ?? {}), enabled: data?.enabled ?? true };
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  temperature: number,
  max_tokens: number,
): Promise<string | null> {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://dashidrive.app.br",
        "X-Title": "DashiDrive Ajuda",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
    },
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => "Unknown error");
    console.error(`OpenRouter error (${response.status}):`, errText);
    return null;
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders(req.headers.get("origin")),
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Token de autenticacao ausente");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      global: { headers: { apikey: supabaseKey } },
    });

    const token = authHeader.replace("Bearer ", "");

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      throw new Error("Usuario nao autenticado");
    }

    const supabaseUser = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      global: { headers: { apikey: supabaseKey, Authorization: authHeader } },
    });

    const { allowed, retryAfter } = await checkRateLimit(
      supabaseUser,
      `chatbot:${user.id}`,
      RATE_LIMITS.chatbot.max,
      RATE_LIMITS.chatbot.windowSeconds,
    );
    if (!allowed) return rateLimitResponse(req.headers.get("origin"), retryAfter);

    const headers = corsHeaders(req.headers.get("origin"));
    const parsed = await readAndParseJsonBody(req, chatbotQuerySchema, headers);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    const config = await getChatbotConfig(supabaseUser);
    if (!(config as any).enabled) {
      return new Response(
        JSON.stringify({
          response: "O assistente de ajuda está desativado no momento.",
          suggestedPages: [],
        }),
        {
          headers: {
            ...corsHeaders(req.headers.get("origin")),
            "Content-Type": "application/json",
          },
        },
      );
    }

    const history = (body.history ?? []).slice(
      -(config.max_history_messages || 10),
    );

    const systemContent = config.system_prompt + "\n\n" +
      (body.contextPages?.length > 0
        ? `Contexto das páginas de ajuda:\n${body.contextPages.join("\n")}`
        : "Nenhum contexto adicional foi encontrado para esta pergunta.");

    const messages: ChatMessage[] = [
      { role: "system", content: systemContent },
      ...history,
      { role: "user", content: body.message },
    ];

    const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openRouterKey) {
      throw new Error("OPENROUTER_API_KEY nao configurada");
    }

    let responseText = await callOpenRouter(
      openRouterKey,
      config.model,
      messages,
      config.temperature ?? 0.7,
      config.max_tokens ?? 1024,
    );

    if (!responseText && config.model_fallback) {
      responseText = await callOpenRouter(
        openRouterKey,
        config.model_fallback,
        messages,
        config.temperature ?? 0.7,
        config.max_tokens ?? 1024,
      );
    }

    if (!responseText) {
      throw new Error("Nao foi possivel obter resposta do modelo de IA");
    }

    const suggestedPages: string[] = [];
    for (const ctx of body.contextPages ?? []) {
      const re = /--- Página:\s*(\S+)\s*---/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(ctx)) !== null) {
        if (suggestedPages.length >= 3) break;
        suggestedPages.push(m[1]);
      }
      if (suggestedPages.length >= 3) break;
    }

    const result = {
      response: responseText,
      suggestedPages,
    };

    const { error: saveError } = await supabaseUser
      .from("chatbot_conversations")
      .insert([
        { user_id: user.id, role: "user", content: body.message },
        { user_id: user.id, role: "assistant", content: responseText, metadata: { suggestedPages } },
      ]);

    if (saveError) {
      console.error("Erro ao salvar conversa:", saveError);
    }

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders(req.headers.get("origin")),
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Chatbot error:", error?.message);

    return new Response(
      JSON.stringify({
        error: error?.message ?? "Erro desconhecido",
        response: null,
        suggestedPages: [],
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders(req.headers.get("origin")),
          "Content-Type": "application/json",
        },
      },
    );
  }
});
