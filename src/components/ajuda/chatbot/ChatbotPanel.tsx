import { useState, useRef, useEffect, useCallback } from "react";
import { Send, X, Loader2, Trash2, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useChatbotHistory, useSendMessage, useClearChatHistory } from "@/hooks/useChatbot";
import { useAuth } from "@/integrations/supabase/auth";
import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatbotPanelProps {
  open: boolean;
  onClose: () => void;
}

interface ChatBubble {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedPages?: string[];
}

export function ChatbotPanel({ open, onClose }: ChatbotPanelProps) {
  const { user } = useAuth();
  const { data: history, isLoading: historyLoading } = useChatbotHistory();
  const sendMessage = useSendMessage();
  const clearHistory = useClearChatHistory();

  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (history && history.length > 0 && messages.length === 0) {
      const mapped = history.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        suggestedPages: Array.isArray(msg.metadata?.suggestedPages) ? (msg.metadata.suggestedPages as string[]) : undefined,
      }));
      setMessages(mapped);
    }
  }, [history, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    if (open) {
      setMessages([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming || !user) return;

    setInput("");
    setStreaming(true);

    const userBubble: ChatBubble = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userBubble]);

    try {
      const formattedHistory = messages
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const result = await sendMessage.mutateAsync({
        message: text,
        history: formattedHistory,
      });

      const assistantBubble: ChatBubble = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: result.response,
        suggestedPages: result.suggestedPages,
      };
      setMessages((prev) => [...prev, assistantBubble]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.";
      const errorBubble: ChatBubble = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: errorMessage,
      };
      setMessages((prev) => [...prev, errorBubble]);
    } finally {
      setStreaming(false);
    }
  }, [input, streaming, user, messages, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = async () => {
    await clearHistory.mutateAsync();
    setMessages([]);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent hideCloseButton className="fixed bottom-24 right-6 top-24 left-auto w-full max-w-md translate-x-0 translate-y-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom-[10%] data-[state=open]:slide-in-from-bottom-[10%] sm:rounded-2xl flex flex-col p-0 gap-0 overflow-hidden border shadow-2xl">
        <DialogHeader className="px-4 py-3 border-b bg-card shrink-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <img src="/assets/assistente.png" className="w-6 h-6" alt="Dashi" />
            Dashi
          </DialogTitle>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleClear}
                disabled={clearHistory.isPending}
                title="Limpar conversa"
              >
                {clearHistory.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
          {messages.length === 0 && !historyLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">Como posso ajudar?</p>
              <p className="text-xs mt-1 max-w-xs">
                Pergunte sobre qualquer funcionalidade da DashiDrive. Baseio minhas respostas nas páginas de ajuda.
              </p>
            </div>
          )}

          {historyLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md",
                )}
              >
                <div className="prose prose-sm max-w-none [&_p]:my-0 [&_ul]:my-0 [&_ol]:my-0 [&_li]:my-0 [&_pre]:my-1 [&_code]:text-xs [&_*]:text-foreground whitespace-normal">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </Markdown>
                </div>

                {msg.suggestedPages && msg.suggestedPages.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/20 space-y-1">
                    <p className="text-xs font-medium opacity-70">Páginas relacionadas:</p>
                    {msg.suggestedPages.slice(0, 3).map((page) => (
                      <Link
                        key={page}
                        to={page}
                        onClick={onClose}
                        className="block text-xs underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity"
                      >
                        https://dashidrive.com{page}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {streaming && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 bg-muted">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t bg-card p-3 shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua dúvida..."
              rows={1}
              disabled={streaming}
              className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 min-h-[40px] max-h-[120px]"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || streaming}
              className="h-10 w-10 rounded-xl shrink-0"
            >
              {streaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground/60 text-center mt-1.5">
            Respostas com base nas páginas de ajuda da DashiDrive
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
