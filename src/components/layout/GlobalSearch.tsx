import { Search, Car, User, Loader2, AlertCircle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCarcontrolUser } from "@/hooks/useCarcontrolUser";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useRealtimeData } from "@/hooks/useRealtimeData";

type VehicleResult = {
  id: string;
  modelo: string;
  placa: string;
  status?: string | null;
};

type DriverResult = {
  id: string;
  nome: string;
  status?: string | null;
  telefone?: string | null;
};

type SearchResult =
  | {
      id: string;
      type: "vehicle";
      title: string;
      subtitle: string;
      href: string;
    }
  | {
      id: string;
      type: "driver";
      title: string;
      subtitle: string;
      href: string;
    };

const normalizeSearch = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const GlobalSearch = () => {
  const { company } = useCarcontrolUser();

  if (!company?.id) {
    return (
      <div className="neu-inset flex items-center gap-2 px-4 py-2.5 w-72 opacity-70">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          disabled
          placeholder="Buscar veiculo, motorista, placa..."
          className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
          aria-label="Buscar veiculo, motorista ou placa"
        />
      </div>
    );
  }

  return <GlobalSearchResults key={company.id} />;
};

const GlobalSearchResults = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const normalizedSearch = normalizeSearch(searchTerm);
  const hasSearch = normalizedSearch.length >= 2;

  const close = useCallback(() => setOpen(false), []);
  const containerRef = useOutsideClick<HTMLDivElement>(close, open);

  const { data: vehicles, loading: loadingVehicles, error: vehiclesError } = useRealtimeData("carcontrol_vehicles", {
    select: "id, modelo, placa, status",
    order: { column: "modelo", ascending: true },
  });

  const { data: drivers, loading: loadingDrivers, error: driversError } = useRealtimeData("carcontrol_drivers", {
    select: "id, nome, status, telefone",
    order: { column: "nome", ascending: true },
  });

  const isLoading = loadingVehicles || loadingDrivers;
  const hasError = vehiclesError || driversError;

  const results = useMemo<SearchResult[]>(() => {
    if (!hasSearch) return [];

    const vehicleResults = (vehicles as VehicleResult[])
      .filter((vehicle) => {
        const model = normalizeSearch(vehicle.modelo ?? "");
        const plate = normalizeSearch(vehicle.placa ?? "");
        return model.includes(normalizedSearch) || plate.includes(normalizedSearch);
      })
      .slice(0, 5)
      .map((vehicle) => ({
        id: vehicle.id,
        type: "vehicle" as const,
        title: vehicle.modelo,
        subtitle: `Placa ${vehicle.placa}`,
        href: `/veiculos/${vehicle.id}`,
      }));

    const driverResults = (drivers as DriverResult[])
      .filter((driver) => normalizeSearch(driver.nome ?? "").includes(normalizedSearch))
      .slice(0, 5)
      .map((driver) => ({
        id: driver.id,
        type: "driver" as const,
        title: driver.nome,
        subtitle: driver.telefone || "Motorista",
        href: `/motoristas/${driver.id}`,
      }));

    return [...vehicleResults, ...driverResults].slice(0, 8);
  }, [drivers, hasSearch, normalizedSearch, vehicles]);

  const handleSelect = (result: SearchResult) => {
    setSearchTerm("");
    setOpen(false);
    navigate(result.href);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setOpen(false);
      (event.target as HTMLInputElement).blur();
    }
  };

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (value.length >= 2) {
      setOpen(true);
    }
  }, []);

  const handleFocus = useCallback(() => {
    if (hasSearch) setOpen(true);
  }, [hasSearch]);

  return (
    <div ref={containerRef} className="relative">
      <div className="neu-inset flex items-center gap-2 px-4 py-2.5 w-72">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Buscar veiculo, motorista, placa..."
          className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
          aria-label="Buscar veiculo, motorista ou placa"
        />
      </div>

      {open && hasSearch && (
        <div className="absolute right-0 top-full z-[100] mt-2 w-96 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          {hasError ? (
            <div className="flex items-center justify-center gap-2 px-4 py-5 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Erro ao buscar dados</span>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando...
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto py-2">
              {results.map((result) => {
                const Icon = result.type === "vehicle" ? Car : User;

                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    type="button"
                    onClick={() => handleSelect(result)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/70"
                  >
                    <span className="neu-sm grid h-9 w-9 shrink-0 place-items-center rounded-full">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {result.title}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {result.subtitle}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-5 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado
            </div>
          )}
        </div>
      )}
    </div>
  );
};
