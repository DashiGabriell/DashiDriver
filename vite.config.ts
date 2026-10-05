import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "localhost",
    port: 8080,
    hmr: {
      overlay: false,
    },
    middlewareMode: false,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "efeitos": path.resolve(__dirname, "./efeitos"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "jspdf",
      "html2canvas",
      "date-fns",
      "sonner",
      "zod",
      "react-hook-form",
      "@hookform/resolvers",
    ],
    exclude: ["@vite/client", "@vite/env"],
  },
  build: {
    target: "es2020",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
});
