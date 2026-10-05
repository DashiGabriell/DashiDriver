import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

const PortaldoLojista = lazy(() => import("@/pages/lojista/PortaldoLojista"));
const Oportunidades = lazy(() => import("@/pages/lojista/Oportunidades"));
const MeuEstoque = lazy(() => import("@/pages/lojista/MeuEstoque"));
const VeiculoDetalheLojista = lazy(() => import("@/pages/lojista/VeiculoDetalhe"));
const NovoVeiculo = lazy(() => import("@/pages/lojista/NovoVeiculo"));
const Analytics = lazy(() => import("@/pages/lojista/Analytics"));
const Assinatura = lazy(() => import("@/pages/lojista/Assinatura"));
const PerfilLojista = lazy(() => import("@/pages/lojista/Perfil"));
const Configuracoes = lazy(() => import("@/pages/lojista/Configuracoes"));

export const lojistaRoutes = (
  <>
    <Route path="/lojista/hub" element={<ProtectedRoute><PortaldoLojista /></ProtectedRoute>} />
    <Route path="/lojista/oportunidades" element={<ProtectedRoute><Oportunidades /></ProtectedRoute>} />
    <Route path="/lojista/estoque" element={<ProtectedRoute><MeuEstoque /></ProtectedRoute>} />
    <Route path="/lojista/estoque/novo" element={<ProtectedRoute><NovoVeiculo /></ProtectedRoute>} />
    <Route path="/lojista/veiculo/:id" element={<ProtectedRoute><VeiculoDetalheLojista /></ProtectedRoute>} />
    <Route path="/lojista/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
    <Route path="/lojista/assinatura" element={<ProtectedRoute><Assinatura /></ProtectedRoute>} />
    <Route path="/lojista/perfil" element={<ProtectedRoute><PerfilLojista /></ProtectedRoute>} />
    <Route path="/lojista/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
  </>
);
