"use client";

import React, { createContext, useContext, useEffect, useRef, useMemo, useState } from "react";
import { usePanelCollapse } from "components/panels/panel-collapse-context";
import { useTheme } from "@/hooks/useTheme";
import Map, { Layer, MapRef, Source, Marker } from "react-map-gl/mapbox";
import { useRoutePoints, useRoute } from "./route-context";
import { useVehiclePositions } from "./vehicle-context";
import { useSearchContext } from "./search-context";
import { VehicleMarker } from "./vehicle-marker";

interface RouteData {
  id: number;
  outboundPoints: [number, number][] | null;
  returnPoints: [number, number][] | null;
}

// Contexto para exponer el ref del mapa
const MapboxRefContext = createContext<React.MutableRefObject<MapRef | null> | null>(null);
export function useMapboxRef() {
  const ctx = useContext(MapboxRefContext);
  if (!ctx) throw new Error("useMapboxRef debe usarse dentro de MapboxRefContext.Provider");
  return ctx;
}

// Contexto para exponer la ubicación del usuario
const UserLocationContext = createContext<[number, number] | null>(null);
export function useUserLocation() {
  return useContext(UserLocationContext);
}

const MapViewComponent = ({ children }: { children?: React.ReactNode }) => {
  const { isPanelCollapsed } = usePanelCollapse();
  const { theme, mounted } = useTheme();
  const { vehiclePositions } = useVehiclePositions();
  const { routes, selectedRoutes } = useRoutePoints();
  const { focusedRoute } = useRoute();
  const { selectedPlace } = useSearchContext();
  const mapRef = useRef<MapRef | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);


  // Safely access environment variables only on client
  const accessToken = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN : undefined;

  // Define map styles based on theme
  const mapStyles = {
    dark: "mapbox://styles/mapbox/dark-v11",
    light: "mapbox://styles/mapbox/light-v11"
  };

  const currentMapStyle = theme ? mapStyles[theme as keyof typeof mapStyles] : mapStyles.dark;

  // Add arrow icon to map when it loads
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      const map = mapRef.current.getMap();
      if (!map.hasImage('arrow-right')) {
        // Create a simple arrow SVG
        const arrowSvg = `
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 5 L15 10 L10 15 L10 12 L5 12 L5 8 L10 8 Z" fill="currentColor"/>
          </svg>
        `;

        const img = new Image(20, 20);
        img.onload = () => {
          map.addImage('arrow-right', img);
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(arrowSvg);
      }
    }
  }, [mapLoaded]);

  // Obtener la ubicación del usuario
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation([longitude, latitude]);
          },
          (error) => {
            console.error('Error obteniendo ubicación:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutos
          }
        );
      }
    },180000); // Cada 3 minutos
    return () => clearInterval(interval);
  }, []);

  // Update map style when theme changes
  useEffect(() => {
    if (mapRef.current && mapLoaded && theme) {
      const map = mapRef.current.getMap();
      map.setStyle(currentMapStyle);
    }
  }, [theme, currentMapStyle, mapLoaded]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.resize();
    }
  }, [isPanelCollapsed]);

  // Centrar mapa en el lugar seleccionado
  useEffect(() => {
    if (mapRef.current && selectedPlace) {
      mapRef.current.flyTo({
        center: [selectedPlace.center[0], selectedPlace.center[1]],
        zoom: 15,
        duration: 1000,
      });
    }
  }, [selectedPlace]);

  // Center map on selected routes when route points are loaded
  useEffect(() => {
    if (mapRef.current) {
      let routesToCenter: RouteData[] = [];
      let allPoints: [number, number][] = [];

      // Prefer centering on all selected routes. If there's a focused route that's not
      // already selected, include it as well so both types are visible.
      if (selectedRoutes.length > 0) {
        routesToCenter = routes.filter(route => selectedRoutes.includes(route.id));
        if (focusedRoute !== null && !selectedRoutes.includes(focusedRoute)) {
          const focusedRouteData = routes.find(route => route.id === focusedRoute);
          if (focusedRouteData) routesToCenter.push(focusedRouteData);
        }
      } else if (focusedRoute !== null) {
        // No selected routes: show only the focused route
        const focusedRouteData = routes.find(route => route.id === focusedRoute);
        if (focusedRouteData) routesToCenter = [focusedRouteData];
      }

      routesToCenter.forEach(route => {
        if (route.outboundPoints) allPoints.push(...route.outboundPoints);
        if (route.returnPoints) allPoints.push(...route.returnPoints);
      });

      if (allPoints.length > 0) {
        // Calculate bounds
        const bounds = allPoints.reduce(
          (acc, point) => {
            return [
              [Math.min(acc[0][0], point[0]), Math.min(acc[0][1], point[1])],
              [Math.max(acc[1][0], point[0]), Math.max(acc[1][1], point[1])]
            ];
          },
          [[Infinity, Infinity], [-Infinity, -Infinity]]
        );

        // Add padding to bounds
        const padding = 50; // pixels
        mapRef.current.fitBounds(bounds as [[number, number], [number, number]], {
          padding,
          maxZoom: 30,
          duration: 1000
        });
      }
    }
  }, [routes, selectedRoutes, focusedRoute]);

  // Fixed colors: green for outbound, red for return (matching web-admin colors)
  const outboundColor = "#22CA0A";
  const returnColor = "#E60305";

  // Memoizar los datos del mapa para múltiples rutas con optimización de rendimiento
  const routeSources = useMemo(() => {
    const sources: any[] = [];
    // Determine which routes to display based on mode. Show selected routes first.
    let routesToDisplay: RouteData[] = [];

    if (selectedRoutes.length > 0) {
      routesToDisplay = routes.filter(route => selectedRoutes.includes(route.id));
      // If there's a focused route that's not in the selected list, include it too
      if (focusedRoute !== null && !selectedRoutes.includes(focusedRoute)) {
        const focusedRouteData = routes.find(r => r.id === focusedRoute);
        if (focusedRouteData) routesToDisplay.push(focusedRouteData);
      }
      // Limit total number of displayed routes for performance
      routesToDisplay = routesToDisplay.slice(0, 6);
    } else if (focusedRoute !== null) {
      const focusedRouteData = routes.find(r => r.id === focusedRoute);
      if (focusedRouteData) routesToDisplay = [focusedRouteData];
    }

    routesToDisplay.forEach((route, index) => {

      if (route.outboundPoints && route.outboundPoints.length >= 2) {
        sources.push({
          id: `route-${route.id}-outbound-${index}`,
          type: "geojson" as const,
          data: {
            type: "Feature" as const,
            properties: { routeId: route.id, direction: "outbound", color: outboundColor, routeIndex: index },
            geometry: {
              type: "LineString" as const,
              coordinates: route.outboundPoints,
            },
          },
        });
      }

      if (route.returnPoints && route.returnPoints.length >= 2) {
        sources.push({
          id: `route-${route.id}-return-${index}`,
          type: "geojson" as const,
          data: {
            type: "Feature" as const,
            properties: { routeId: route.id, direction: "return", color: returnColor, routeIndex: index },
            geometry: {
              type: "LineString" as const,
              coordinates: route.returnPoints,
            },
          },
        });
      }
    });
    return sources;
  }, [routes, selectedRoutes, focusedRoute]);

  const vehicleMarkers = useMemo(() => {
    console.log('Vehicle positions in map-view:', vehiclePositions);
    if (!vehiclePositions) return [];

    // Filtrar vehículos con datos válidos y key definida
    const validVehicles = Array.from(vehiclePositions.values()).filter(vehicle =>
      vehicle &&
      vehicle.vehicleId &&
      typeof vehicle.latitude === 'number' &&
      typeof vehicle.longitude === 'number' &&
      !isNaN(vehicle.latitude) &&
      !isNaN(vehicle.longitude)
    );

    const markers = validVehicles.map((vehicle) => (
      <VehicleMarker key={vehicle.vehicleId} vehicle={vehicle} />
    ));
    return markers;
  }, [vehiclePositions]);
  const userLocationMarker = useMemo(() => {
    if (!userLocation) return null;
    return (
      <Marker
        longitude={userLocation[0]}
        latitude={userLocation[1]}
        anchor="center"
        style={{ zIndex: 1000 }}
      >
        <div className="relative">
          {/* Círculo pulsante */}
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75 w-6 h-6"></div>
          {/* Punto central */}
          <div className="relative bg-blue-600 rounded-full w-5 h-5 border-2 border-white shadow-lg"></div>
        </div>
      </Marker>
    );
  }, [userLocation]);

  const selectedPlaceMarker = useMemo(() => {
    if (!selectedPlace) return null;
    return (
      <Marker
        longitude={selectedPlace.center[0]}
        latitude={selectedPlace.center[1]}
        anchor="bottom"
        style={{ zIndex: 1100 }}
      >
        <div className="relative">
          {/* Marcador de ubicación seleccionada */}
          <div className="bg-red-500 rounded-full w-6 h-6 border-2 border-white shadow-lg flex items-center justify-center">
            <div className="bg-white rounded-full w-2 h-2"></div>
          </div>
          {/* Etiqueta con el nombre del lugar */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-background border border-border rounded-md px-2 py-1 shadow-lg whitespace-nowrap">
            <div className="text-xs font-medium text-foreground">{selectedPlace.text}</div>
          </div>
        </div>
      </Marker>
    );
  }, [selectedPlace]);

  
  if (!mounted) {
    return (
      <UserLocationContext.Provider value={userLocation}>
        <MapboxRefContext.Provider value={mapRef}>
          <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400">Cargando mapa...</div>
          </div>
        </MapboxRefContext.Provider>
      </UserLocationContext.Provider>
    );
  }

  return (
    <UserLocationContext.Provider value={userLocation}>
      <MapboxRefContext.Provider value={mapRef}>
        <div className="relative w-full h-full">
          <Map
            ref={mapRef}
            mapboxAccessToken={accessToken}
            initialViewState={{
              longitude: -75.28380,
              latitude: 2.93261,
              zoom: 12,
            }}
            mapStyle={currentMapStyle}
            attributionControl={false}
            onLoad={() => setMapLoaded(true)}
          >
            {mapLoaded && vehicleMarkers}
            {mapLoaded && userLocationMarker}
            {mapLoaded && selectedPlaceMarker}
            {mapLoaded && routeSources.map((source) => (
              <Source key={source.id} {...source}>
                {/* Main line layer - enhanced visibility */}
                <Layer
                  id={`${source.id}-layer`}
                  type="line"
                  source={source.id}
                  paint={{
                    "line-color": source.data.properties.color,
                    "line-width": source.data.properties.routeIndex === 0 ? 8 : 6, // Thicker for first route
                    "line-opacity": source.data.properties.routeIndex === 0 ? 1.0 : 0.7,
                    "line-dasharray": source.data.properties.routeIndex > 0 ? [2, 1] : [1, 0], // Dashed for additional routes
                    "line-blur": 0,
                  }}
                  layout={{
                    "line-join": "round",
                    "line-cap": "round",
                    "visibility": "visible",
                  }}
                />

                {/* Highlight layer for better visibility */}
                <Layer
                  id={`${source.id}-highlight-layer`}
                  type="line"
                  source={source.id}
                  paint={{
                    "line-color": source.data.properties.color,
                    "line-width": source.data.properties.routeIndex === 0 ? 4 : 3,
                    "line-opacity": source.data.properties.routeIndex === 0 ? 0.6 : 0.4,
                    "line-dasharray": [1, 0], // Solid line for highlight
                  }}
                  layout={{
                    "line-join": "round",
                    "line-cap": "round",
                    "visibility": "visible",
                  }}
                />
              </Source>
            ))}
          </Map>
          {children}
        </div>
      </MapboxRefContext.Provider>
    </UserLocationContext.Provider>
  );
};

// Memoizar el componente para evitar re-renderizados innecesarios
const MapView = React.memo(MapViewComponent);
export default MapView;
