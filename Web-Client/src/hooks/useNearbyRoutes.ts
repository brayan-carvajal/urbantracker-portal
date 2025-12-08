"use client";

import { useState, useCallback } from 'react';
import { GeocodingFeature } from '@/lib/mapbox-api';

interface RouteData {
  id: number;
  outboundPoints: [number, number][] | null;
  returnPoints: [number, number][] | null;
}

interface RouteInfo {
  id: number;
  numberRoute: string;
  description: string;
  distance: number; // Distancia en metros al punto de búsqueda
  direction: 'outbound' | 'return'; // Si es ida o vuelta la más cercana
}

/**
 * Hook para encontrar rutas cercanas a un punto dado
 */
export function useNearbyRoutes() {
  const [nearbyRoutes, setNearbyRoutes] = useState<RouteInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calcula la distancia entre dos puntos usando la fórmula de Haversine
   */
  const calculateDistance = useCallback((point1: [number, number], point2: [number, number]): number => {
    const [lng1, lat1] = point1;
    const [lng2, lat2] = point2;

    const R = 6371000; // Radio de la Tierra en metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  /**
   * Encuentra la distancia mínima entre un punto y una ruta
   */
  const getMinDistanceToRoute = useCallback((
    targetPoint: [number, number],
    routePoints: [number, number][]
  ): number => {
    if (!routePoints || routePoints.length === 0) return Infinity;

    let minDistance = Infinity;

    // Calcular distancia a cada punto de la ruta
    for (const routePoint of routePoints) {
      const distance = calculateDistance(targetPoint, routePoint);
      minDistance = Math.min(minDistance, distance);
    }

    return minDistance;
  }, [calculateDistance]);

  /**
   * Busca rutas cercanas a un lugar seleccionado
   */
  const findNearbyRoutes = useCallback(async (
    place: GeocodingFeature,
    maxDistance: number = 2000, // 2km por defecto
    maxRoutes: number = 6
  ): Promise<RouteInfo[]> => {
    setLoading(true);
    setError(null);

    try {
      // Validar entrada
      if (!place || !place.center) {
        throw new Error('Ubicación inválida proporcionada');
      }

      // Obtener todas las rutas disponibles con timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const response = await fetch('http://3.142.222.206:8080/api/v1/public/route', {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Servicio de rutas no disponible. Inténtalo más tarde.');
        } else if (response.status >= 500) {
          throw new Error('Error del servidor. Inténtalo más tarde.');
        } else {
          throw new Error(`Error al cargar rutas: ${response.status}`);
        }
      }

      const data = await response.json();
      const routes = data.data || [];

      if (routes.length === 0) {
        setNearbyRoutes([]);
        return [];
      }

      const targetPoint: [number, number] = [place.center[0], place.center[1]];

      // Procesar cada ruta para calcular distancias con límite de concurrencia
      const BATCH_SIZE = 3; // Procesar máximo 3 rutas a la vez
      const routePromises: Promise<RouteInfo | null>[] = [];

      for (let i = 0; i < routes.length; i += BATCH_SIZE) {
        const batch = routes.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (route: any) => {
          try {
            // Timeout para cada petición de geometría
            const geometryController = new AbortController();
            const geometryTimeoutId = setTimeout(() => geometryController.abort(), 5000);

            const geometryResponse = await fetch(
              `http://3.142.222.206:8080/api/v1/public/route/${route.id}/GEOMETRY`,
              { signal: geometryController.signal }
            );

            clearTimeout(geometryTimeoutId);

            if (!geometryResponse.ok) {
              console.warn(`Geometría no disponible para ruta ${route.id}`);
              return null;
            }

            const geometryData = await geometryResponse.json();
            const waypoints = geometryData.data?.waypoints || [];

            if (waypoints.length === 0) {
              return null;
            }

            // Separar puntos de ida y vuelta
            const outboundPoints = waypoints
              .filter((w: any) => w.destine === 'OUTBOUND')
              .sort((a: any, b: any) => a.sequence - b.sequence)
              .map((w: any) => [w.longitude, w.latitude] as [number, number]);

            const returnPoints = waypoints
              .filter((w: any) => w.destine === 'RETURN')
              .sort((a: any, b: any) => a.sequence - b.sequence)
              .map((w: any) => [w.longitude, w.latitude] as [number, number]);

            // Calcular distancias mínimas
            const outboundDistance = outboundPoints.length > 0 ? getMinDistanceToRoute(targetPoint, outboundPoints) : Infinity;
            const returnDistance = returnPoints.length > 0 ? getMinDistanceToRoute(targetPoint, returnPoints) : Infinity;

            // Si no hay puntos válidos en ninguna dirección, omitir
            if (outboundDistance === Infinity && returnDistance === Infinity) {
              return null;
            }

            // Determinar cuál dirección está más cerca
            const minDistance = Math.min(outboundDistance, returnDistance);
            const direction = outboundDistance <= returnDistance ? 'outbound' : 'return';

            if (minDistance <= maxDistance) {
              return {
                id: route.id,
                numberRoute: route.numberRoute,
                description: route.description,
                distance: minDistance,
                direction
              };
            }

            return null;
          } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
              console.warn(`Timeout procesando ruta ${route.id}`);
            } else {
              console.warn(`Error procesando ruta ${route.id}:`, err);
            }
            return null;
          }
        });

        routePromises.push(...batchPromises);

        // Pequeña pausa entre batches para no sobrecargar
        if (i + BATCH_SIZE < routes.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const routeResults = await Promise.all(routePromises);
      const validRoutes = routeResults.filter((route): route is RouteInfo => route !== null);

      // Ordenar por distancia y limitar resultados
      const sortedRoutes = validRoutes
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxRoutes);

      setNearbyRoutes(sortedRoutes);
      return sortedRoutes;

    } catch (err) {
      let errorMessage = 'Error al buscar rutas cercanas';

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'La búsqueda tardó demasiado. Inténtalo de nuevo.';
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      console.error('Error en findNearbyRoutes:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getMinDistanceToRoute]);

  /**
   * Limpia los resultados
   */
  const clearNearbyRoutes = useCallback(() => {
    setNearbyRoutes([]);
    setError(null);
  }, []);

  return {
    nearbyRoutes,
    loading,
    error,
    findNearbyRoutes,
    clearNearbyRoutes
  };
}