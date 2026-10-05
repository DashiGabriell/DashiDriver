import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

const AjudaLayout = lazy(() => import("@/layouts/ajuda/AjudaLayout"));
const AjudaGestao = lazy(() => import("@/pages/ajuda/gestao/Index"));
const AjudaVeiculos = lazy(() => import("@/pages/ajuda/gestao/Veiculos"));
const AjudaMotoristas = lazy(() => import("@/pages/ajuda/gestao/Motoristas"));
const AjudaChecklists = lazy(() => import("@/pages/ajuda/gestao/Checklists"));
const AjudaPagamentos = lazy(() => import("@/pages/ajuda/gestao/Pagamentos"));
const AjudaFinanciamentoSeguro = lazy(() => import("@/pages/ajuda/gestao/FinanciamentoSeguro"));
const AjudaManutencao = lazy(() => import("@/pages/ajuda/gestao/Manutencao"));
const AjudaLucratividade = lazy(() => import("@/pages/ajuda/gestao/Lucratividade"));
const AjudaAlertas = lazy(() => import("@/pages/ajuda/gestao/Alertas"));
const AjudaUsuarios = lazy(() => import("@/pages/ajuda/gestao/Usuarios"));
const AjudaPerfil = lazy(() => import("@/pages/ajuda/gestao/Perfil"));
const AjudaMarketplace = lazy(() => import("@/pages/ajuda/marketplace/Index"));
const AjudaHome = lazy(() => import("@/pages/ajuda/marketplace/Home"));
const AjudaBuscar = lazy(() => import("@/pages/ajuda/marketplace/Buscar"));
const AjudaDetalhes = lazy(() => import("@/pages/ajuda/marketplace/Detalhes"));
const AjudaAnunciar = lazy(() => import("@/pages/ajuda/marketplace/Anunciar"));
const AjudaFavoritos = lazy(() => import("@/pages/ajuda/marketplace/Favoritos"));
const AjudaPerfilMarketplace = lazy(() => import("@/pages/ajuda/marketplace/Perfil"));
const AjudaMeusAnuncios = lazy(() => import("@/pages/ajuda/marketplace/MeusAnuncios"));
const AjudaPropostas = lazy(() => import("@/pages/ajuda/marketplace/Propostas"));
const AjudaInspecao = lazy(() => import("@/pages/ajuda/marketplace/Inspecao"));
const AjudaListaInspecoes = lazy(() => import("@/pages/ajuda/marketplace/ListaInspecoes"));
export const ajudaRoutes = (
  <Route
    path="/ajuda"
    element={
      <ProtectedRoute requireCompany={false}>
        <AjudaLayout />
      </ProtectedRoute>
    }
  >
    <Route path="gestao" element={<AjudaGestao />} />
    <Route path="gestao/veiculos" element={<AjudaVeiculos />} />
    <Route path="gestao/motoristas" element={<AjudaMotoristas />} />
    <Route path="gestao/checklists" element={<AjudaChecklists />} />
    <Route path="gestao/pagamentos" element={<AjudaPagamentos />} />
    <Route path="gestao/financiamento-seguro" element={<AjudaFinanciamentoSeguro />} />
    <Route path="gestao/manutencao" element={<AjudaManutencao />} />
    <Route path="gestao/lucratividade" element={<AjudaLucratividade />} />
    <Route path="gestao/alertas" element={<AjudaAlertas />} />
    <Route path="gestao/usuarios" element={<AjudaUsuarios />} />
    <Route path="gestao/perfil" element={<AjudaPerfil />} />
    <Route path="marketplace" element={<AjudaMarketplace />} />
    <Route path="marketplace/home" element={<AjudaHome />} />
    <Route path="marketplace/buscar" element={<AjudaBuscar />} />
    <Route path="marketplace/detalhes" element={<AjudaDetalhes />} />
    <Route path="marketplace/anunciar" element={<AjudaAnunciar />} />
    <Route path="marketplace/favoritos" element={<AjudaFavoritos />} />
    <Route path="marketplace/perfil" element={<AjudaPerfilMarketplace />} />
    <Route path="marketplace/meus-anuncios" element={<AjudaMeusAnuncios />} />
    <Route path="marketplace/propostas" element={<AjudaPropostas />} />
    <Route path="marketplace/inspecao" element={<AjudaInspecao />} />
    <Route path="marketplace/lista-inspecoes" element={<AjudaListaInspecoes />} />
  </Route>
);
