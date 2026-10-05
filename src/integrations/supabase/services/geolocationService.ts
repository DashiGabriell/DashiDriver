import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AccessLogInsert = Database['public']['Tables']['access_logs']['Insert'];
type AccessLogRow = Database['public']['Tables']['access_logs']['Row'];

interface IpGeoResult {
  ip: string;
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
  countryCode: string;
}

const GEO_CACHE_KEY = 'dashidrive_geo_cache';
const GEO_CACHE_TTL = 86400000;

function getCachedGeo(ip: string): IpGeoResult | null {
  try {
    const raw = localStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw) as Record<string, { data: IpGeoResult; ts: number }>;
    const entry = cache[ip];
    if (!entry) return null;
    if (Date.now() - entry.ts > GEO_CACHE_TTL) {
      delete cache[ip];
      localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cache));
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCachedGeo(ip: string, data: IpGeoResult) {
  try {
    const raw = localStorage.getItem(GEO_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    cache[ip] = { data, ts: Date.now() };
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cache));
  } catch {
  }
}

export const geolocationService = {
  async getClientIP(): Promise<string> {
    try {
      const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      return data.ip;
    } catch {
      return '';
    }
  },

  async geoLocateIP(ip: string): Promise<IpGeoResult | null> {
    if (!ip) return null;

    const cached = getCachedGeo(ip);
    if (cached) return cached;

    const token = import.meta.env.VITE_IPINFO_TOKEN;
    if (!token) {
      console.warn('VITE_IPINFO_TOKEN não configurado. Adicione ao .env');
      return null;
    }

    try {
      const res = await fetch(`https://ipinfo.io/${ip}?token=${token}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.loc) return null;

      const [lat, lng] = data.loc.split(',').map(Number);

      const result: IpGeoResult = {
        ip: data.ip,
        latitude: lat,
        longitude: lng,
        city: data.city ?? '',
        region: data.region ?? '',
        country: data.country ?? '',
        countryCode: data.country ?? '',
      };

      setCachedGeo(ip, result);
      return result;
    } catch {
      return null;
    }
  },

  async logAccess(userId: string, ip: string, geo: IpGeoResult | null) {
    const insert: AccessLogInsert = {
      user_id: userId,
      ip_address: ip,
      latitude: geo?.latitude ?? null,
      longitude: geo?.longitude ?? null,
      city: geo?.city ?? null,
      region: geo?.region ?? null,
      country: geo?.country ?? null,
      country_code: geo?.countryCode ?? null,
      user_agent: navigator.userAgent,
    };

    const { error } = await supabase.from('access_logs').insert(insert);
    if (error) {
      console.error('Erro ao registrar acesso:', error);
    }
  },

  async getAccessLogs(): Promise<AccessLogRow[]> {
    const { data, error } = await supabase
      .from('access_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar logs de acesso:', error);
      return [];
    }
    return data ?? [];
  },

  async getUserLocations(): Promise<{ lat: number; lng: number; city: string; region: string; country: string; userId: string; lastAccess: string }[]> {
    const logs = await this.getAccessLogs();
    const uniqueByUser: Record<string, AccessLogRow> = {};
    for (const log of logs) {
      if (!log.latitude || !log.longitude) continue;
      if (!uniqueByUser[log.user_id] || (log.created_at && log.created_at > (uniqueByUser[log.user_id].created_at ?? ''))) {
        uniqueByUser[log.user_id] = log;
      }
    }
    return Object.values(uniqueByUser)
      .filter(l => l.latitude && l.longitude)
      .map(l => ({
        lat: l.latitude!,
        lng: l.longitude!,
        city: l.city ?? '',
        region: l.region ?? '',
        country: l.country ?? '',
        userId: l.user_id,
        lastAccess: l.created_at ?? '',
      }));
  },
};
