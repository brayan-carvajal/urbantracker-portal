"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { VehicleTelemetryMessage } from '../panels/routes-detail';

interface VehicleContextType {
  vehiclePositions: Map<string, VehicleTelemetryMessage>;
  setVehiclePositions: React.Dispatch<React.SetStateAction<Map<string, VehicleTelemetryMessage>>>;
}

const VehicleContext = createContext<VehicleContextType | null>(null);

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const [vehiclePositions, setVehiclePositions] = useState<Map<string, VehicleTelemetryMessage>>(new Map());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
<<<<<<< HEAD

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
        return newMap;
      });
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, []);
=======
>>>>>>> 3875d8517a1b40b03f0b5291e2efa1301caa1e0e

  return (
    <VehicleContext.Provider value={{ vehiclePositions, setVehiclePositions }}>
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehiclePositions() {
  const ctx = useContext(VehicleContext);
  if (!ctx) throw new Error('useVehiclePositions debe usarse dentro de VehicleProvider');
  return ctx;
}