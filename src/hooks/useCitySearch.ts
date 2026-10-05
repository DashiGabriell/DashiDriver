import { useState, useEffect, useRef } from "react";

const cache = new Map<string, string[]>();

export function useCitySearch(state: string) {
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!state) {
      setCities([]);
      return;
    }

    if (cache.has(state)) {
      setCities(cache.get(state)!);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);

    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar cidades");
        return res.json();
      })
      .then((data: Array<{ nome: string }>) => {
        const names = data.map((m) => m.nome).sort();
        cache.set(state, names);
        setCities(names);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {

          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [state]);

  return { cities, isLoading };
}
