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