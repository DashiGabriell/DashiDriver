import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useCarcontrolUser } from "@/hooks/useCarcontrolUser";
import { useMobile } from "@/hooks/use-mobile";
import { AppRoutes } from "@/routes";

const queryClient = new QueryClient();

const MobileRedirectHandler = () => {
  const isMobile = useMobile();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isMobile && location.pathname === "/dashboard") {
      navigate("/mobile/home", { replace: true });
    }
  }, [isMobile, location.pathname, navigate]);

  return null;
};

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
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MobileRedirectHandler />
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
