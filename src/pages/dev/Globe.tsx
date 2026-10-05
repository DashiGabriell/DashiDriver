import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GlobeMap } from "@/components/map/GlobeMap";
import { useAccessLogs } from "@/hooks/useAccessLogs";
import { Globe, Users, MapPin, Activity } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

export default function DevGlobe() {
  const { locations, loading, error } = useAccessLogs();
  const isMobile = useMobile();

  const uniqueCountries = useMemo(() => {
    const countries = new Set(locations.map(l => l.country).filter(Boolean));
    return countries.size;
  }, [locations]);

  const uniqueCities = useMemo(() => {
    const cities = new Set(locations.map(l => `${l.city}, ${l.region}`).filter((c: string) => c !== ', '));
    return cities.size;
  }, [locations]);

  const totalUsers = useMemo(() => {
    return new Set(locations.map(l => l.userId)).size;
  }, [locations]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Globo de Acessos</h1>
        <p className="text-muted-foreground">Visualização geográfica dos acessos à plataforma</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cidades</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCities}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Países</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCountries}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mapa Global</CardTitle>
          <CardDescription>
            {locations.length > 0
              ? `${locations.length} localizações exibidas no globo`
              : "Nenhum dado de localização disponível ainda"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {loading ? (
            <div className="flex items-center justify-center h-[500px] text-muted-foreground">
              Carregando localizações...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-[500px] text-destructive">
              {error}
            </div>
          ) : locations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground gap-2">
              <Globe className="h-12 w-12 opacity-30" />
              <p>Nenhum acesso registrado ainda</p>
              <p className="text-xs">Os dados aparecerão aqui conforme usuários acessarem a plataforma</p>
            </div>
          ) : (
            <GlobeMap
              points={locations}
              width={isMobile ? 320 : 550}
              height={isMobile ? 320 : 550}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
