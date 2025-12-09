import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BulkDriverScheduleRequest, DriverScheduleRequest, DriverScheduleResponse } from '../types/driverScheduleTypes.js';
import type { Driver } from '../../../drivers/types/driverTypes';
import type { DriverApiResponse } from '../../../drivers/services/api/types';
import { DriversApi } from '../../../drivers/services/api/driverApi';

interface DriverScheduleFormManagerProps {
  onSave: (data: BulkDriverScheduleRequest) => Promise<void>;
  onCancel?: () => void;
  editingSchedules?: DriverScheduleResponse[];
  mode?: 'create' | 'edit';
}

interface DaySchedule {
  day: string;
  label: string;
  startTime: string;
  endTime: string;
  selected: boolean;
}

const DriverScheduleFormManager: React.FC<DriverScheduleFormManagerProps> = ({
  onSave,
  onCancel,
  editingSchedules = [],
  mode = 'create'
}) => {
  const [selectedDriverId, setSelectedDriverId] = useState<number>(0);
  const [globalStartTime, setGlobalStartTime] = useState('08:00');
  const [globalEndTime, setGlobalEndTime] = useState('18:00');
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([
    { day: 'MONDAY', label: 'Lunes', startTime: '08:00', endTime: '18:00', selected: false },
    { day: 'TUESDAY', label: 'Martes', startTime: '08:00', endTime: '18:00', selected: false },
    { day: 'WEDNESDAY', label: 'Miércoles', startTime: '08:00', endTime: '18:00', selected: false },
    { day: 'THURSDAY', label: 'Jueves', startTime: '08:00', endTime: '18:00', selected: false },
    { day: 'FRIDAY', label: 'Viernes', startTime: '08:00', endTime: '18:00', selected: false },
    { day: 'SATURDAY', label: 'Sábado', startTime: '08:00', endTime: '18:00', selected: false },
    { day: 'SUNDAY', label: 'Domingo', startTime: '08:00', endTime: '18:00', selected: false }
  ]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        setIsLoadingDrivers(true);
        const response = await DriversApi.getAllDrivers();
        if (!response) {
          throw new Error('No se recibió respuesta del servidor');
        }
        if (!response.success) {
          throw new Error(response.message || 'Error al cargar los conductores');
        }
        if (!response.data) {
          throw new Error('No hay datos de conductores disponibles');
        }
        const formattedDrivers: Driver[] = response.data.map(apiDriver => ({
          id: apiDriver.id,
          idNumber: apiDriver.userId.toString(),
          firstName: apiDriver.userProfile.firstName,
          lastName: apiDriver.userProfile.lastName,
          email: apiDriver.userProfile.email,
          phone: apiDriver.userProfile.phone,
          createdAt: apiDriver.createdAt,
          updatedAt: apiDriver.updatedAt,
          active: apiDriver.active
        }));
        setDrivers(formattedDrivers);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error al cargar los conductores';
        console.error('Error loading drivers:', errorMessage);
        setErrors(prev => [...prev, errorMessage]);
      } finally {
        setIsLoadingDrivers(false);
      }
    };

    loadDrivers();
  }, []);

  useEffect(() => {
    if (editingSchedules && mode === 'edit' && editingSchedules.length > 0) {
      const firstSchedule = editingSchedules[0];
      setSelectedDriverId(firstSchedule.driverId);

      // Marcar días seleccionados
      const updatedDaySchedules = daySchedules.map(daySchedule => {
        const matchingSchedule = editingSchedules.find(s => s.dayOfWeek.toUpperCase() === daySchedule.day);
        if (matchingSchedule) {
          return {
            ...daySchedule,
            selected: true
          };
        }
        return {
          ...daySchedule,
          selected: false
        };
      });

      setDaySchedules(updatedDaySchedules);

      // Establecer el horario global basado en el primer horario
      if (editingSchedules.length > 0) {
        setGlobalStartTime(editingSchedules[0].startTime.substring(0, 5));
        setGlobalEndTime(editingSchedules[0].endTime.substring(0, 5));
      }
    }
  }, [editingSchedules, mode]);

  const handleDayToggle = (dayIndex: number) => {
    const updatedSchedules = [...daySchedules];
    const newSelected = !updatedSchedules[dayIndex].selected;
    
    updatedSchedules[dayIndex] = {
      ...updatedSchedules[dayIndex],
      selected: newSelected,
      // Si se está deseleccionando, reseteamos los horarios a los valores por defecto
      ...((!newSelected) && {
        startTime: '08:00',
        endTime: '18:00'
      })
    };
    
    setDaySchedules(updatedSchedules);
  };

  const handleDayTimeChange = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const updatedSchedules = [...daySchedules];
    updatedSchedules[dayIndex][field] = value;
    setDaySchedules(updatedSchedules);
  };

  const handleSave = async () => {
    const newErrors: string[] = [];

    if (!selectedDriverId) {
      newErrors.push('Debe seleccionar un conductor');
    }

    const selectedDays = daySchedules.filter(d => d.selected);
    if (selectedDays.length === 0) {
      newErrors.push('Debe seleccionar al menos un día de la semana');
    }

    // Validar horarios
    if (!globalStartTime) {
      newErrors.push('Debe seleccionar la hora de inicio');
    }
    if (!globalEndTime) {
      newErrors.push('Debe seleccionar la hora de fin');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors([]);
    try {
      const schedules: DriverScheduleRequest[] = [];

      // Crear un horario para cada día seleccionado con el horario global
      selectedDays.forEach(day => {
        schedules.push({
          driverId: selectedDriverId,
          dayOfWeek: day.day,
          startTime: globalStartTime + ':00',
          endTime: globalEndTime + ':00'
        });
      });

      await onSave({ schedules });
    } catch (error: unknown) {
      const message = (error as any)?.message || 'Error al guardar los horarios';
      // Only log actual API errors, not validation errors
      if (!message.includes('ya tiene un horario asignado') && !message.includes('ya tiene un horario')) {
        console.error('Error saving schedules:', message);
      }
      setErrors([message]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-4 bg-card text-card-foreground rounded-lg overflow-y-auto">
      <div className="space-y-6">
        {/* Driver Selection */}
        <div className="w-full">
          <Label className="text-muted-foreground">Conductor *</Label>
          <Select
            value={selectedDriverId.toString()}
            onValueChange={(value) => setSelectedDriverId(parseInt(value))}
            disabled={isLoadingDrivers}
          >
            <SelectTrigger className="bg-input border-input text-foreground">
              <SelectValue placeholder="Selecciona un conductor" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id!.toString()}>
                  {`${driver.firstName} ${driver.lastName}`} - {driver.idNumber || "Sin identificación"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>


        {/* Day Selection */}
        <div>
          <Label className="text-muted-foreground">Días de la Semana *</Label>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {daySchedules.map((daySchedule, index) => (
              <label
                key={daySchedule.day}
                className={`
                  flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${daySchedule.selected
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-muted border-border text-foreground hover:bg-accent hover:border-accent-foreground"
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={daySchedule.selected ?? false}
                  onChange={() => handleDayToggle(index)}
                  className="sr-only"
                />
                <div
                  className={`
                  w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all duration-200
                  ${daySchedule.selected
                      ? "bg-primary border-primary"
                      : "border-border"
                    }
                `}
                >
                  {daySchedule.selected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium">{daySchedule.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Hora de Inicio *</Label>
            <Input
              type="time"
              value={globalStartTime}
              onChange={(e) => setGlobalStartTime(e.target.value)}
              className="bg-input border-input text-foreground"
            />
          </div>
          <div>
            <Label className="text-muted-foreground">Hora de Fin *</Label>
            <Input
              type="time"
              value={globalEndTime}
              onChange={(e) => setGlobalEndTime(e.target.value)}
              className="bg-input border-input text-foreground"
            />
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <svg
                className="w-5 h-5 text-red-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="text-sm font-semibold text-red-200">
                Por favor complete los siguientes campos:
              </h3>
            </div>
            <ul className="space-y-2">
              {errors.map((error, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-400 mr-2 mt-1">•</span>
                  <span className="text-sm text-red-200">{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-border text-foreground hover:bg-accent"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading
              ? "Guardando..."
              : mode === "create"
                ? "Crear Horario"
                : "Actualizar Horario"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DriverScheduleFormManager;