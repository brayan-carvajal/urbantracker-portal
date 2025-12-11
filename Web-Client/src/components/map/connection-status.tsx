"use client";

import React from 'react';
import { useVehiclePositions } from './vehicle-context';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

export function ConnectionStatus() {
  const { isConnected, connectionError, vehiclePositions } = useVehiclePositions();

  if (connectionError) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Error de conexión: {connectionError}</span>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
        isConnected 
          ? 'bg-green-500 text-white' 
          : 'bg-yellow-500 text-white'
      }`}>
        {isConnected ? (
          <>
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-medium">
            {vehiclePositions.size} vehículo{vehiclePositions.size !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      {/* Error de conexión */}
      {connectionError && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-800">
          {connectionError}
        </div>
      )}
      
      {/* Información de vehículos activos */}
      {vehiclePositions.size > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          Últimas coordenadas recibidas:
          <div className="mt-1 space-y-1">
            {Array.from(vehiclePositions.entries()).slice(0, 3).map(([vehicleId, vehicle]) => (
              <div key={vehicleId} className="flex justify-between gap-2">
                <span className="font-mono">{vehicleId}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(vehicle.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {vehiclePositions.size > 3 && (
              <div className="text-xs text-muted-foreground">
                +{vehiclePositions.size - 3} más...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
