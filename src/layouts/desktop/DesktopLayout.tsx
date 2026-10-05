import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export const DesktopLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Main content */}
      <main className="flex-1 min-w-0 p-6">
        {children}
      </main>
    </div>
  );
};

export default DesktopLayout;
