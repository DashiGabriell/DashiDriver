import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useCarcontrolUser } from "@/hooks/useCarcontrolUser";
import { AppRoutes } from "@/routes";

const queryClient = new QueryClient();

const ThemeSync = () => {
  const { theme, setTheme } = useTheme();
  const { profile } = useCarcontrolUser();
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    if (profile?.preferencias) {
      const prefs = profile.preferencias as { tema?: string };
      if (prefs.tema) {
        const targetTheme = prefs.tema === "auto" ? "system" : prefs.tema;
        if (themeRef.current !== targetTheme) {
          setTheme(targetTheme);
        }
      }
    }
  }, [profile, setTheme]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeSync />
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
