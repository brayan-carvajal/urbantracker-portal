import React from 'react';
import { Marker } from 'react-map-gl/mapbox';
import { VehicleTelemetryMessage } from '../panels/routes-detail';

interface VehicleMarkerProps {
  vehicle: VehicleTelemetryMessage;
}

export function VehicleMarker({ vehicle }: VehicleMarkerProps) {
  console.log('Rendering marker for vehicle:', vehicle.vehicleId, 'at', vehicle.latitude, vehicle.longitude);
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