"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

export interface ParkingEvent {
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

export interface ParkingConfig {
  id: number;
  companyId: number;
  companyName: string;
  minTimeMinutes: number;
  maxDistanceMeters: number;
  maxSpeedKmh: number;
  isActive: boolean;
}

export interface ParkingStats {
  totalEvents: number;
  activeEvents: number;
  eventsToday: number;
  eventsThisWeek: number;
  averageParkingDurationMinutes: number;
  lastEventTime: string | null;
}

interface ParkingContextType {
  stats: ParkingStats | null;
  config: ParkingConfig | null;
  activeEvents: ParkingEvent[];
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  refreshConfig: () => Promise<void>;
  updateConfig: (config: ParkingConfig) => Promise<void>;
  refreshActiveEvents: () => Promise<void>;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export function ParkingProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<ParkingStats | null>({
    totalEvents: 0,
    activeEvents: 0,
    eventsToday: 0,
    eventsThisWeek: 0,
    averageParkingDurationMinutes: 0,
    lastEventTime: null,
  });
  const [config, setConfig] = useState<ParkingConfig | null>({
    id: 1,
    companyId: 1,
    companyName: 'UrbanTracker Corp',
    minTimeMinutes: 5,
    maxDistanceMeters: 50,
    maxSpeedKmh: 5,
    isActive: true,
  });
  const [activeEvents, setActiveEvents] = useState<ParkingEvent[]>([]);
  const [loading, setLoading] = useState(false); // Cambiado a false para evitar loading infinito
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const refreshStats = async () => {
    try {
      setError(null);
      // Deshabilitado temporalmente
      console.log('⚠️ refreshStats deshabilitado temporalmente');
    } catch (err) {
      console.warn('⚠️ Error controlado:', err);
    }
  };

  const refreshConfig = async () => {
    try {
      setError(null);
      // Deshabilitado temporalmente
      console.log('⚠️ refreshConfig deshabilitado temporalmente');
    } catch (err) {
      console.warn('⚠️ Error controlado:', err);
    }
  };

  const updateConfig = async (updatedConfig: ParkingConfig) => {
    try {
      setError(null);
      // Deshabilitado temporalmente
      console.log('⚠️ updateConfig deshabilitado temporalmente');
      
      
      setConfig(updatedConfig); // Actualizar localmente
      return Promise.resolve();
    } catch (err) {
      console.warn('⚠️ Error controlado:', err);
      
      // Mostrar notificación de error
      toast.error('❌ Error al actualizar configuración', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: '500',
        },
      });
      
      return Promise.resolve();
    }
  };

  const refreshActiveEvents = async () => {
    try {
      setError(null);
      // Deshabilitado temporalmente
      console.log('⚠️ refreshActiveEvents deshabilitado temporalmente');
    } catch (err) {
      console.warn('⚠️ Error controlado:', err);
    }
  };

  const loadData = async () => {
    try {
      // Deshabilitado temporalmente
      console.log('⚠️ loadData deshabilitado temporalmente');
    } catch (error) {
      console.warn('⚠️ Error controlado:', error);
    }
  };

  useEffect(() => {
    // loadData(); // Deshabilitado temporalmente
  }, []);

  const value = {
    stats,
    config,
    activeEvents,
    loading,
    error,
    refreshStats,
    refreshConfig,
    updateConfig,
    refreshActiveEvents,
  };

  return (
    <ParkingContext.Provider value={value}>
      {children}
    </ParkingContext.Provider>
  );
}

export function useParking() {
  const context = useContext(ParkingContext);
  if (context === undefined) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
}