'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ParkingAlerts } from '@/components/ParkingAlerts';
import { Car, Clock, TrendingUp, Settings, AlertTriangle } from 'lucide-react';
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
  // Sincronizar localConfig con config del contexto
  React.useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const [saving, setSaving] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);

  const validateConfig = (config: ParkingConfig) => {
    const errors: string[] = [];

    if (config.minTimeMinutes < 1 || config.minTimeMinutes > 480) {
      errors.push('Tiempo mínimo debe estar entre 1 y 480 minutos');
    }

    if (config.maxDistanceMeters < 1 || config.maxDistanceMeters > 1000) {
      errors.push('Distancia máxima debe estar entre 1 y 1000 metros');
    }

    if (config.maxSpeedKmh < 0.1 || config.maxSpeedKmh > 50) {
      errors.push('Velocidad máxima debe estar entre 0.1 y 50 km/h');
    }

    return errors;
  };

  const handleConfigUpdate = async () => {
    if (!localConfig) return;

    const errors = validateConfig(localConfig);
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error('Por favor corrige los errores de validación', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: '500',
        },
      });
      return;
    }

    setValidationErrors([]);

    try {
      setSaving(true);
      await updateConfig(localConfig);
      toast.success('Configuración actualizada exitosamente', {
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: '500',
        },
      });
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      toast.error('Error al actualizar la configuración', {
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
    toast.success('Datos actualizados', {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard de Estacionamiento</h1>
        <Button onClick={handleRefresh} variant="outline">
          Actualizar Datos
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
          <p className="text-destructive text-sm">{error}</p>
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
            <div className="text-2xl font-bold text-destructive">{stats?.activeEvents || 0}</div>
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

      {/* Layout principal con columna ancha para alertas */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Alertas Activas - Columna principal (4/5 del espacio) */}
        <div className="xl:col-span-4">
          <ParkingAlerts onAlertClick={(alert) => {
            console.log('Alerta clickeada:', alert);
            
            // Mostrar notificación detallada al hacer clic
            const alertDetails = [
              `Vehículo: ${alert.vehicleLicencePlate || alert.vehicleId}`,
              alert.driverName ? `Conductor: ${alert.driverName}` : null,
              alert.routeNumber ? `Ruta: ${alert.routeNumber}` : null,
              `Inicio: ${new Date(alert.startedAt).toLocaleTimeString('es-CO')}`,
              `Tiempo transcurrido: ${Math.floor((Date.now() - new Date(alert.startedAt).getTime()) / (1000 * 60))} minutos`
            ].filter(Boolean).join('\n');

            toast.success(alertDetails, {
              duration: 6000,
              style: {
                background: '#1F2937',
                color: '#fff',
                fontWeight: '500',
                fontSize: '14px',
                maxWidth: '400px',
                whiteSpace: 'pre-line',
              },
            });
          }} />
        </div>

        {/* Configuración - Columna lateral (1/5 del espacio) */}
        <div className="xl:col-span-1">
          <Card className="h-fit shadow-md border-0 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Settings className="h-4 w-4" />
                Configuración de Detección
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {localConfig ? (
                <>
                  {validationErrors.length > 0 && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <p className="text-sm font-medium text-destructive">Errores de validación</p>
                      </div>
                      <ul className="text-sm text-destructive/80 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="minTime" className="text-xs font-medium">Tiempo Mín. (min)</Label>
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
                        className="h-7 text-xs"
                      />
                    </div>

                    <div>
                      <Label htmlFor="maxDistance" className="text-xs font-medium">Dist. Máx. (m)</Label>
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
                        className="h-7 text-xs"
                      />
                    </div>

                    <div>
                      <Label htmlFor="maxSpeed" className="text-xs font-medium">Vel. Máx. (km/h)</Label>
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
                        className="h-7 text-xs"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
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
                        className="w-3 h-3"
                      />
                      <Label htmlFor="isActive" className="text-xs font-medium">Detección Activa</Label>
                    </div>
                  </div>

                  <Button
                    onClick={handleConfigUpdate}
                    disabled={saving}
                    className="w-full h-7 text-xs"
                    size="sm"
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </Button>
                </>
              ) : (
                <div className="text-center py-3 text-muted-foreground">
                  <Settings className="h-6 w-6 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">No hay configuración</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}