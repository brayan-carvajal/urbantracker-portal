import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog"
import type { RouteAssignmentFormData } from "../types/routeAssignmentTypes"
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoutesApi } from "../../routes/services/api/routeApi";
import { useVehicles } from "../../../vehicles/hooks/useVehicles";
import { useDrivers } from "../../../drivers/hooks/useDrivers";
import { RouteResponse } from "../../routes/types/routeTypes";

interface RouteAssignmentModalProps {
  isOpen: boolean
  isEditing: boolean
  formData: RouteAssignmentFormData
  onClose: () => void
  onSave: () => void
  onFormChange: (field: keyof RouteAssignmentFormData, value: string | number) => void
  isSaving: boolean;
  errors: Record<string, string>
}

export const RouteAssignmentModal: React.FC<RouteAssignmentModalProps> = ({
  isOpen,
  isEditing,
  formData,
  onClose,
  onSave,
  onFormChange,
  isSaving,
  errors
}) => {

    const [isLoading, setIsLoading] = useState(false);
    const [routes, setRoutes] = useState<RouteResponse[]>([]);

    const { filteredVehicles: vehicles } = useVehicles();
    const { filteredDrivers: drivers } = useDrivers();

    useEffect(() => {
      const loadRoutes = async () => {
        try {
          const response = await RoutesApi.getAllRoutes();
          if (response.success && response.data) {
            setRoutes(response.data);
          }
        } catch (error) {
          console.error('Error loading routes:', error);
        }
      };

      loadRoutes();
    }, []);

    const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {};

      if (!formData.routeId) {
        newErrors.routeId = 'Ruta requerida';
      }

      if (!formData.vehicleId) {
        newErrors.vehicleId = 'Vehículo requerido';
      }

      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();

      if (!validateForm()) return;

      setIsLoading(true);
      try {
        await onSave();
      } catch (error) {
        console.error('Error guardando asignación:', error);
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-card-foreground max-w-4xl border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? "Editar Asignación de Ruta" : "Nueva Asignación de Ruta"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="route_id" className="text-muted-foreground">
                Ruta *
              </Label>
              <Select
                value={formData.routeId ? formData.routeId.toString() : ""}
                onValueChange={(value: string) => onFormChange("routeId", parseInt(value))}
              >
                <SelectTrigger className="w-full bg-card border-border text-card-foreground">
                  <SelectValue placeholder="Seleccione una ruta" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border min-w-[300px]">
                  {routes.map(route => (
                    <SelectItem key={route.id} value={route.id!.toString()}>
                      Ruta {route.numberRoute} - {route.description || "Sin descripción"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.routeId && (
                <p className="text-sm text-destructive">{errors.routeId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_id" className="text-muted-foreground">
                Vehículo *
              </Label>
              <Select
                value={formData.vehicleId ? formData.vehicleId.toString() : ""}
                onValueChange={(value: string) => onFormChange("vehicleId", parseInt(value))}
              >
                <SelectTrigger className="w-full bg-card border-border text-card-foreground">
                  <SelectValue placeholder="Seleccione un vehículo" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border min-w-[300px]">
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.licencePlate} - {vehicle.brand} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicleId && (
                <p className="text-sm text-destructive">{errors.vehicleId}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-muted-foreground">
                Estado *
              </Label>
              <Select
                value={formData.assignmentStatus}
                onValueChange={(value: string) => onFormChange("assignmentStatus", value as 'ACTIVE' | 'INACTIVE')}
              >
                <SelectTrigger className="w-full bg-input border-input text-foreground">
                  <SelectValue placeholder="Seleccione el estado" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border min-w-[200px]">
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="INACTIVE">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="note" className="text-muted-foreground">
                Nota
              </Label>
              <textarea
                id="note"
                value={formData.note || ''}
                onChange={(event) => {
                  const value = event.target.value;
                  onFormChange("note", value);
                }}
                className="w-full bg-input border-input text-foreground rounded px-3 py-2 resize-none"
                placeholder="Nota de asignación (opcional)"
                disabled={isLoading}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border text-foreground hover:bg-accent"
              disabled={isLoading || isSaving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Editar" : "Crear"} Asignación
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}