"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin, X, AlertCircle } from "lucide-react";
import { Input } from "components/ui/input";
import { useSearch } from "@/hooks/useSearch";
import { GeocodingFeature } from "@/lib/mapbox-api";

interface SearchBarProps {
  onPlaceSelect?: (place: GeocodingFeature) => void;
  placeholder?: string;
}

export function SearchBar({ onPlaceSelect, placeholder = "Buscar direcciones o lugares..." }: SearchBarProps) {
  const {
    query,
    results,
    loading,
    error,
    handleQueryChange,
    selectPlace,
    clearSearch,
    getSelectedCoordinates
  } = useSearch();

  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        dropdownRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mostrar dropdown cuando hay resultados
  useEffect(() => {
    setIsOpen(results.length > 0 && !loading);
  }, [results, loading]);

  const handlePlaceSelect = (place: GeocodingFeature) => {
    selectPlace(place);
    setIsOpen(false);
    onPlaceSelect?.(place);
  };

  const handleClear = () => {
    clearSearch();
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleQueryChange(e.target.value);
  };

  const handleInputFocus = () => {
    if (results.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="w-full flex px-2 bg-transparent">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
<<<<<<< HEAD
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
              inputRef.current?.blur();
            } else if (e.key === 'ArrowDown' && results.length > 0) {
              e.preventDefault();
              setIsOpen(true);
              
            }
          }}
          placeholder={placeholder}
          className="pl-10 pr-10 border-border text-foreground placeholder-muted-foreground rounded-full focus:bg-transparent focus:ring-1 focus:ring-border focus:border-border w-full bg-transparent transition-colors duration-200 hover:border-border hover:ring-0"
          aria-label="Buscar direcciones o lugares"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-describedby={error ? "search-error" : undefined}
          role="combobox"
          autoComplete="off"
=======
          placeholder="Buscar..."
          className="pl-10 border-border text-foreground placeholder-muted-foreground rounded-full focus:bg-transparent focus:ring-1 focus:ring-border focus:border-border w-full bg-transparent transition-colors duration-200 hover:border-border hover:ring-0"
>>>>>>> 3875d8517a1b40b03f0b5291e2efa1301caa1e0e
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Mensaje de error accesible */}
        {error && !isOpen && (
          <div id="search-error" className="sr-only" aria-live="polite">
            {error}
          </div>
        )}

        {/* Dropdown de resultados */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
            role="listbox"
            aria-label="Resultados de búsqueda"
          >
            {loading && (
              <div className="px-4 py-3 text-sm text-muted-foreground" role="status" aria-live="polite">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Buscando...
                </div>
              </div>
            )}

            {error && (
              <div className="px-4 py-3 text-sm text-destructive" role="alert">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              </div>
            )}

            {!loading && !error && results.map((place, index) => (
              <button
                key={place.id}
                onClick={() => handlePlaceSelect(place)}
                className="w-full px-4 py-3 text-left hover:bg-accent focus:bg-accent focus:outline-none transition-colors flex items-start gap-3"
                role="option"
                aria-selected="false"
                aria-posinset={index + 1}
                aria-setsize={results.length}
              >
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {place.text}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {place.place_name}
                  </div>
                </div>
              </button>
            ))}

            {!loading && !error && results.length === 0 && query && (
              <div className="px-4 py-3 text-sm text-muted-foreground" role="status">
                No se encontraron resultados para "{query}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
