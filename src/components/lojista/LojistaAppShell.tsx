import { ReactNode } from "react";
import { LojistaSidebar } from "./LojistaSidebar";

export const LojistaAppShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:block">
        <LojistaSidebar />
      </div>
      
      <main className="flex-1 min-w-0 p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
};
