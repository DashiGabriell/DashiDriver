import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useCitySearch } from "@/hooks/useCitySearch";
import { Loader2, MapPin } from "lucide-react";

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  state: string;
  placeholder?: string;
  className?: string;
}

export function CityAutocomplete({ value, onChange, state, placeholder, className }: CityAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const { cities, isLoading } = useCitySearch(state);

  const suggestions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed || !cities.length) return [];
    return cities
      .filter((c) => c.toLowerCase().includes(trimmed))
      .slice(0, 20);
  }, [cities, query]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const updateDropdownPosition = useCallback(() => {
    if (inputRef.current && isOpen && suggestions.length > 0) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [isOpen, suggestions.length]);

  useEffect(() => {
    updateDropdownPosition();
    window.addEventListener("scroll", updateDropdownPosition, true);
    window.addEventListener("resize", updateDropdownPosition);
    return () => {
      window.removeEventListener("scroll", updateDropdownPosition, true);
      window.removeEventListener("resize", updateDropdownPosition);
    };
  }, [updateDropdownPosition]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    setIsOpen(true);
    setHighlightIndex(-1);
    onChange(v);
  };

  const handleSelect = (city: string) => {
    setQuery(city);
    onChange(city);
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightIndex(-1);
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    setTimeout(updateDropdownPosition, 0);
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  const dropdown =
    isOpen && suggestions.length > 0
      ? createPortal(
          <div style={dropdownStyle} className="bg-popover border border-border rounded-2xl shadow-lg overflow-hidden">
            {suggestions.map((city, i) => (
              <button
                key={city}
                type="button"
                onMouseDown={() => handleSelect(city)}
                className={`w-full flex items-center gap-2 px-4 py-3 text-sm text-left transition-colors ${
                  i === highlightIndex ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
                }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                {city}
              </button>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={state ? placeholder || "Digite a cidade" : "Selecione o estado primeiro"}
        disabled={!state}
        className={className}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      )}
      {dropdown}
    </div>
  );
}
