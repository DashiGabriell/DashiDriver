/**
 * ðŸ”— Webhook Leads Integration
 * 
 * Funções para integrar o formulário de diagnóstico (/mobile/presente)
 * com a tabela de leads no Supabase
 * 
 * Squad Dashi - Input Validation & Database Integration
 */

import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// âœ… Schema de validação para dados do webhook
const webhookLeadSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  locadora: z.string().min(2, "Nome da locadora é obrigatório"),
  whatsapp: z.string()
    .min(11, "WhatsApp deve ter 11 dígitos")
    .max(11, "WhatsApp deve ter 11 dígitos")
    .regex(/^\d{11}$/, "WhatsApp deve conter apenas números"),
  frota: z.string().min(1, "Tamanho da frota é obrigatório"),
  pergunta1: z.string().optional(),
  pergunta2: z.string().optional(),
  pergunta3: z.string().optional(),
  pergunta4: z.string().optional(),
  score: z.number().int().min(0).max(100).optional().default(0),
});

export type WebhookLeadData = z.infer<typeof webhookLeadSchema>;

/**
 * Enviar lead para o webhook (n8n, Make, etc.)
 * 
 * @param data Dados do lead validados
 * @returns Promise com resultado do envio
 */
export async function sendLeadToWebhook(data: WebhookLeadData): Promise<{
  success: boolean;
  message: string;
  leadId?: string;
}> {
  try {
    // Validar dados com Zod
    const dadosValidados = webhookLeadSchema.parse(data);

    const webhookUrl = import.meta.env.VITE_WEBHOOK_LEADS_URL;
    if (!webhookUrl) {
      throw new Error("URL do webhook não configurada (VITE_WEBHOOK_LEADS_URL)");
    }

    // Enviar para webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosValidados),
    });

    if (!response.ok) {
      throw new Error(`Webhook retornou status ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      message: "Lead enviado com sucesso",
      leadId: result.id,
    };
  } catch (error) {

    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Inserir lead diretamente no Supabase (sem webhook)
 * 
 * @param data Dados do lead validados
 * @returns Promise com resultado da inserção
 */
export async function insertLeadDirectly(data: WebhookLeadData): Promise<{
  success: boolean;
  message: string;
  leadId?: string;
}> {
  try {
    // Validar dados com Zod
    const dadosValidados = webhookLeadSchema.parse(data);

    // Inserir na tabela
    const { data: result, error } = await supabase
      .from("dashidrive_webhook_leads")
      .insert({
        nome: dadosValidados.nome,
        locadora: dadosValidados.locadora,
        whatsapp: dadosValidados.whatsapp,
        frota: dadosValidados.frota,
        pergunta1: dadosValidados.pergunta1,
        pergunta2: dadosValidados.pergunta2,
        pergunta3: dadosValidados.pergunta3,
        pergunta4: dadosValidados.pergunta4,
        score: dadosValidados.score,
        status: "novo",
        whatsapp_validado: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "Lead criado com sucesso",
      leadId: result?.id,
    };
  } catch (error) {

    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Usar função PostgreSQL para inserir lead (com validações no banco)
 * 
 * @param data Dados do lead
 * @returns Promise com resultado da inserção
 */
export async function insertLeadViaFunction(data: WebhookLeadData): Promise<{
  success: boolean;
  message: string;
  leadId?: string;
}> {
  try {
    // Validar dados com Zod
    const dadosValidados = webhookLeadSchema.parse(data);

    // Chamar função PostgreSQL
    const { data: result, error } = await supabase
      .rpc("insert_webhook_lead", {
        p_nome: dadosValidados.nome,
        p_locadora: dadosValidados.locadora,
        p_whatsapp: dadosValidados.whatsapp,
        p_frota: dadosValidados.frota,
        p_pergunta1: dadosValidados.pergunta1,
        p_pergunta2: dadosValidados.pergunta2,
        p_pergunta3: dadosValidados.pergunta3,
        p_pergunta4: dadosValidados.pergunta4,
        p_score: dadosValidados.score,
      });

    if (error) {
      throw error;
    }

    // Verificar resposta da função
    if (result && result[0]) {
      const response = result[0];
      if (response.status === "erro") {
        throw new Error(response.message);
      }
      return {
        success: true,
        message: response.message,
        leadId: response.id,
      };
    }

    throw new Error("Resposta inválida da função");
  } catch (error) {

    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Obter leads por status
 * 
 * @param status Status do lead
 * @returns Promise com lista de leads
 */
export async function getLeadsByStatus(status: string) {
  try {
    const { data, error } = await supabase
      .from("dashidrive_webhook_leads")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {

    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Obter estatísticas de leads
 * 
 * @returns Promise com estatísticas
 */
export async function getLeadsStatistics() {
  try {
    const { data, error } = await supabase
      .rpc("get_leads_statistics");

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data ? data[0] : null,
    };
  } catch (error) {

    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Atualizar status de um lead
 * 
 * @param leadId ID do lead
 * @param status Novo status
 * @param notas Notas opcionais
 * @returns Promise com resultado da atualização
 */
export async function updateLeadStatus(
  leadId: string,
  status: "novo" | "contatado" | "em_negociacao" | "convertido" | "descartado",
  notas?: string
) {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Adicionar timestamps específicos
    if (status === "contatado") {
      updateData.contacted_at = new Date().toISOString();
    } else if (status === "convertido") {
      updateData.converted_at = new Date().toISOString();
    }

    // Adicionar notas se fornecidas
    if (notas) {
      updateData.notas = notas;
    }

    const { data, error } = await supabase
      .from("dashidrive_webhook_leads")
      .update(updateData)
      .eq("id", leadId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "Lead atualizado com sucesso",
      data,
    };
  } catch (error) {

    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Calcular score baseado nas respostas
 * 
 * @param pergunta1 Resposta pergunta 1
 * @param pergunta2 Resposta pergunta 2
 * @param pergunta3 Resposta pergunta 3
 * @param pergunta4 Resposta pergunta 4
 * @returns Score calculado (0-100)
 */
export async function calculateScore(
  pergunta1: string,
  pergunta2: string,
  pergunta3: string,
  pergunta4: string
): Promise<number> {
  try {
    const { data, error } = await supabase
      .rpc("calculate_lead_score", {
        p_pergunta1: pergunta1,
        p_pergunta2: pergunta2,
        p_pergunta3: pergunta3,
        p_pergunta4: pergunta4,
      });

    if (error) {
      throw error;
    }

    return data || 0;
  } catch (error) {

    // Retornar score padrão em caso de erro
    return 0;
  }
}

/**
 * Validar dados do lead
 * 
 * @param data Dados a validar
 * @returns Resultado da validação
 */
export function validateLeadData(data: unknown) {
  try {
    const validado = webhookLeadSchema.parse(data);
    return {
      valid: true,
      data: validado,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => ({
          field: e.path.join("."),
          message: e.message,
        })),
      };
    }
    return {
      valid: false,
      errors: [{ field: "unknown", message: "Erro desconhecido" }],
    };
  }
}

/**
 * Extrair apenas números de um string
 * 
 * @param value String com possíveis caracteres especiais
 * @returns String com apenas números
 */
export function extrairNumeros(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Formatar WhatsApp para exibição
 * 
 * @param whatsapp WhatsApp em formato limpo (11 dígitos)
 * @returns WhatsApp formatado: (DD) 9XXXX-XXXX
 */
export function formatarWhatsappExibicao(whatsapp: string): string {
  const limpo = extrairNumeros(whatsapp);
  if (limpo.length !== 11) return whatsapp;
  
  return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`;
}

/**
 * Obter nível de risco baseado no score
 * 
 * @param score Score de saúde operacional
 * @returns Nível de risco
 */
export function getNivelRisco(score: number): {
  nivel: "critico" | "moderado" | "maximo";
  label: string;
  cor: string;
} {
  if (score < 50) {
    return {
      nivel: "critico",
      label: "Risco Crítico",
      cor: "text-destructive",
    };
  } else if (score < 80) {
    return {
      nivel: "moderado",
      label: "Risco Moderado",
      cor: "text-amber-500",
    };
  } else {
    return {
      nivel: "maximo",
      label: "Segurança Máxima",
      cor: "text-success",
    };
  }
}
