'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ParkingAlerts } from '@/components/ParkingAlerts';
import { Car, Clock, TrendingUp, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { useParking } from './context/ParkingContext';

export default function ParkingDashboard() {
  const { 
    stats, 
    config, 
    loading, 
    error, 
    updateConfig,
    refreshStats,
    refreshConfig,
    refreshActiveEvents,
    activeEvents,
  } = useParking();

  const [localConfig, setLocalConfig] = React.useState(config);
  const [hasWelcomed, setHasWelcomed] = React.useState(false);

  // Sincronizar localConfig con config del contexto
  React.useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // Mostrar notificación de bienvenida
  React.useEffect(() => {
    if (!hasWelcomed && !loading) {
      toast.success('🚗 Bienvenido al Dashboard de Estacionamiento', {
        duration: 4000,
        style: {
          background: '#8B5CF6',
          color: '#fff',
          fontWeight: '500',
        },
      });
      setHasWelcomed(true);
    }
  }, [loading, hasWelcomed]);

  const [saving, setSaving] = React.useState(false);

  const handleConfigUpdate = async () => {
    if (!localConfig) return;

    try {
      setSaving(true);
      await updateConfig(localConfig);
      toast.success('✅ Configuración actualizada exitosamente', {
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: '500',
        },
      });
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      toast.error('❌ Error al actualizar la configuración', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: '500',
        },
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      refreshStats(),
      refreshConfig(),
      refreshActiveEvents(),
    ]);
    
    // Mostrar notificación de actualización
    toast.success('🔄 Datos actualizados', {
      duration: 2000,
      style: {
        background: '#3B82F6',
        color: '#fff',
        fontWeight: '500',
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard de Estacionamiento</h1>
        <Button onClick={handleRefresh} variant="outline">
          Actualizar Datos
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Eventos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos Ahora</CardTitle>
            <Badge variant="destructive" className="text-xs">
              {stats?.activeEvents || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.activeEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Vehículos estacionados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoy</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.eventsToday || 0}</div>
            <p className="text-xs text-muted-foreground">Eventos del día</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Estacionado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageParkingDurationMinutes
                ? `${Math.round(stats.averageParkingDurationMinutes)}min`
                : '0min'}
            </div>
            <p className="text-xs text-muted-foreground">Duración promedio de estacionamiento</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas Activas */}
        <div>
          <ParkingAlerts onAlertClick={(alert) => {
            console.log('Alerta clickeada:', alert);
          }} />
        </div>

        {/* Configuración */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración de Detección
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {localConfig ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minTime">Tiempo Mínimo (minutos)</Label>
                    <Input
                      id="minTime"
                      type="number"
                      value={localConfig.minTimeMinutes}
                      onChange={(e) => {
                        setLocalConfig({
                          ...localConfig,
                          minTimeMinutes: parseInt(e.target.value) || 0
                        });
                      }}
                      min="1"
                      max="480"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxDistance">Distancia Máxima (metros)</Label>
                    <Input
                      id="maxDistance"
                      type="number"
                      step="0.1"
                      value={localConfig.maxDistanceMeters}
                      onChange={(e) => {
                        setLocalConfig({
                          ...localConfig,
                          maxDistanceMeters: parseFloat(e.target.value) || 0
                        });
                      }}
                      min="1"
                      max="1000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxSpeed">Velocidad Máxima (km/h)</Label>
                    <Input
                      id="maxSpeed"
                      type="number"
                      step="0.1"
                      value={localConfig.maxSpeedKmh}
                      onChange={(e) => {
                        setLocalConfig({
                          ...localConfig,
                          maxSpeedKmh: parseFloat(e.target.value) || 0
                        });
                      }}
                      min="0.1"
                      max="50"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={localConfig.isActive}
                      onChange={(e) => {
                        setLocalConfig({
                          ...localConfig,
                          isActive: e.target.checked
                        });
                      }}
                    />
                    <Label htmlFor="isActive">Detección Activa</Label>
                  </div>
                </div>

                <Button
                  onClick={handleConfigUpdate}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay configuración disponible</p>
                <p className="text-sm">Configure los parámetros de detección de estacionamiento</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}