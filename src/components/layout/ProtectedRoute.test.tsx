import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "@/integrations/supabase/auth";
import { useHasCompany } from "@/hooks/useCompany";
import { useProfile } from "@/hooks/useProfile";
import { useAccessControl } from "@/hooks/useAccessControl";

vi.mock("@/integrations/supabase/auth", () => ({ useAuth: vi.fn() }));
vi.mock("@/hooks/useCompany", () => ({ useHasCompany: vi.fn() }));
vi.mock("@/hooks/useProfile", () => ({ useProfile: vi.fn() }));
vi.mock("@/hooks/useAccessControl", () => ({ useAccessControl: vi.fn() }));

const mockAuthenticatedUser = () => {
  vi.mocked(useAuth).mockReturnValue({ session: { user: { id: "1" } }, loading: false } as any);
  vi.mocked(useProfile).mockReturnValue({ data: { id: "1", role: "admin" }, isLoading: false } as any);
  vi.mocked(useAccessControl).mockReturnValue({
    data: { authorized: true, authorizationReason: null, trial: null, companyStatus: true, isTrial: false },
    isLoading: false,
  } as any);
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockAuthenticatedUser();
  });

  it("envia usuario sem empresa para o onboarding-cadastro antes de bloquear por trial", () => {
    vi.mocked(useHasCompany).mockReturnValue({ hasCompany: false, isLoading: false } as any);
    vi.mocked(useAccessControl).mockReturnValue({
      data: { authorized: false, authorizationReason: "trial_expired", trial: null, companyStatus: false, isTrial: false },
      isLoading: false,
    } as any);

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><div>Dashboard</div></ProtectedRoute>} />
          <Route path="/onboarding-cadastro" element={<div>Onboarding Cadastro</div>} />
          <Route path="/trial-expirado" element={<div>Trial Expirado</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Onboarding Cadastro")).toBeInTheDocument();
  });

  it("envia motorista sem empresa para o marketplace em vez de reabrir o funil", () => {
    vi.mocked(useHasCompany).mockReturnValue({ hasCompany: false, isLoading: false } as any);
    vi.mocked(useProfile).mockReturnValue({ data: { id: "1", role: "user", plan: "motorista" }, isLoading: false } as any);

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><div>Dashboard</div></ProtectedRoute>} />
          <Route path="/marketplace/home" element={<div>Marketplace Home</div>} />
          <Route path="/onboarding-cadastro" element={<div>Onboarding Cadastro</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Marketplace Home")).toBeInTheDocument();
  });

  it("bloqueia rota protegida quando usuario tem empresa sem trial nem plano ativo", () => {
    vi.mocked(useHasCompany).mockReturnValue({ hasCompany: true, isLoading: false } as any);
    vi.mocked(useAccessControl).mockReturnValue({
      data: { authorized: false, authorizationReason: "trial_expired", trial: null, companyStatus: false, isTrial: false },
      isLoading: false,
    } as any);

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><div>Dashboard</div></ProtectedRoute>} />
          <Route path="/trial-expirado" element={<div>Trial Expirado</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Trial Expirado")).toBeInTheDocument();
  });

  it("redireciona para pagamento-pendente quando motivo e payment_pending", () => {
    vi.mocked(useHasCompany).mockReturnValue({ hasCompany: true, isLoading: false } as any);
    vi.mocked(useAccessControl).mockReturnValue({
      data: { authorized: false, authorizationReason: "payment_pending", trial: null, companyStatus: false, isTrial: false },
      isLoading: false,
    } as any);

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><div>Dashboard</div></ProtectedRoute>} />
          <Route path="/pagamento-pendente" element={<div>Pagamento Pendente</div>} />
          <Route path="/trial-expirado" element={<div>Trial Expirado</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Pagamento Pendente")).toBeInTheDocument();
  });

  it("mantem onboarding e checkout acessiveis como excecoes do motor de acesso", () => {
    vi.mocked(useHasCompany).mockReturnValue({ hasCompany: false, isLoading: false } as any);
    vi.mocked(useAccessControl).mockReturnValue({
      data: { authorized: false, authorizationReason: "trial_expired", trial: null, companyStatus: false, isTrial: false },
      isLoading: false,
    } as any);

    render(
      <MemoryRouter initialEntries={["/checkout/gestao-basico"]}>
        <Routes>
          <Route path="/checkout/gestao-basico" element={<ProtectedRoute><div>Checkout</div></ProtectedRoute>} />
          <Route path="/trial-expirado" element={<div>Trial Expirado</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Checkout")).toBeInTheDocument();
  });
});
