
import React, { createContext, useContext, useEffect, useRef, useMemo } from "react";
import { usePanelCollapse } from "components/panels/panel-collapse-context";
import Map, { Layer, MapRef, Source } from "react-map-gl/mapbox";
import { useRoutePoints, useRoute } from "./route-context";
import { useVehiclePositions } from "./vehicle-context";
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

const MapViewComponent = ({ children }: { children?: React.ReactNode }) => {
  const { isPanelCollapsed } = usePanelCollapse();
  const { vehiclePositions } = useVehiclePositions();
  const { routes, selectedRoutes } = useRoutePoints();
  const { focusedRoute } = useRoute();
  const mapRef = useRef<MapRef | null>(null);
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [mapLoaded, setMapLoaded] = React.useState(false);

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

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.resize();
    }
  }, [isPanelCollapsed]);

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

  // Fixed colors: green for outbound, red for return
  const outboundColor = "#5BE201";
  const returnColor = "#FF4444";

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
    const markers = Array.from(vehiclePositions.values()).map((vehicle) => (
      <VehicleMarker key={vehicle.vehicleId} vehicle={vehicle} />
    ));
    console.log('Created markers:', markers.length);
    return markers;
  }, [vehiclePositions]);

  return (
    <MapboxRefContext.Provider value={mapRef}>
      <div className="relative w-full h-full">
        <Map
          ref={mapRef}
          mapboxAccessToken={accessToken}
          initialViewState={{
            longitude: -74.08175,
            latitude: 4.60971,
            zoom: 15,
          }}
          mapStyle="mapbox://styles/afsb114/cmf7eaden003301s563d81iss"
          attributionControl={false}
          onLoad={() => setMapLoaded(true)}
        >
          {mapLoaded && vehicleMarkers}
          {mapLoaded && routeSources.map((source) => (
            <Source key={source.id} {...source}>
              {/* Glow effect layer */}
              <Layer
                id={`${source.id}-glow`}
                type="line"
                source={source.id}
                paint={{
                  "line-color": source.data.properties.color,
                  "line-width": 20,
                  "line-opacity": 0.3,
                  "line-blur": 3,
                }}
                layout={{
                  "line-join": "round",
                  "line-cap": "round",
                }}
              />
              {/* Main line layer with dash pattern for overlapping routes */}
              <Layer
                id={`${source.id}-layer`}
                type="line"
                source={source.id}
                paint={{
                  "line-color": source.data.properties.color,
                  "line-width": 6,
                  "line-opacity": 0.9,
                  "line-dasharray": source.data.properties.routeIndex > 0 ? [2, 1] : [1, 0], // Dashed for additional routes
                }}
                layout={{
                  "line-join": "round",
                  "line-cap": "round",
                }}
              />
            </Source>
          ))}
        </Map>
        {children}
      </div>
    </MapboxRefContext.Provider>
  );
};

// Memoizar el componente para evitar re-renderizados innecesarios
const MapView = React.memo(MapViewComponent);
export default MapView;
