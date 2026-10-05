import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

const satelliteImportPatterns = [
  {
    group: [
      "@/pages/marketplace",
      "@/pages/marketplace/*",
      "@/pages/lojista",
      "@/pages/lojista/*",
      "@/components/marketplace",
      "@/components/marketplace/*",
      "@/components/lojista",
      "@/components/lojista/*",
      "@/layouts/marketplace",
      "@/layouts/marketplace/*",
    ],
    message:
      "Core (gestão/mobile) não importa satélite (marketplace/lojista). Use URL string ou veja planejamento/PRODUCT-BOUNDARIES.md.",
  },
];

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["src/pages/**/*.{ts,tsx}"],
    ignores: [
      "src/pages/*.{ts,tsx}",
      "src/pages/mobile/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          paths: [
            {
              name: "@/integrations/supabase/client",
              message:
                "Evite supabase.from nas pages. Use um service em src/integrations/supabase/services/ (ver planejamento/DOMAIN-LAYER.md).",
            },
          ],
        },
      ],
    },
  },
  {
    // Core gestão pages (flat under src/pages/) — supabase warn + satellite ban
    files: ["src/pages/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/integrations/supabase/client",
              message:
                "Evite supabase.from nas pages. Use um service em src/integrations/supabase/services/ (ver planejamento/DOMAIN-LAYER.md).",
            },
          ],
          patterns: satelliteImportPatterns,
        },
      ],
    },
  },
  {
    // Core mobile — satellite ban only
    files: [
      "src/pages/mobile/**/*.{ts,tsx}",
      "src/components/mobile/**/*.{ts,tsx}",
      "src/hooks/mobile/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: satelliteImportPatterns,
        },
      ],
    },
  },
);
