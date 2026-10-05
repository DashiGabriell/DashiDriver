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
const AjudaLojista = lazy(() => import("@/pages/ajuda/lojista/Index"));
const AjudaHub = lazy(() => import("@/pages/ajuda/lojista/Hub"));
const AjudaOportunidades = lazy(() => import("@/pages/ajuda/lojista/Oportunidades"));
const AjudaEstoque = lazy(() => import("@/pages/ajuda/lojista/Estoque"));
const AjudaNovoVeiculo = lazy(() => import("@/pages/ajuda/lojista/NovoVeiculo"));
const AjudaVeiculoDetalhe = lazy(() => import("@/pages/ajuda/lojista/VeiculoDetalhe"));
const AjudaAnalytics = lazy(() => import("@/pages/ajuda/lojista/Analytics"));
const AjudaAssinatura = lazy(() => import("@/pages/ajuda/lojista/Assinatura"));
const AjudaPerfilLojista = lazy(() => import("@/pages/ajuda/lojista/Perfil"));
const AjudaConfiguracoes = lazy(() => import("@/pages/ajuda/lojista/Configuracoes"));
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
const AjudaMotorista = lazy(() => import("@/pages/ajuda/motorista/Index"));
const AjudaInicio = lazy(() => import("@/pages/ajuda/motorista/Inicio"));
const AjudaChecklistsMotorista = lazy(() => import("@/pages/ajuda/motorista/Checklists"));
const AjudaFrota = lazy(() => import("@/pages/ajuda/motorista/Frota"));
const AjudaMotoristasLista = lazy(() => import("@/pages/ajuda/motorista/Motoristas"));
const AjudaPagamentosMotorista = lazy(() => import("@/pages/ajuda/motorista/Pagamentos"));
const AjudaAlugueis = lazy(() => import("@/pages/ajuda/motorista/Alugueis"));
const AjudaManutencaoMotorista = lazy(() => import("@/pages/ajuda/motorista/Manutencao"));
const AjudaAlertasMotorista = lazy(() => import("@/pages/ajuda/motorista/Alertas"));
const AjudaPerfilMotorista = lazy(() => import("@/pages/ajuda/motorista/Perfil"));

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
    <Route path="lojista" element={<AjudaLojista />} />
    <Route path="lojista/hub" element={<AjudaHub />} />
    <Route path="lojista/oportunidades" element={<AjudaOportunidades />} />
    <Route path="lojista/estoque" element={<AjudaEstoque />} />
    <Route path="lojista/novo-veiculo" element={<AjudaNovoVeiculo />} />
    <Route path="lojista/veiculo-detalhe" element={<AjudaVeiculoDetalhe />} />
    <Route path="lojista/analytics" element={<AjudaAnalytics />} />
    <Route path="lojista/assinatura" element={<AjudaAssinatura />} />
    <Route path="lojista/perfil" element={<AjudaPerfilLojista />} />
    <Route path="lojista/configuracoes" element={<AjudaConfiguracoes />} />
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
    <Route path="motorista" element={<AjudaMotorista />} />
    <Route path="motorista/inicio" element={<AjudaInicio />} />
    <Route path="motorista/checklists" element={<AjudaChecklistsMotorista />} />
    <Route path="motorista/frota" element={<AjudaFrota />} />
    <Route path="motorista/motoristas" element={<AjudaMotoristasLista />} />
    <Route path="motorista/pagamentos" element={<AjudaPagamentosMotorista />} />
    <Route path="motorista/alugueis" element={<AjudaAlugueis />} />
    <Route path="motorista/manutencao" element={<AjudaManutencaoMotorista />} />
    <Route path="motorista/alertas" element={<AjudaAlertasMotorista />} />
    <Route path="motorista/perfil" element={<AjudaPerfilMotorista />} />
  </Route>
);
