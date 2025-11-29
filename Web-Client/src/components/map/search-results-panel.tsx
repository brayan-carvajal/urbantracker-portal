"use client";

import { useEffect } from 'react';
import { MapPin, Route, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNearbyRoutes } from '@/hooks/useNearbyRoutes';
import { GeocodingFeature } from '@/lib/mapbox-api';
import { useRoute } from './route-context';

interface SearchResultsPanelProps {
  selectedPlace: GeocodingFeature;
  onBack?: () => void;
}

export function SearchResultsPanel({ selectedPlace, onBack }: SearchResultsPanelProps) {
  const { nearbyRoutes, loading, error, findNearbyRoutes } = useNearbyRoutes();
  const { loadRoute, setFocusedRoute, setSelectedRoutes } = useRoute();

  // Buscar rutas cercanas cuando se selecciona un lugar
  useEffect(() => {
    findNearbyRoutes(selectedPlace, 2000, 6); // 2km, máximo 6 rutas
  }, [selectedPlace, findNearbyRoutes]);

  const handleRouteSelect = async (routeId: number) => {
    try {
      await loadRoute(routeId);
      setFocusedRoute(routeId);
      // También agregar a rutas seleccionadas para mostrar en el mapa
      setSelectedRoutes(prev => {
        if (!prev.includes(routeId)) {
          return [...prev, routeId];
        }
        return prev;
      });
    } catch (err) {
      console.error('Error al cargar ruta:', err);
    }
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const getDirectionLabel = (direction: 'outbound' | 'return'): string => {
    return direction === 'outbound' ? 'Ida' : 'Vuelta';
  };

  const getDirectionColor = (direction: 'outbound' | 'return'): string => {
    return direction === 'outbound' ? 'bg-red-500' : 'bg-green-500';
  };

  return (
    <div className="h-full overflow-y-auto hide-scrollbar px-2 py-2 space-y-4">
      {/* Botón de volver */}
      {onBack && (
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-muted-foreground text-sm font-medium px-0.5 py-0 rounded-md border border-transparent transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-border bg-transparent cursor-pointer hover:bg-accent hover:border-border hover:text-foreground"
            title="Volver a la búsqueda"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
        </div>
      )}

      {/* Información del lugar seleccionado */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Lugar seleccionado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">{selectedPlace.text}</h3>
            <p className="text-sm text-muted-foreground">{selectedPlace.place_name}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Coordenadas:</span>
              <code className="bg-muted px-1 py-0.5 rounded text-xs">
                {selectedPlace.center[1].toFixed(6)}, {selectedPlace.center[0].toFixed(6)}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rutas recomendadas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Route className="h-5 w-5 text-primary" />
            Rutas recomendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Buscando rutas cercanas...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <div className="text-sm text-destructive">{error}</div>
            </div>
          )}

          {!loading && !error && nearbyRoutes.length === 0 && (
            <div className="text-center py-8">
              <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-sm font-medium text-foreground mb-2">No se encontraron rutas cercanas</h3>
              <p className="text-xs text-muted-foreground mb-4">
                No hay rutas disponibles dentro de 2km de la ubicación seleccionada.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Intenta buscar un lugar diferente</p>
                <p>• Verifica que la ubicación esté en una zona con servicio de transporte</p>
              </div>
            </div>
          )}

          {!loading && !error && nearbyRoutes.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Se encontraron {nearbyRoutes.length} ruta{nearbyRoutes.length !== 1 ? 's' : ''} cerca de la ubicación
              </p>

              {nearbyRoutes.map((route) => (
                <div
                  key={route.id}
                  className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleRouteSelect(route.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{route.numberRoute}</h4>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getDirectionColor(route.direction)}`}
                        >
                          {getDirectionLabel(route.direction)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{route.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>A {formatDistance(route.distance)} de distancia</span>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 px-2">
                      <span className="text-xs">Ver ruta</span>
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}