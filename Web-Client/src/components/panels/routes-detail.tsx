import React, { useState, useEffect } from "react";
import { Bus } from "lucide-react";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useVehiclePositions } from '../map/vehicle-context';
import { useRoutePoints, useRoute } from '../map/route-context';


// Interface que define la estructura de una ruta de transporte público
export interface Route {
  id: number;
  name: string;
  description: string;

  start: string;
  end: string;

  imageStart: string;
  imageEnd: string;

  startDetail: string;
  endDetail: string;
}

// Interface para mensajes de telemetría de vehículos
export interface VehicleTelemetryMessage {
 vehicleId: string;
 timestamp: string;
 latitude: number;
 longitude: number;
 source: string;
}

// Componente que muestra el detalle de una ruta seleccionada
export function RoutesDetail({ route, onBack }: { route: Route; onBack: () => void }) {
  console.log('Route id:', route.id);
  const [fullRoute, setFullRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const { setVehiclePositions } = useVehiclePositions();
    const { addRoute, routes: contextRoutes, setFocusedRoute } = useRoute();

  useEffect(() => {
    // Establecer ruta básica
    setFullRoute(route);

    // Comprobar si ya tenemos los datos de la ruta en el contexto
    const existingRoute = contextRoutes.find(r => r.id === route.id);
    if (existingRoute?.outboundPoints && existingRoute?.returnPoints) {
      // Construir start/end desde los puntos cached
      const firstOut = existingRoute.outboundPoints[0];
      const lastOut = existingRoute.outboundPoints[existingRoute.outboundPoints.length - 1];
      if (firstOut && lastOut) {
        setFullRoute({
          ...route,
          start: `${firstOut[1]}, ${firstOut[0]}`,
          end: `${lastOut[1]}, ${lastOut[0]}`,
          startDetail: `Inicio: ${firstOut[1]}, ${firstOut[0]}`,
          endDetail: `Fin: ${lastOut[1]}, ${lastOut[0]}`,
          imageStart: route.imageStart ? `/${route.imageStart}` : '/ruta1.png',
          imageEnd: route.imageEnd ? `/${route.imageEnd}` : '/ruta2.png',
        });
      }
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://3.142.222.206:8080/api/v1/public/route/${route.id}/GEOMETRY`);
        if (!response.ok) throw new Error('Error al cargar detalle de ruta');
        let data: any;
        try {
          data = await response.json();
        } catch (jsonErr) {
          const raw = await response.text().catch(() => '<unreadable>');
          throw jsonErr;
        }
        // Asumir data.data es RouteDetailsResDto
        const detail = data.data || {};
        // Mapear waypoints a start/end
        const waypoints = detail.waypoints || [];
        if (!Array.isArray(waypoints) || waypoints.length === 0) {
          setError('No hay puntos de ruta disponibles');
          setLoading(false);
          return;
        }
        const first = waypoints.find((w: any) => w.sequence === 1) || waypoints[0];
        const last = waypoints.reduce((prev: any, curr: any) => (prev && curr && curr.sequence > prev.sequence) ? curr : prev, waypoints[0] || first);

        // Separar puntos outbound y return
        const outboundPoints = waypoints
          .filter((w: any) => w.destine === 'OUTBOUND')
          .sort((a: any, b: any) => a.sequence - b.sequence)
          .map((w: any) => [w.longitude, w.latitude] as [number, number]);

        const returnPoints = waypoints
          .filter((w: any) => w.destine === 'RETURN')
          .sort((a: any, b: any) => a.sequence - b.sequence)
          .map((w: any) => [w.longitude, w.latitude] as [number, number]);

        // Setear puntos de ruta en el contexto
        addRoute(route.id, outboundPoints, returnPoints);

        if (first && last) {
          setFullRoute({
            ...route,
            start: `${first.latitude}, ${first.longitude}`,
            end: `${last.latitude}, ${last.longitude}`,
            startDetail: `Inicio: ${first.latitude}, ${first.longitude}`,
            endDetail: `Fin: ${last.latitude}, ${last.longitude}`,
            imageStart: route.imageStart || '',
            imageEnd: route.imageEnd || '',
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [route.id, addRoute, contextRoutes]);

  useEffect(() => {
    if (!fullRoute) {
      // No limpiar los puntos para mantener las rutas visibles
      return;
    }

    // Limpiar posiciones anteriores al cambiar de ruta
    setVehiclePositions(new Map());

    const client = new Client({
      webSocketFactory: () => new SockJS('http://3.142.222.206:8080/ws/connect'),
      onConnect: () => {
        console.log('Connected to WebSocket');
        console.log('Subscribing to /topic/route/' + route.id + '/telemetry');
        client.subscribe(`/topic/route/${route.id}/telemetry`, (message) => {
          console.log('Received telemetry for route:', message.body);
          setTelemetry(message.body);
          try {
            const telemetryData: VehicleTelemetryMessage = JSON.parse(message.body);
            console.log('Parsed telemetry data:', telemetryData);
            console.log('Setting vehicle positions for', telemetryData.vehicleId);
            setVehiclePositions(prev => {
              const newMap = new Map(prev.set(telemetryData.vehicleId, telemetryData));
              console.log('New vehicle positions:', newMap);
              return newMap;
            });
            setParseError(null); // Limpiar error si se parsea correctamente
          } catch (err) {
            console.error('Error parsing telemetry JSON:', err);
            setParseError('Error al parsear mensaje de telemetría: formato JSON inválido');
          }
        });

        // También suscribirse a telemetría de vehículos sin ruta asignada
        console.log('Subscribing to /topic/vehicles/+/telemetry');
        client.subscribe('/topic/vehicles/+/telemetry', (message) => {
          console.log('Received vehicle telemetry:', message.body);
          setTelemetry(message.body);
          try {
            const telemetryData: VehicleTelemetryMessage = JSON.parse(message.body);
            console.log('Parsed vehicle telemetry data:', telemetryData);
            setVehiclePositions(prev => new Map(prev.set(telemetryData.vehicleId, telemetryData)));
            setParseError(null); // Limpiar error si se parsea correctamente
          } catch (err) {
            console.error('Error parsing vehicle telemetry JSON:', err);
            setParseError('Error al parsear mensaje de telemetría de vehículo: formato JSON inválido');
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
      // Limpiar posiciones al desmontar
      setVehiclePositions(new Map());
      
    };
  }, [fullRoute, setVehiclePositions]);

  // Mantener el foco en esta ruta mientras el componente esta montado
  useEffect(() => {
    setFocusedRoute(route.id);
    return () => {
      setFocusedRoute(null);
    };
  }, [route.id, setFocusedRoute]);

  if (loading) return <div className="text-card-foreground">Cargando detalle...</div>;
  if (error) return (
    <div className="text-destructive">
      Error: {error}
      <br />
      <button className="mt-2 px-2 py-1 bg-accent text-card-foreground rounded" onClick={() => window.location.reload()}>Reintentar</button>
    </div>
  );
  if (!fullRoute) return <div className="text-card-foreground">Esperando datos de la ruta...</div>;

  return (
    <div className="space-y-4 overflow-y-auto hide-scrollbar p-1">
      {/* Tarjeta resumen de la ruta */}
      <div className="bg-background rounded-xl p-4 flex flex-col gap-2 shadow-sm transition-all duration-200 hover:shadow-xl hover:scale-[1.02] border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <h4 className="text-base font-semibold leading-tight text-foreground">{fullRoute.name}</h4>
            <p className="text-xs text-muted-foreground leading-tight">{fullRoute.description}</p>
          </div>
          <div className="flex items-center justify-center -ml-2">
            <img src="/bus-img.png" alt="Bus" className="w-30 h-10 object-contain" />
          </div>
        </div>
        <div className="border-t border-border/50 my-2" />
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          {/* Imagen y datos de inicio */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 flex items-center justify-center bg-muted rounded-lg">
              <Bus className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="bg-red-500 w-3 h-3 rounded-full" />
              <span className="text-xs text-muted-foreground font-semibold">Ida</span>
            </div>
            <span className="text-xs text-foreground text-center">{fullRoute.start}</span>
          </div>
          {/* Imagen y datos de fin */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 flex items-center justify-center bg-muted rounded-lg">
              <Bus className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="bg-green-500 w-3 h-3 rounded-full" />
              <span className="text-xs text-muted-foreground font-semibold">Vuelta</span>
            </div>
            <span className="text-xs text-foreground text-center">{fullRoute.end}</span>
          </div>
        </div>
      </div>
      {/* Tarjeta de detalles del recorrido */}
      <div className="bg-background rounded-xl p-4 max-w-full overflow-hidden shadow-sm transition-all duration-200 hover:shadow-xl hover:scale-[1.02] border">
        <h4 className="font-semibold text-foreground mb-2">Recorrido</h4>
        <div className="border-t border-border/50 my-2" />
        <div className="flex flex-col gap-2">
          {/* Detalle de inicio */}
          <div className="flex gap-2 mb-1 items-start">
            <span className="bg-red-500 w-3 h-3 rounded-full flex-shrink-0 mt-1" />
            <div className="flex flex-col min-w-0 max-w-full">
              <span className="text-xs text-muted-foreground font-medium flex-shrink-0">Ida:</span>
              <span className="text-xs text-card-foreground break-words whitespace-pre-line overflow-hidden max-w-full" style={{ display: 'block', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{fullRoute.startDetail}</span>
            </div>
          </div>
          {/* Detalle de fin */}
          <div className="flex gap-2 items-start">
            <span className="bg-green-500 w-3 h-3 rounded-full flex-shrink-0 mt-1" />
            <div className="flex flex-col min-w-0 max-w-full">
              <span className="text-xs text-muted-foreground font-medium flex-shrink-0">Vuelta:</span>
              <span className="text-xs text-card-foreground break-words whitespace-pre-line overflow-hidden max-w-full" style={{ display: 'block', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{fullRoute.endDetail}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
