"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { VehicleTelemetryMessage } from '../panels/routes-detail';

interface VehicleContextType {
  vehiclePositions: Map<string, VehicleTelemetryMessage>;
  setVehiclePositions: React.Dispatch<React.SetStateAction<Map<string, VehicleTelemetryMessage>>>;
  isConnected: boolean;
  connectionError: string | null;
}

const VehicleContext = createContext<VehicleContextType | null>(null);

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const [vehiclePositions, setVehiclePositions] = useState<Map<string, VehicleTelemetryMessage>>(new Map());
  const [mounted, setMounted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const clientRef = useRef<MqttClient | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para conectar MQTT
  const connectMQTT = () => {
    if (clientRef.current) {
      return; // Ya está conectado
    }

    console.log('Conectando a MQTT...');
    try {
      const client = mqtt.connect('ws://localhost:9001/mqtt', {
        clientId: `web-client-${Math.random().toString(16).substring(2, 8)}`,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 4000,
      });

      client.on('connect', () => {
        console.log('✅ Conectado a MQTT');
        setIsConnected(true);
        setConnectionError(null);

        // Suscribirse a telemetría de todas las rutas
        client.subscribe('routes/+/telemetry', (err, granted) => {
          if (err) {
            console.error('❌ Error al suscribirse a routes/+/telemetry:', err);
            return;
          }
          console.log('📩 Suscrito a routes/+/telemetry - Granted:', granted);
        });

        // Suscribirse a telemetría general de vehículos
        client.subscribe('vehicles/+/telemetry', (err, granted) => {
          if (err) {
            console.error('❌ Error al suscribirse a vehicles/+/telemetry:', err);
            return;
          }
          console.log('📩 Suscrito a vehicles/+/telemetry - Granted:', granted);
        });

        // Manejar mensajes entrantes
        client.on('message', (topic, message) => {
          console.log('🎉 🎉 🎉 MENSAJE MQTT RECIBIDO 🎉 🎉 🎉');
          console.log('📥 Mensaje MQTT recibido - Topic:', topic);
          console.log('📥 Contenido del mensaje:', message);
          console.log('📥 Tipo de mensaje:', typeof message);
          console.log('📥 Mensaje en formato JSON:', JSON.stringify(message));

          // Procesar mensajes de telemetría de rutas
          if (topic.startsWith('routes/') && topic.endsWith('/telemetry')) {
            console.log('📍 Procesando mensaje de telemetría de ruta - Topic completo:', topic);
            try {
              // Verificar si el mensaje es un Buffer o necesita parsing
              let messageStr: string;
              if (message instanceof Buffer) {
                messageStr = message.toString('utf-8');
              } else if (typeof message === 'object') {
                // Si es un objeto, puede ser el payload real o metadata
                if (Array.isArray(message) && message.length > 0 && message[0].hasOwnProperty('topic')) {
                  // Este es un array que contiene metadata, no el payload real
                  console.error('❌ Mensaje MQTT es un array que contiene metadata en lugar de datos de ubicación');
                  console.error('📥 Mensaje completo:', message);
                  console.error('📥 Primer elemento:', message[0]);
                  return;
                } else if (message.hasOwnProperty('topic') || message.hasOwnProperty('qos')) {
                  // Este es un objeto de metadata, no el payload real
                  console.error('❌ Mensaje MQTT contiene metadata en lugar de datos de ubicación');
                  console.error('📥 Mensaje completo:', message);
                  return;
                } else {
                  // Este es el payload real
                  messageStr = JSON.stringify(message);
                }
              } else {
                messageStr = String(message);
              }
  
              console.log('📥 Mensaje como string:', messageStr);
              const parsedData = JSON.parse(messageStr);
              console.log('✅ Datos de telemetría parseados:', parsedData);

              // Normalizar el formato de los datos para manejar diferentes estructuras
              let telemetryData: VehicleTelemetryMessage;

              if (parsedData && typeof parsedData === 'object') {
                // Manejar formato alternativo del móvil (lat/lon en lugar de latitude/longitude)
                telemetryData = {
                  vehicleId: parsedData.vehicleId || parsedData.vehicleId,
                  timestamp: parsedData.timestamp || new Date().toISOString(),
                  latitude: parsedData.latitude || parsedData.lat,
                  longitude: parsedData.longitude || parsedData.lon,
                  source: parsedData.source || 'MOVILE'
                };

                // Validar que los datos normalizados sean válidos
                if (telemetryData.vehicleId &&
                    typeof telemetryData.latitude === 'number' &&
                    typeof telemetryData.longitude === 'number' &&
                    !isNaN(telemetryData.latitude) &&
                    !isNaN(telemetryData.longitude)) {
                  setVehiclePositions(prev => {
                    const newMap = new Map(prev.set(telemetryData.vehicleId, telemetryData));
                    console.log('📍 Posiciones de vehículos actualizadas desde ruta:', newMap.size, 'vehicles');
                    return newMap;
                  });
                } else {
                  console.error('❌ Datos de telemetría de ruta inválidos después de normalización:', telemetryData);
                }
              } else {
                console.error('❌ Datos de telemetría de ruta inválidos:', parsedData);
              }
            } catch (err: unknown) {
              console.error('❌ Error parsing route telemetry JSON:', err);
            }
            return;
          }
  
          // Solo procesar mensajes del topic de telemetría de vehículos
          if (!topic.startsWith('vehicles/') || !topic.endsWith('/telemetry')) {
            console.log('⏭️  Ignorando mensaje de topic no relevante:', topic);
            return;
          }

          try {
            // Verificar si el mensaje es un Buffer o necesita parsing
            let messageStr: string;
            if (message instanceof Buffer) {
              messageStr = message.toString('utf-8');
            } else if (typeof message === 'object') {
              // Si es un objeto, puede ser el payload real o metadata
              if (Array.isArray(message) && message.length > 0 && message[0].hasOwnProperty('topic')) {
                // Este es un array que contiene metadata, no el payload real
                console.error('❌ Mensaje MQTT es un array que contiene metadata en lugar de datos de ubicación');
                console.error('📥 Mensaje completo:', message);
                console.error('📥 Primer elemento:', message[0]);
                return;
              } else if (message.hasOwnProperty('topic') || message.hasOwnProperty('qos')) {
                // Este es un objeto de metadata, no el payload real
                console.error('❌ Mensaje MQTT contiene metadata en lugar de datos de ubicación');
                console.error('📥 Mensaje completo:', message);
                return;
              } else {
                // Este es el payload real
                messageStr = JSON.stringify(message);
              }
            } else {
              messageStr = String(message);
            }

            console.log('📥 Mensaje como string:', messageStr);
            const parsedData = JSON.parse(messageStr);
            console.log('✅ Datos parseados:', parsedData);

            // Normalizar el formato de los datos para manejar diferentes estructuras
            let telemetryData: VehicleTelemetryMessage;

            if (Array.isArray(parsedData)) {
              // Si es un array, tomar el primer elemento y normalizar
              if (parsedData.length > 0) {
                const firstItem = parsedData[0];
                telemetryData = {
                  vehicleId: firstItem.vehicleId || firstItem.vehicleId,
                  timestamp: firstItem.timestamp || new Date().toISOString(),
                  latitude: firstItem.latitude || firstItem.lat,
                  longitude: firstItem.longitude || firstItem.lon,
                  source: firstItem.source || 'MOVILE'
                };
              } else {
                console.error('❌ Array vacío recibido');
                return;
              }
            } else {
              // Normalizar objeto individual
              telemetryData = {
                vehicleId: parsedData.vehicleId || parsedData.vehicleId,
                timestamp: parsedData.timestamp || new Date().toISOString(),
                latitude: parsedData.latitude || parsedData.lat,
                longitude: parsedData.longitude || parsedData.lon,
                source: parsedData.source || 'MOVILE'
              };
            }

            // Validar que telemetryData tenga la estructura correcta
            if (!telemetryData || typeof telemetryData !== 'object') {
              console.error('❌ Datos de telemetría inválidos:', telemetryData);
              return;
            }

            // Verificar si todos los campos son undefined (problema de serialización)
            const allFieldsUndefined =
              telemetryData.vehicleId === undefined &&
              telemetryData.latitude === undefined &&
              telemetryData.longitude === undefined &&
              telemetryData.timestamp === undefined;

            if (allFieldsUndefined) {
              console.error('❌ Todos los campos del vehículo son undefined - Problema de serialización MQTT');
              console.error('📥 Mensaje MQTT recibido:', message);
              console.error('📥 Mensaje como string:', messageStr);
              return;
            }

            // Validar que las coordenadas sean válidas y que vehicleId exista
            const hasValidData =
              telemetryData.vehicleId &&
              typeof telemetryData.latitude === 'number' &&
              typeof telemetryData.longitude === 'number' &&
              !isNaN(telemetryData.latitude) &&
              !isNaN(telemetryData.longitude) &&
              telemetryData.latitude >= -90 &&
              telemetryData.latitude <= 90 &&
              telemetryData.longitude >= -180 &&
              telemetryData.longitude <= 180;

            if (hasValidData) {
              setVehiclePositions(prev => {
                const newMap = new Map(prev.set(telemetryData.vehicleId, telemetryData));
                console.log('📍 Posiciones de vehículos actualizadas:', newMap.size, 'vehicles');
                return newMap;
              });
            } else {
              console.error('❌ Datos de vehículo inválidos:', {
                vehicleId: telemetryData.vehicleId,
                latitude: telemetryData.latitude,
                longitude: telemetryData.longitude,
                timestamp: telemetryData.timestamp
              });
              // No agregar vehículos con datos inválidos
              return;
            }
          } catch (err: unknown) {
            console.error('❌ Error parsing general vehicle telemetry JSON:', err);
          }
        });

        // Añadir algunos datos de prueba para verificación
        console.log('🚀 Inicializando datos de prueba para verificación...');
        setTimeout(() => {
          console.log('📍 Añadiendo datos de prueba...');
          const testData: VehicleTelemetryMessage = {
            vehicleId: 'TEST-VEHICLE-001',
            timestamp: new Date().toISOString(),
            latitude: 4.60971,
            longitude: -74.08175,
            source: 'MOVILE'
          };
          console.log('📍 Datos de prueba:', testData);
          setVehiclePositions(prev => {
            const newMap = new Map(prev.set(testData.vehicleId, testData));
            console.log('📍 Posiciones de vehículos actualizadas con datos de prueba:', newMap.size, 'vehicles');
            return newMap;
          });
        }, 5000);

        // Suscribirse a actualizaciones de trayectos activos
        client.subscribe('trips/active', (topic, message) => {
          if (message) {
            console.log('Received active trips update:', message.toString());
            try {
              // Verificar si el mensaje ya es un objeto o necesita parsing
              const messageStr = typeof message === 'object' ? JSON.stringify(message) : String(message);
              const tripData = JSON.parse(messageStr);
              if (tripData.vehicleId && tripData.started) {
                console.log('Trip started for vehicle:', tripData.vehicleId);
                // Forzar actualización de posición si es necesario
              }
            } catch (err: unknown) {
              console.error('Error parsing trip data JSON:', err);
            }
          }
        });
      });

      client.on('error', (error) => {
        console.error('MQTT error:', error);
        setConnectionError(`Error de conexión MQTT: ${error.message}`);
        setIsConnected(false);
        scheduleReconnect();
      });

      client.on('close', () => {
        console.log('Desconectado de MQTT');
        setIsConnected(false);
        scheduleReconnect();
      });

      client.on('offline', () => {
        console.log('MQTT cliente offline');
        setIsConnected(false);
        scheduleReconnect();
      });

      clientRef.current = client;
    } catch (err) {
      console.error('Error al crear cliente MQTT:', err);
      if (err instanceof Error) {
        setConnectionError(`Error al crear cliente MQTT: ${err.message}`);
      } else {
        setConnectionError('Error al crear cliente MQTT: Error desconocido');
      }
      scheduleReconnect();
    }
  };

  // Función para programar reconexión
  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    console.log('Programando reconexión en 5 segundos...');
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('Intentando reconectar...');
      connectMQTT();
    }, 5000);
  };

  // Conectar MQTT cuando el componente se monta
  useEffect(() => {
    if (mounted) {
      connectMQTT();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (clientRef.current) {
        try {
          clientRef.current.end();
        } catch (err) {
          console.error('Error al cerrar conexión MQTT:', err);
        }
        clientRef.current = null;
      }
    };
  }, [mounted]);

  // Limpiar vehículos inactivos cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setVehiclePositions(prev => {
        const now = Date.now();
        const newMap = new Map();
        prev.forEach((vehicle, vehicleId) => {
          const vehicleTime = new Date(vehicle.timestamp).getTime();
          // Mantener vehículos con datos de los últimos 5 minutos
          if (now - vehicleTime < 5 * 60 * 1000) {
            newMap.set(vehicleId, vehicle);
          } else {
            console.log(`Removing inactive vehicle: ${vehicleId}`);
          }
        });

      // Diagnosticar si no hay vehículos activos
      if (newMap.size === 0) {
        console.log('⚠️  No hay vehículos activos en el mapa. Verificando conexión MQTT...');
        console.log('🔍 Estado de conexión MQTT:', isConnected);
        console.log('🔍 Topics suscritos: routes/+/telemetry, vehicles/+/telemetry');
        console.log('🔍 Si la conexión está activa pero no hay datos, verificar que el móvil esté enviando datos correctamente');
        console.log('🔍 Verificar que el móvil esté usando los topics correctos:');
        console.log('   - Para rutas: routes/{routeId}/telemetry');
        console.log('   - Para vehículos: vehicles/{vehicleId}/telemetry');
        console.log('🔍 Verificar que los datos enviados desde el móvil tengan el formato correcto:');
        console.log('   {vehicleId: string, timestamp: string, latitude: number, longitude: number, source: string}');
      }

      return newMap;
    });
  }, 30000); // Cada 30 segundos

  return () => clearInterval(interval);
}, [isConnected]);

  // Función para limpiar posiciones manualmente
  const clearVehiclePositions = () => {
    setVehiclePositions(new Map());
  };

  return (
    <VehicleContext.Provider value={{
      vehiclePositions,
      setVehiclePositions,
      isConnected,
      connectionError
    }}>
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehiclePositions() {
  const ctx = useContext(VehicleContext);
  if (!ctx) throw new Error('useVehiclePositions debe usarse dentro de VehicleProvider');
  return ctx;
}