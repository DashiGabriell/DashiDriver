import { useState, useEffect } from "react";

/**
 * Hook para detectar media queries e responsividade
 * @param query - Media query CSS (ex: "(min-width: 768px)")
 * @returns boolean indicando se a media query corresponde
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // Handler para mudanças na media query
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Listener moderno
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Hook para detectar se está em mobile (< 1024px)
 */
export function useIsMobile(): boolean {
  return !useMediaQuery("(min-width: 1024px)");
}

/**
 * Hook para detectar se está em tablet (768px - 1023px)
 */
export function useIsTablet(): boolean {
  const isAboveTablet = useMediaQuery("(min-width: 768px)");
  const isBelowDesktop = !useMediaQuery("(min-width: 1024px)");
  return isAboveTablet && isBelowDesktop;
}

/**
 * Hook para detectar se está em desktop (>= 1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
