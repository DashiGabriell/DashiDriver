import { useState, useEffect, useCallback } from 'react';
import { geolocationService } from '@/integrations/supabase/services/geolocationService';

interface UserLocation {
  lat: number;
  lng: number;
  city: string;
  region: string;
  country: string;
  userId: string;
  lastAccess: string;
}

export function useAccessLogs() {
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await geolocationService.getUserLocations();
      setLocations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar localizações');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return { locations, loading, error, refetch: fetchLocations };
}
