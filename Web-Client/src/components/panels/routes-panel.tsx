import React, { useState, useEffect } from "react";
import { Bus } from "lucide-react";
import { RoutesDetail, Route } from "./routes-detail";
import { useRoute } from "../map/route-context";

interface RouteResDto {
  id: number;
  numberRoute: string;
  description: string;
  totalDistance: number;
  waypoints: number;
  outboundImageUrl: string;
  returnImageUrl: string;
}

// Componente principal que muestra la lista de rutas o el detalle de una ruta seleccionada
export function RoutesPanel({ showTitle = false, selected, setSelected }: { showTitle?: boolean, selected: number | null, setSelected: (routeId: number | null) => void }) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedRoutes, setSelectedRoutes, focusedRoute, setFocusedRoute, addRoute, removeRoute, loadRoute, routes: contextRoutes } = useRoute();

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/public/route');
        if (!response.ok) throw new Error('Error al cargar rutas');
        const data = await response.json();
        
        const routesWithDetails = await Promise.all(data.data.map(async (r: RouteResDto) => {
          try {
            // Obtener geometría para cada ruta
            const geometryResponse = await fetch(`http://localhost:8080/api/v1/public/route/${r.id}/GEOMETRY`);
            let startPoint = 'Cargando...';
            let endPoint = 'Cargando...';
            
            if (geometryResponse.ok) {
              const geometryData = await geometryResponse.json();
              const waypoints = geometryData.data?.waypoints || [];
              
              if (waypoints.length > 0) {
                const first = waypoints.find((w: any) => w.sequence === 1) || waypoints[0];
                const last = waypoints.reduce((prev: any, curr: any) => 
                  (prev && curr && curr.sequence > prev.sequence) ? curr : prev, waypoints[0] || first);
                
                if (first && last) {
                  startPoint = `${first.latitude.toFixed(6)}, ${first.longitude.toFixed(6)}`;
                  endPoint = `${last.latitude.toFixed(6)}, ${last.longitude.toFixed(6)}`;
                }
              }
            }
            
            return {
              id: r.id,
              name: r.numberRoute,
              description: r.description,
              start: startPoint, 
              end: endPoint,
              imageStart: r.outboundImageUrl || '',
              imageEnd: r.returnImageUrl || '',
              startDetail: startPoint !== 'Cargando...' ? `Inicio: ${startPoint}` : '',
              endDetail: endPoint !== 'Cargando...' ? `Fin: ${endPoint}` : '',
            };
          } catch (detailErr) {
            console.warn(`Error cargando detalles de ruta ${r.id}:`, detailErr);
            return {
              id: r.id,
              name: r.numberRoute,
              description: r.description,
              start: 'No disponible',
              end: 'No disponible',
              imageStart: r.outboundImageUrl || '',
              imageEnd: r.returnImageUrl || '',
              startDetail: '',
              endDetail: '',
            };
          }
        }));
        
        setRoutes(routesWithDetails);
      } catch (err) {
        setError('No se encontraron rutas');
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  if (loading) return <div className="text-foreground">Cargando rutas...</div>;
  if (error) return <div className="text-destructive">Error: {error}</div>;

  return (
    <div className="h-full overflow-y-auto hide-scrollbar px-2 py-2 p-1">
      {/* Encabezado con título y botón de volver si hay una ruta seleccionada */}
      {showTitle && (
        <div className="flex items-center gap-2 mb-4">
          {selected !== null && (
            <button
              className="flex items-center gap-1 text-muted-foreground text-sm font-medium px-0.5 py-0 rounded-md border border-transparent transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-border bg-transparent cursor-pointer hover:bg-accent hover:border-border hover:text-foreground"
              onClick={() => setSelected(null)}
              title="Volver a la lista"
              type="button"
            >
              {/* Flecha para volver */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          <h2 className="text-lg font-semibold text-foreground">
            {selected === null ? "Rutas recomendadas" : `Ruta ${routes.find(r => r.id === selected)?.name || selected}`}
          </h2>
        </div>
      )}

      {/* Si no hay ruta seleccionada para detalle, mostrar la lista de rutas */}
      {selected === null ? (
        <div className="space-y-3">
          {selectedRoutes.length > 0 && (
            <div className="bg-primary/10 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-primary text-sm font-medium">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                {selectedRoutes.length} ruta{selectedRoutes.length !== 1 ? 's' : ''} seleccionada{selectedRoutes.length !== 1 ? 's' : ''} para comparación
              </div>
            </div>
          )}
          {routes.map((route) => {
            const isSelected = selectedRoutes.includes(route.id);
            return (
              // Tarjeta resumen de cada ruta
              <div
                key={route.id}
<<<<<<< HEAD
                className={`bg-background text-foreground p-4 rounded-xl w-full font-sans flex flex-col shadow-sm transition-all duration-200 hover:shadow-xl hover:scale-[1.02] cursor-pointer border${
=======
                className={`bg-background text-foreground p-4 rounded-xl w-full font-sans flex flex-col shadow-sm transition-all duration-200 hover:shadow-xl hover:scale-[1.02] cursor-pointer ${
>>>>>>> 3875d8517a1b40b03f0b5291e2efa1301caa1e0e
                  isSelected ? 'bg-accent'  : ''
                }`}
                onClick={async (e) => {
                  // Solo mostrar detalles si no se hizo clic en el checkbox
                  if (!(e.target as HTMLElement).closest('input[type="checkbox"]')) {
                    try {
                      // Usar la función del contexto que carga y cachea la geometría
                      await loadRoute(route.id);
                      console.log('[RoutesPanel] card clicked, setting focused and selected ->', route.id);
                      setFocusedRoute(route.id);
                      setSelected(route.id);
                    } catch (err) {
                      console.error('Error al cargar el detalle de la ruta via loadRoute:', err);
                      console.log('[RoutesPanel] loadRoute failed but still setting focused/selected ->', route.id);
                      setFocusedRoute(route.id);
                      setSelected(route.id);
                    }
                  }
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onClick={(e) => e.stopPropagation()} // Evitar que el clic en el checkbox propague al div padre
                      onChange={async (e) => {
                        const input = e.target as HTMLInputElement;
                        const checked = input.checked;
                        const maxRoutes = 6; // Límite de rutas seleccionables

                        if (checked) {
                          if (selectedRoutes.length < maxRoutes) {
                            // Añadir visualmente la selección
                            console.log('[RoutesPanel] checkbox checked, adding to selectedRoutes ->', route.id);
                            setSelectedRoutes(prev => [...prev, route.id]);
                            try {
                              // Delegar la carga al contexto (caché dentro de loadRoute)
                              await loadRoute(route.id);
                            } catch (err) {
                              console.error('No se pudo cargar geometría al seleccionar checkbox:', err);
                              // loadRoute ya añade la ruta sin puntos en caso de error, pero mantener fallback
                              addRoute(route.id, null, null);
                            }
                          } else {
                            alert('Solo puedes seleccionar hasta ' + maxRoutes + ' rutas para comparar');
                            // Revertir visualmente el cambio
                            input.checked = false;
                            return;
                          }
                        } else {
                          // Remover de rutas seleccionadas y del contexto para que deje de mostrarse
                          console.log('[RoutesPanel] checkbox unchecked, removing ->', route.id);
                          setSelectedRoutes(prev => prev.filter(id => id !== route.id));
                          removeRoute(route.id);
                        }
                      }}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <h4 className="text-base font-semibold leading-tight text-card-foreground">{route.name}</h4>
                  </div>
                  <div className="flex items-center justify-center -ml-2">
                    {/* Imagen del bus */}
                    <img src="/bus-img.png" alt="Bus" className="w-30 h-10 object-contain" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="text-xs text-muted-foreground leading-tight">{route.description}</p>
                </div>
                <div className="border-t border-border my-2" />
               <div className="flex flex-col gap-1">
                 {/* Línea de información de inicio */}
                 <div className="flex items-center gap-2">
<<<<<<< HEAD
                   <div className="w-3 h-3 bg-red-500 rounded-full" />
=======
                   <div className="w-3 h-3 bg-primary rounded-full" />
>>>>>>> 3875d8517a1b40b03f0b5291e2efa1301caa1e0e
                   <span className="text-xs text-muted-foreground font-medium">Ida:</span>
                   <span className="text-xs text-card-foreground">{route.start || 'Cargando...'}</span>
                 </div>
                 {/* Línea de información de fin */}
                 <div className="flex items-center gap-2">
<<<<<<< HEAD
                   <div className="w-3 h-3 bg-green-500 rounded-full" />
=======
                   <div className="w-3 h-3 bg-secondary rounded-full" />
>>>>>>> 3875d8517a1b40b03f0b5291e2efa1301caa1e0e
                   <span className="text-xs text-muted-foreground font-medium">Vuelta:</span>
                   <span className="text-xs text-card-foreground">{route.end || 'Cargando...'}</span>
                 </div>
               </div>
             </div>
           );
         })}
        </div>
      ) : (
        // Si hay una ruta seleccionada, mostrar el detalle usando el componente importado
        <RoutesDetail route={routes.find(r => r.id === selected)!} onBack={() => setSelected(null)} />
      )}
    </div>
  );
}

