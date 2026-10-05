import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./integrations/supabase/auth";
import { ThemeProvider } from "@/components/theme-provider";
import { clearLegacyAuthLocalStorage } from "./integrations/supabase/client";
import { enforceRememberMe } from "@/lib/rememberMe";

clearLegacyAuthLocalStorage();

enforceRememberMe().finally(() => {
  createRoot(document.getElementById("root")!).render(
    <ThemeProvider defaultTheme="system" enableSystem attribute="class">
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  );
});
