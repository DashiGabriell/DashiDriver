import { useTheme } from "next-themes";
import { Sun, Moon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DevHeaderProps {
  onToggleSidebar: () => void;
}

export function DevHeader({ onToggleSidebar }: DevHeaderProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="border-b border-border bg-background p-4 flex justify-between items-center gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          title="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg lg:text-xl font-semibold text-foreground truncate">
          Centro de Operações
        </h1>
      </div>
      <div className="flex items-center gap-2 lg:gap-4 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <span className="hidden lg:inline text-sm text-muted-foreground">Dev User</span>
        <div className="h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-emerald-600 shrink-0" />
      </div>
    </header>
  );
}
