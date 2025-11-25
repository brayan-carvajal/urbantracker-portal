import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertTriangle, Clock, MapPin, User, RefreshCw } from 'lucide-react';

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
const isValidParkingAlert = (data: any): data is ParkingAlert => {
  return (
    data &&
    typeof data.id === 'number' &&
    typeof data.vehicleId === 'string' &&
    typeof data.startedAt === 'string' &&
    (!data.driverId || typeof data.driverId === 'number') &&
    (!data.routeId || typeof data.routeId === 'number')
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
  const [webSocketEnabled, setWebSocketEnabled] = useState(false); // Deshabilitado por defecto hasta que el backend lo implemente

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 3; // Reducido para evitar demasiados intentos
  const baseReconnectDelay = 3000; // 3 segundos

  // URLs desde variables de entorno
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
      };

      ws.onmessage = (event) => {
        try {
          const alert = JSON.parse(event.data);

          if (isValidParkingAlert(alert)) {
            console.log('📱 Nueva alerta de estacionamiento:', alert);
            setActiveAlerts(prev => [alert, ...prev.slice(0, 9)]); // Mantener máximo 10 alertas
          } else {
            console.warn('⚠️ Alerta con formato inválido recibida:', alert);
          }
        } catch (parseError) {
          console.error('❌ Error parseando mensaje WebSocket:', parseError);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 Desconectado de alertas de estacionamiento', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

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
          setError('WebSocket no disponible. Usando solo actualizaciones por consulta.');
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Error en WebSocket de alertas:', JSON.stringify(error));
        setIsConnected(false);
        setError('No se puede conectar al servidor de alertas de estacionamiento');
      };

    } catch (error) {
      console.error('❌ Error creando conexión WebSocket:', JSON.stringify(error));
      setError('Error de conexión: Verifique que el servidor esté ejecutándose en ' + WS_URL);
    }
  }, [WS_URL, reconnectAttempts]);

  useEffect(() => {
    // Cargar alertas iniciales (deshabilitado temporalmente)
    // loadActiveAlerts().catch(err => {
    //   console.warn('⚠️ Error en carga inicial de alertas:', err);
    // });

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

      // Deshabilitado temporalmente hasta que el backend esté listo
      console.log('⚠️ API deshabilitada, mostrando estado de demostración');
      setActiveAlerts([]); // Lista vacía para demostración
      
    } catch (error) {
      console.warn('⚠️ Error controlado:', error);
      // No hacer nada, mantener lista vacía
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAlertClick = (alert: ParkingAlert) => {
    if (onAlertClick) {
      onAlertClick(alert);
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
    connectWebSocket();
  }, [connectWebSocket]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Alertas de Estacionamiento
          <Badge
            variant={isConnected ? "default" : webSocketEnabled ? (reconnectAttempts > 0 ? "secondary" : "destructive") : "outline"}
            className="ml-2"
          >
            {isConnected
              ? "En Vivo"
              : webSocketEnabled
                ? (reconnectAttempts > 0 
                  ? `Reconectando... (${reconnectAttempts}/${maxReconnectAttempts})`
                  : "Desconectado")
                : "API"
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
              Reintentar
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {isLoading && activeAlerts.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-gray-400" />
            <p className="text-gray-500">Cargando alertas...</p>
          </div>
        ) : activeAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay vehículos estacionados actualmente</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
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
                      <span className="text-sm text-gray-500">
                        {getTimeSinceParking(alert.startedAt)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {alert.vehicleLicencePlate || alert.vehicleId}
                        </span>
                      </div>

                      {alert.driverName && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {alert.driverName}
                          </span>
                        </div>
                      )}

                      {alert.routeNumber && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            Ruta: {alert.routeNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-xs text-gray-500">
                    {formatTime(alert.startedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Total activos: {activeAlerts.length}</span>
            <button
              onClick={() => console.log('⚠️ Actualización deshabilitada temporalmente')}
              disabled={true}
              className="flex items-center gap-1 px-3 py-1 text-gray-400 rounded-md cursor-not-allowed"
              aria-label="Actualizar alertas de estacionamiento (deshabilitado)"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar (API no disponible)
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};