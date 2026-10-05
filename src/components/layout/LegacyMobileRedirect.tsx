import { Navigate, useLocation } from "react-router-dom";

/** Antigo app /mobile: endereços salvos e links de campanha caem na tela equivalente da web. */
const LEGACY_MOBILE_PATHS: [string, string][] = [
  ["/mobile/onboarding-cadastro", "/onboarding-cadastro"],
  ["/mobile/trial-expirado", "/trial-expirado"],
  ["/mobile/pagamento-pendente", "/pagamento-pendente"],
  ["/mobile/presente", "/presente"],
  ["/mobile/checklists", "/checklists"],
  ["/mobile/checklist", "/checklists"],
  ["/mobile/frota", "/veiculos"],
  ["/mobile/motoristas", "/motoristas"],
  ["/mobile/pagamentos", "/pagamentos"],
  ["/mobile/alugueis", "/pagamentos"],
  ["/mobile/manutencao", "/manutencao"],
  ["/mobile/alertas", "/alertas"],
  ["/mobile/perfil", "/perfil"],
];

export const LegacyMobileRedirect = () => {
  const { pathname, search } = useLocation();
  const match = LEGACY_MOBILE_PATHS.find(([from]) => pathname === from || pathname.startsWith(`${from}/`));
  if (!match) return <Navigate to={{ pathname: "/dashboard", search }} replace />;
  const [from, to] = match;
  const rest = to === "/checklists" ? pathname.slice(from.length).split("/").slice(0, 2).join("/") : "";
  return <Navigate to={{ pathname: `${to}${rest}`, search }} replace />;
};
