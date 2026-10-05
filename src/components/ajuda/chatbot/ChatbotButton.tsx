import { useChatbotConfig } from "@/hooks/useChatbot";
import { useAuth } from "@/integrations/supabase/auth";

interface ChatbotButtonProps {
  onClick: () => void;
  hasUnread?: boolean;
}

export function ChatbotButton({ onClick, hasUnread }: ChatbotButtonProps) {
  const { user } = useAuth();
  const { data: config } = useChatbotConfig();

  if (!user || config?.enabled === false) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-all duration-200 flex items-center justify-center group overflow-hidden animate-float"
      aria-label="Abrir assistente de ajuda"
    >
      <img src="/assets/assistente.png" className="w-8 h-8 object-contain" alt="Dashi" />
      {hasUnread && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
      )}
    </button>
  );
}
