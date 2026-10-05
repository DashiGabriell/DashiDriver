import { DevPageContainer } from "@/components/dev/DevPageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useChatbotConfig, useUpdateChatbotConfig } from "@/hooks/useChatbot";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const CUSTOM_OPTION = "__custom__";

const openRouterModels = [
  { value: "openai/gpt-4o", label: "OpenAI GPT-4o" },
  { value: "openai/gpt-4o-mini", label: "OpenAI GPT-4o Mini" },
  { value: "openai/gpt-4-turbo", label: "OpenAI GPT-4 Turbo" },
  { value: "anthropic/claude-3.5-sonnet", label: "Anthropic Claude 3.5 Sonnet" },
  { value: "anthropic/claude-3-haiku", label: "Anthropic Claude 3 Haiku" },
  { value: "google/gemini-2.0-flash-001", label: "Google Gemini 2.0 Flash" },
  { value: "google/gemini-2.0-pro-exp-02-05", label: "Google Gemini 2.0 Pro" },
  { value: "meta-llama/llama-3.3-70b-instruct", label: "Meta Llama 3.3 70B" },
  { value: "mistralai/mistral-large-2411", label: "Mistral Large" },
  { value: "deepseek/deepseek-chat", label: "DeepSeek V3" },
  { value: CUSTOM_OPTION, label: "Custom (digitar manualmente)" },
];

function ModelField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const isCustom = !openRouterModels.some((m) => m.value === value);
  const selectValue = isCustom ? CUSTOM_OPTION : value;

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        value={selectValue}
        onChange={(e) => {
          if (e.target.value === CUSTOM_OPTION) {
            onChange("");
          } else {
            onChange(e.target.value);
          }
        }}
        className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 mb-2"
      >
        {openRouterModels.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
      {isCustom && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ex: anthropic/claude-3-opus-20240229"
          className="bg-zinc-900 border-zinc-700 text-white text-sm"
        />
      )}
    </div>
  );
}

export default function DevChatbot() {
  const { data: config, isLoading, refetch } = useChatbotConfig();
  const updateConfig = useUpdateChatbotConfig();

  const [enabled, setEnabled] = useState(true);
  const [model, setModel] = useState("openai/gpt-4o");
  const [modelFallback, setModelFallback] = useState("openai/gpt-4o-mini");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [maxTokens, setMaxTokens] = useState(1024);
  const [temperature, setTemperature] = useState(0.7);
  const [maxHistoryMessages, setMaxHistoryMessages] = useState(10);

  useEffect(() => {
    if (config) {
      setEnabled(config.enabled);
      setModel(config.metadata?.model ?? "openai/gpt-4o");
      setModelFallback(config.metadata?.model_fallback ?? "openai/gpt-4o-mini");
      setSystemPrompt(config.metadata?.system_prompt ?? "");
      setMaxTokens(config.metadata?.max_tokens ?? 1024);
      setTemperature(config.metadata?.temperature ?? 0.7);
      setMaxHistoryMessages(config.metadata?.max_history_messages ?? 10);
    }
  }, [config]);

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync({
        enabled,
        model,
        model_fallback: modelFallback,
        system_prompt: systemPrompt,
        max_tokens: maxTokens,
        temperature,
        max_history_messages: maxHistoryMessages,
      });
      toast.success("Configurações do chatbot salvas!");
    } catch (err) {
      toast.error("Erro ao salvar: " + (err as Error).message);
    }
  };

  const handleReset = () => {
    setEnabled(true);
    setModel("openai/gpt-4o");
    setModelFallback("openai/gpt-4o-mini");
    setSystemPrompt("");
    setMaxTokens(1024);
    setTemperature(0.7);
    setMaxHistoryMessages(10);
  };

  if (isLoading) {
    return (
      <DevPageContainer title="Chatbot">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando configurações...
        </div>
      </DevPageContainer>
    );
  }

  return (
    <DevPageContainer title="Chatbot da Ajuda">
      <div className="space-y-6">
        {/* Status */}
        <div className="flex items-center gap-3">
          <Badge variant={enabled ? "default" : "secondary"}>
            {enabled ? "Ativo" : "Inativo"}
          </Badge>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="rounded"
            />
            Habilitar chatbot nas páginas de ajuda
          </label>
        </div>

        {/* Model */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModelField label="Modelo Principal" value={model} onChange={setModel} />
          <ModelField label="Modelo Fallback" value={modelFallback} onChange={setModelFallback} />
        </div>

        {/* System Prompt */}
        <div>
          <label className="block text-sm font-medium mb-1">System Prompt</label>
          <Textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={5}
            className="bg-zinc-900 border-zinc-700 text-white text-sm"
            placeholder="Instruções para o modelo de IA..."
          />
          <p className="text-xs text-muted-foreground mt-1">
            Define o comportamento do assistente. O contexto das páginas de ajuda é injetado automaticamente.
          </p>
        </div>

        {/* Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Max Tokens: {maxTokens}
            </label>
            <input
              type="range"
              min={256}
              max={4096}
              step={128}
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Temperatura: {temperature.toFixed(1)}
            </label>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Histórico máximo: {maxHistoryMessages} mensagens
            </label>
            <input
              type="range"
              min={2}
              max={50}
              step={1}
              value={maxHistoryMessages}
              onChange={(e) => setMaxHistoryMessages(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={updateConfig.isPending}>
            {updateConfig.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Salvar
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Restaurar padrões
          </Button>
        </div>

        <div className="text-xs text-muted-foreground border-t border-zinc-700 pt-4 mt-4">
          <p className="font-medium mb-1">Modelos disponíveis via OpenRouter:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>OpenAI: GPT-4o, GPT-4o Mini, GPT-4 Turbo</li>
            <li>Anthropic: Claude 3.5 Sonnet, Claude 3 Haiku</li>
            <li>Google: Gemini 2.0 Flash, Gemini 2.0 Pro</li>
            <li>Meta: Llama 3.3 70B</li>
            <li>Mistral: Mistral Large</li>
            <li>DeepSeek: DeepSeek V3</li>
          </ul>
          <p className="mt-2">
            A chave da API deve estar configurada no .env como <code>VITE_OPENROUTER_API_KEY</code>.
          </p>
        </div>
      </div>
    </DevPageContainer>
  );
}
