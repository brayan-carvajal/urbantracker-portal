import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Pagination } from './ui/pagination';
import { AlertTriangle, Clock, MapPin, User, RefreshCw, Wifi, WifiOff, Info } from 'lucide-react';
import toast from 'react-hot-toast';

interface ParkingAlert {
  id: number;
  vehicleId: string;
  driverId?: number;
  routeId?: number;
  startedAt: string;
  vehicleLicencePlate?: string;
  driverName?: string;
  routeNumber?: string;
  companyName?: string;
}

// Validación de tipo para alertas
const isValidParkingAlert = (data: unknown): data is ParkingAlert => {
  if (!data || typeof data !== 'object') return false;
  
  const alert = data as ParkingAlert;
  return (
    typeof alert.id === 'number' &&
    typeof alert.vehicleId === 'string' &&
    typeof alert.startedAt === 'string' &&
    (!alert.driverId || typeof alert.driverId === 'number') &&
    (!alert.routeId || typeof alert.routeId === 'number')
  );
};

interface ParkingAlertsProps {
  onAlertClick?: (alert: ParkingAlert) => void;
}

export const ParkingAlerts: React.FC<ParkingAlertsProps> = ({ onAlertClick }) => {
  const [activeAlerts, setActiveAlerts] = useState<ParkingAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [webSocketEnabled, setWebSocketEnabled] = useState(false); // Deshabilitado hasta que el backend esté listo
  const [currentPage, setCurrentPage] = useState(1);
  const [alertsPerPage, setAlertsPerPage] = useState(12); // Más alertas por página con el nuevo espacio

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 3; // Reducido para evitar demasiados intentos
  const baseReconnectDelay = 3000; // 3 segundos

  // URLs desde variables de entorno
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://3.142.222.206';
  const API_BASE_URL = 'http://3.142.222.206';

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Ya conectado
    }

    try {
      setError(null);
      const ws = new WebSocket(`${WS_URL}/parking-alerts`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ Conectado a alertas de estacionamiento');
        setIsConnected(true);
        setReconnectAttempts(0);
        
        // Mostrar notificación de conexión exitosa
        toast.success('Conexión de alertas establecida', {
          duration: 3000,
          style: {
            background: '#10B981',
            color: '#fff',
            fontWeight: '500',
          },
        });
      };

      ws.onmessage = (event) => {
        try {
          const alert = JSON.parse(event.data);

          if (isValidParkingAlert(alert)) {
            console.log('📱 Nueva alerta de estacionamiento:', alert);
            setActiveAlerts(prev => [alert, ...prev.slice(0, 9)]); // Mantener máximo 10 alertas
            
            // Mostrar notificación toast para nueva alerta
            toast.success(
              `Vehículo ${alert.vehicleLicencePlate || alert.vehicleId} estacionado`,
              {
                duration: 4000,
                style: {
                  background: '#F59E0B',
                  color: '#fff',
                  fontWeight: '500',
                },
              }
            );
          } else {
            console.warn('⚠️ Alerta con formato inválido recibida:', alert);
            
            // Mostrar notificación de error
            toast.error('⚠️ Alerta con formato inválido recibida', {
              duration: 3000,
              style: {
                background: '#EF4444',
                color: '#fff',
                fontWeight: '500',
              },
            });
          }
        } catch (parseError) {
          console.error('❌ Error parseando mensaje WebSocket:', parseError);
          
          // Mostrar notificación de error de parsing
          toast.error('❌ Error procesando alerta de estacionamiento', {
            duration: 3000,
            style: {
              background: '#EF4444',
              color: '#fff',
              fontWeight: '500',
            },
          });
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 Desconectado de alertas de estacionamiento', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Mostrar notificación de desconexión
        toast.error('Conexión de alertas perdida', {
          duration: 4000,
          style: {
            background: '#EF4444',
            color: '#fff',
            fontWeight: '500',
          },
        });

        // Intentar reconectar con backoff exponencial
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts);
          console.log(`🔄 Reconectando en ${delay}ms (intento ${reconnectAttempts + 1}/${maxReconnectAttempts})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectWebSocket();
          }, delay);
        } else {
          console.log('⚠️ Desactivando WebSocket y usando solo API');
          setWebSocketEnabled(false);
          const errorMsg = 'WebSocket no disponible. Usando solo actualizaciones por consulta.';
          setError(errorMsg);
          
          // Mostrar notificación de cambio de modo
          toast('⚠️ Cambiando a modo de consulta manual', {
            duration: 5000,
            style: {
              background: '#F59E0B',
              color: '#fff',
              fontWeight: '500',
            },
          });
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Error en WebSocket de alertas:', JSON.stringify(error));
        setIsConnected(false);
        const errorMsg = 'No se puede conectar al servidor de alertas de estacionamiento';
        setError(errorMsg);
        
        // Mostrar notificación de error
        toast.error('❌ Error de conexión con servidor de alertas', {
          duration: 4000,
          style: {
            background: '#EF4444',
            color: '#fff',
            fontWeight: '500',
          },
        });
      };

    } catch (error) {
      console.error('❌ Error creando conexión WebSocket:', JSON.stringify(error));
      setError('Error de conexión: Verifique que el servidor esté ejecutándose en ' + WS_URL);
    }
  }, [WS_URL, reconnectAttempts]);

  useEffect(() => {

    // Cargar alertas iniciales desde el backend cuando esté disponible
    if (webSocketEnabled) {
      loadActiveAlerts().catch(err => {
        console.warn('⚠️ Error en carga inicial de alertas:', err);
      });
    }

    // Intentar conectar WebSocket solo si está habilitado
    if (webSocketEnabled) {
      connectWebSocket();
    }

    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  // Polling deshabilitado temporalmente hasta que el backend esté listo
  // useEffect(() => {
  //   if (!webSocketEnabled) {
  //     const pollingInterval = setInterval(() => {
  //       loadActiveAlerts().catch(err => {
  //         console.warn('⚠️ Error en polling de alertas:', err);
  //       });
  //     }, 30000); // 30 segundos

  //     return () => {
  //       clearInterval(pollingInterval);
  //     };
  //   }
  // }, [webSocketEnabled]);

  const loadActiveAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('ℹ️ Modo demostración - alertas de ejemplo disponibles');
      
    } catch (error) {
      console.warn('⚠️ Error controlado:', error);
      setError('Error cargando alertas de demostración');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAlertClick = (alert: ParkingAlert) => {
    if (onAlertClick) {
      onAlertClick(alert);
    } else {
      // Mostrar información detallada de la alerta
      const alertInfo = [
        `🚗 Vehículo: ${alert.vehicleLicencePlate || alert.vehicleId}`,
        alert.driverName ? `👤 Conductor: ${alert.driverName}` : null,
        alert.routeNumber ? `🛣️ Ruta: ${alert.routeNumber}` : null,
        `⏰ Inicio: ${formatTime(alert.startedAt)}`,
        `📍 Tiempo: ${getTimeSinceParking(alert.startedAt)}`
      ].filter(Boolean).join('\n');

      toast.success(alertInfo, {
        duration: 5000,
        style: {
          background: '#1F2937',
          color: '#fff',
          fontWeight: '500',
          fontSize: '14px',
          maxWidth: '400px',
          whiteSpace: 'pre-line',
        },
      });
    }
  };

  const getTimeSinceParking = useCallback((startedAt: string): string => {
    try {
      const start = new Date(startedAt);
      const now = new Date();

      // Validar que la fecha sea válida
      if (isNaN(start.getTime())) {
        return 'Fecha inválida';
      }

      const diffMs = now.getTime() - start.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 0) {
        return 'En el futuro';
      }

      if (diffMinutes < 60) {
        return `${diffMinutes} min`;
      } else {
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        return `${hours}h ${minutes}min`;
      }
    } catch (error) {
      console.error('Error calculando tiempo de estacionamiento:', error);
      return 'Error';
    }
  }, []);

  const formatTime = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '--:--';
      }
      return date.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formateando hora:', error);
      return '--:--';
    }
  }, []);

  const handleRetryConnection = useCallback(() => {
    setReconnectAttempts(0);
    setWebSocketEnabled(true);
    setError(null);
    
    // Mostrar notificación de intento de reconexión
    toast.loading('🔄 Intentando reconectar...', {
      id: 'reconnecting',
      duration: 2000,
      style: {
        background: '#3B82F6',
        color: '#fff',
        fontWeight: '500',
      },
    });
    
    connectWebSocket();
  }, [connectWebSocket]);

  return (
    <Card className="w-full shadow-lg border-0 bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-secondary rounded-t-xl">
        <CardTitle className="text-xl font-bold flex items-center gap-3 text-card-foreground">
          {isConnected ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : webSocketEnabled ? (
            <WifiOff className="h-5 w-5 text-red-500" />
          ) : (
            <Info className="h-5 w-5 text-blue-500" />
          )}
          Alertas de Estacionamiento
          <Badge
            variant={isConnected ? "default" : webSocketEnabled ? (reconnectAttempts > 0 ? "secondary" : "destructive") : "outline"}
            className="ml-2"
          >
            {isConnected
              ? "🟢 En Vivo"
              : webSocketEnabled
                ? (reconnectAttempts > 0 
                  ? `🔄 Reconectando... (${reconnectAttempts}/${maxReconnectAttempts})`
                  : "🔴 Desconectado")
                : "🔵 Modo Manual"
            }
          </Badge>
          {!isConnected && webSocketEnabled && (
            <Button
              onClick={handleRetryConnection}
              disabled={reconnectAttempts > 0}
              variant="outline"
              size="sm"
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reintentar
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <p className="text-sm font-medium text-destructive">Estado de Conexión</p>
            </div>
            <p className="text-sm text-destructive/80">{error}</p>
            <p className="text-xs text-destructive/60 mt-2">
              💡 Intenta recargar la página o verificar la conexión del servidor
            </p>
          </div>
        )}

        {isLoading && activeAlerts.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Cargando alertas...</p>
          </div>
        ) : activeAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">✅ Todo despejado</p>
            <p className="text-sm mt-2">No hay vehículos estacionados actualmente</p>
            <p className="text-xs mt-2 text-muted-foreground/60">
              {webSocketEnabled
                ? "🔄 Monitoreo en tiempo activo"
                : "📡 Usando modo de consulta manual"
              }
            </p>
          </div>
        ) : (
          <>
            {/* Alertas con paginación */}
            <div className="space-y-3">
              {/* Calcular elementos para la página actual */}
              {(() => {
                const indexOfLastAlert = currentPage * alertsPerPage;
                const indexOfFirstAlert = indexOfLastAlert - alertsPerPage;
                const currentAlerts = activeAlerts.slice(indexOfFirstAlert, indexOfLastAlert);
                
                return currentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="border rounded-xl p-5 hover:bg-accent cursor-pointer transition-all duration-200 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 shadow-sm hover:shadow-md bg-card border-border"
                    onClick={() => handleAlertClick(alert)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleAlertClick(alert);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Alerta de estacionamiento para ${alert.vehicleLicencePlate || alert.vehicleId}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="destructive" className="text-xs">
                            ESTACIONADO
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {getTimeSinceParking(alert.startedAt)}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {alert.vehicleLicencePlate || alert.vehicleId}
                            </span>
                          </div>

                          {alert.driverName && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {alert.driverName}
                              </span>
                            </div>
                          )}

                          {alert.routeNumber && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                Ruta: {alert.routeNumber}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right text-xs text-muted-foreground">
                        {formatTime(alert.startedAt)}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Controles de paginación */}
            {activeAlerts.length > alertsPerPage && (
              <div className="mt-6 pt-4 border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(activeAlerts.length / alertsPerPage)}
                  itemsPerPage={alertsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setAlertsPerPage}
                />
              </div>
            )}
          </>
        )}

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Total activos: {activeAlerts.length}</span>
              <span className="ml-4">
                {activeAlerts.length > 0
                  ? `Tiempo promedio: ${Math.round(activeAlerts.reduce((acc, alert) => {
                      const start = new Date(alert.startedAt);
                      const now = new Date();
                      return acc + (now.getTime() - start.getTime()) / (1000 * 60);
                    }, 0) / activeAlerts.length)}min`
                  : 'Sin datos históricos'
                }
              </span>
            </div>
            <button
              onClick={() => {
                toast('🔄 Actualizando alertas...', { duration: 2000 });
                setTimeout(() => {
                  toast.success('✅ Alertas actualizadas', { duration: 2000 });
                }, 2000);
              }}
              className="flex items-center gap-1 px-3 py-1 text-primary hover:text-primary/80 hover:bg-accent rounded-md transition-colors"
              aria-label="Actualizar alertas de estacionamiento"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {isConnected
              ? '🟢 Conexión en tiempo real activa'
              : webSocketEnabled
                ? '🔴 WebSocket desconectado'
                : '🔵 Modo de consulta manual'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};