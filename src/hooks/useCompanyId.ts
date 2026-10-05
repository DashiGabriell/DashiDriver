/**
 * Hook para obter company_id do usuário atual
 * 
 * Útil para adicionar automaticamente company_id em operações de criação
 * 
 * @author Squad Dashi
 * @date 2026-05-04
 */

import { useCompany } from "./useCompany";

/**
 * Hook simples que retorna apenas o company_id
 * Útil para adicionar em inserts/updates
 */
export function useCompanyId() {
  const { data: company } = useCompany();
  
  return company?.id || null;
}

/**
 * Hook que retorna um objeto com company_id pronto para spread
 * 
 * @example
 * ```tsx
 * const companyData = useCompanyData();
 * 
 * await supabase.from("vehicles").insert({
 *   ...companyData,
 *   placa: "ABC1234",
 *   modelo: "Gol"
 * });
 * ```
 */
export function useCompanyData() {
  const companyId = useCompanyId();
  
  return companyId ? { company_id: companyId } : {};
}
