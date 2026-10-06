import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Sidebar } from "./Sidebar";
import { MobileNavbar } from "./MobileNavbar";
import { CriticalAlert } from "@/components/notifications/CriticalAlert";

export const AppShell = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <div className="min-h-screen flex bg-background pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-0">
        {/* Sidebar apenas em desktop - controlado por CSS */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        
        {/* Main content com padding ajustado para mobile */}
        <main className="flex-1 min-w-0 p-4 lg:p-6">
          <CriticalAlert />
          {children}
        </main>
      </div>
      
      {/* Portal no body: ancestrais com transform/filter quebrariam o position: fixed */}
      {createPortal(
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-50">
          <MobileNavbar />
        </div>,
        document.body,
      )}
    </>
  );
};
