import { useState, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { AjudaSidebar } from "@/components/ajuda/AjudaSidebar";
import { ChatbotButton } from "@/components/ajuda/chatbot/ChatbotButton";
import { ChatbotPanel } from "@/components/ajuda/chatbot/ChatbotPanel";
import { RouteFallback } from "@/routes/fallback";

export default function AjudaLayout() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AjudaSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-6">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <ChatbotButton onClick={() => setChatOpen(true)} />
      <ChatbotPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
