"use client";

import { useState, useCallback, useRef } from 'react';
import { getMapboxService, GeocodingFeature } from '@/lib/mapbox-api';

//Hook para manejar la búsqueda de direcciones y lugares con autocompletado usando Mapbox Geocoding API

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<GeocodingFeature | null>(null);

  // Debounce ref para evitar llamadas excesivas a la API
  const debounceRef = useRef<NodeJS.Timeout>();


   //Realiza la búsqueda usando Mapbox Geocoding API
  const searchPlaces = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const mapboxService = getMapboxService();
      const response = await mapboxService.geocode(searchQuery, {
        limit: 5,
        country: 'co', // Limitar a Colombia
        types: ['address', 'poi', 'place'], // Direcciones, puntos de interés, lugares
        autocomplete: true
      });

      setResults(response.features);
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido en la búsqueda');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Función debounced para búsqueda
   */
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchPlaces(searchQuery);
    }, 300); // 300ms de debounce
  }, [searchPlaces]);

  /**
   * Maneja el cambio en el input de búsqueda
   */
  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    debouncedSearch(newQuery);
  }, [debouncedSearch]);

  /**
   * Selecciona un lugar de los resultados
   */
  const selectPlace = useCallback((place: GeocodingFeature) => {
    setSelectedPlace(place);
    setQuery(place.place_name);
    setResults([]);
  }, []);

  /**
   * Limpia la búsqueda y resultados
   */
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setSelectedPlace(null);
  }, []);

  /**
   * Obtiene las coordenadas del lugar seleccionado
   */
  const getSelectedCoordinates = useCallback((): [number, number] | null => {
    if (!selectedPlace) return null;
    return [selectedPlace.center[0], selectedPlace.center[1]]; // [lng, lat]
  }, [selectedPlace]);

  return {
    query,
    results,
    loading,
    error,
    selectedPlace,
    handleQueryChange,
    selectPlace,
    clearSearch,
    getSelectedCoordinates
  };
}