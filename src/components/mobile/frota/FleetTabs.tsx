import { motion } from "framer-motion";
import { Car, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface FleetTabsProps {
  activeTab: "veiculos" | "motoristas";
  onChange: (tab: "veiculos" | "motoristas") => void;
}

export const FleetTabs = ({ activeTab, onChange }: FleetTabsProps) => {
  return (
    <div className="flex p-1.5 bg-background shadow-neu-inset rounded-[24px] mb-6">
      <button
        onClick={() => onChange("veiculos")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] transition-all duration-300",
          activeTab === "veiculos" 
            ? "bg-accent text-accent-foreground shadow-neu-sm font-bold scale-[1.02]" 
            : "text-muted-foreground font-medium"
        )}
      >
        <Car className="w-4 h-4" />
        <span className="text-sm">Veículos</span>
      </button>
      <button
        onClick={() => onChange("motoristas")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] transition-all duration-300",
          activeTab === "motoristas" 
            ? "bg-accent text-accent-foreground shadow-neu-sm font-bold scale-[1.02]" 
            : "text-muted-foreground font-medium"
        )}
      >
        <Users className="w-4 h-4" />
        <span className="text-sm">Motoristas</span>
      </button>
    </div>
  );
};

export default FleetTabs;
