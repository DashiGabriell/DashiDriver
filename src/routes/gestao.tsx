import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

const Index = lazy(() => import("@/pages/Index"));
const Veiculos = lazy(() => import("@/pages/Veiculos"));
const VeiculoDetalhe = lazy(() => import("@/pages/VeiculoDetalhe"));
const Motoristas = lazy(() => import("@/pages/Motoristas"));
const MotoristaDetalhe = lazy(() => import("@/pages/MotoristaDetalhe"));
const Pagamentos = lazy(() => import("@/pages/Pagamentos"));
const ParcelaSeguro = lazy(() => import("@/pages/ParcelaSeguro"));
const Manutencao = lazy(() => import("@/pages/Manutencao"));
const Lucratividade = lazy(() => import("@/pages/Lucratividade"));
const ControleKm = lazy(() => import("@/pages/ControleKm"));
const Alertas = lazy(() => import("@/pages/Alertas"));
const Perfil = lazy(() => import("@/pages/Perfil"));
const Suporte = lazy(() => import("@/pages/Suporte"));
const Usuarios = lazy(() => import("@/pages/Usuarios"));
const Checklists = lazy(() => import("@/pages/Checklists"));
const ChecklistNew = lazy(() => import("@/pages/ChecklistNew"));
const ChecklistDetail = lazy(() => import("@/pages/ChecklistDetail"));

export const gestaoRoutes = (
  <>
    <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/veiculos" element={<ProtectedRoute><Veiculos /></ProtectedRoute>} />
    <Route path="/veiculos/:id" element={<ProtectedRoute><VeiculoDetalhe /></ProtectedRoute>} />
    <Route path="/motoristas" element={<ProtectedRoute><Motoristas /></ProtectedRoute>} />
    <Route path="/motoristas/:id" element={<ProtectedRoute><MotoristaDetalhe /></ProtectedRoute>} />
    <Route path="/pagamentos" element={<ProtectedRoute><Pagamentos /></ProtectedRoute>} />
    <Route path="/financiamento-seguro" element={<ProtectedRoute><ParcelaSeguro /></ProtectedRoute>} />
    <Route path="/manutencao" element={<ProtectedRoute><Manutencao /></ProtectedRoute>} />
    <Route path="/lucratividade" element={<ProtectedRoute><Lucratividade /></ProtectedRoute>} />
    <Route path="/controle-km" element={<ProtectedRoute><ControleKm /></ProtectedRoute>} />
    <Route path="/alertas" element={<ProtectedRoute><Alertas /></ProtectedRoute>} />
    <Route path="/notifications" element={<Navigate to="/alertas" replace />} />
    <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
    <Route path="/suporte" element={<ProtectedRoute><Suporte /></ProtectedRoute>} />
    <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
    <Route path="/checklists" element={<ProtectedRoute><Checklists /></ProtectedRoute>} />
    <Route path="/checklists/novo" element={<ProtectedRoute><ChecklistNew /></ProtectedRoute>} />
    <Route path="/checklists/:id" element={<ProtectedRoute><ChecklistDetail /></ProtectedRoute>} />
  </>
);
