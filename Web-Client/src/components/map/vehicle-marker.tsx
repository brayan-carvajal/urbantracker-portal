import React from 'react';
import { Marker } from 'react-map-gl/mapbox';
import { VehicleTelemetryMessage } from '../panels/routes-detail';

interface VehicleMarkerProps {
  vehicle: VehicleTelemetryMessage;
}

export function VehicleMarker({ vehicle }: VehicleMarkerProps) {
  console.log('Rendering marker for vehicle:', vehicle.vehicleId, 'at', vehicle.latitude, vehicle.longitude);

  // Validar coordenadas antes de renderizar
  const isValidPosition = typeof vehicle.latitude === 'number' &&
                         typeof vehicle.longitude === 'number' &&
                         !isNaN(vehicle.latitude) &&
                         !isNaN(vehicle.longitude);

  if (!isValidPosition) {
    console.error('❌ Coordenadas inválidas para vehicle:', vehicle.vehicleId, vehicle.latitude, vehicle.longitude);
    return null;
  }

  return (
    <Marker
      longitude={vehicle.longitude}
      latitude={vehicle.latitude}
      anchor="center"
      style={{ zIndex: 1000 }}
    >
      <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-xl border-4 border-white animate-pulse">
        🚌
      </div>
    </Marker>
  );
}