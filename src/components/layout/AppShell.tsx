import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNavbar } from "./MobileNavbar";
import { CriticalAlert } from "@/components/notifications/CriticalAlert";

export const AppShell = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <div className="min-h-screen flex bg-background pb-24 lg:pb-0">
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
      
      {/* Navbar mobile - SEMPRE renderizado FORA do fluxo, garantido visível */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[9999]">
        <MobileNavbar />
      </div>
    </>
  );
};
