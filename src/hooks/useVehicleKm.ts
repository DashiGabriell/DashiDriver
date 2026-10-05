import { useQuery } from '@tanstack/react-query';
import { kmHistoryService } from '@/integrations/supabase/services/kmHistoryService';

export function useVehicleKm(vehicleId: string | undefined) {
  const history = useQuery({
    queryKey: ['vehicle_km_history', vehicleId],
    queryFn: () => kmHistoryService.getHistory(vehicleId!),
    enabled: !!vehicleId,
  });

  const stats = useQuery({
    queryKey: ['vehicle_km_stats', vehicleId],
    queryFn: () => kmHistoryService.getStats(vehicleId!),
    enabled: !!vehicleId,
  });

  return {
    history: history.data ?? [],
    isLoadingHistory: history.isLoading,
    stats: stats.data ?? { kmTotal: 0, km30dias: 0, mediaDiaria: 0, ultimaAtualizacao: null },
    isLoadingStats: stats.isLoading,
  };
}
