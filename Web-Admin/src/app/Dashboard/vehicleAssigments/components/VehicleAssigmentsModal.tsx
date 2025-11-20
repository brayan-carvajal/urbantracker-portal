
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog"
import type { VehicleAssigmentFormData } from "../types/VehicleAssigmentsType"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useVehicles } from "../../vehicles/hooks/useVehicles"
import { useDrivers } from "../../drivers/hooks/useDrivers"

interface VehicleAssigmentModalProps {
  isOpen: boolean
  isEditing: boolean
  formData: VehicleAssigmentFormData
  onClose: () => void
  onSave: () => void
  onFormChange: (field: keyof VehicleAssigmentFormData, value: string ) => void
  isSaving: boolean;
  errors: Record<string, string>
}

export const VehicleAssigmentModal: React.FC<VehicleAssigmentModalProps> = ({
  isOpen,
  isEditing,
  formData,
  onClose,
  onSave,
  onFormChange,
  isSaving,
  errors
}) => {

    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

    const { filteredVehicles: vehicles } = useVehicles();
    const { filteredDrivers: drivers } = useDrivers();
  
    const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {};

      if (!formData.vehicleId) {
        newErrors.vehicleId = 'Vehículo requerido';
      }

      if (!formData.driverId) {
        newErrors.driverId = 'Conductor requerido';
      }

      if (!formData.assignmentStatus.trim()) {
        newErrors.assignmentStatus = 'Estado de asignación requerido';
      } else if (formData.assignmentStatus.trim().length < 2) {
        newErrors.assignmentStatus = 'Estado de asignación debe tener al menos 2 caracteres';
      }

      if (!formData.note.trim()) {
        newErrors.note = 'Nota requerida';
      } else if (formData.note.trim().length < 2) {
        newErrors.note = 'Nota debe tener al menos 2 caracteres';
      }

      setLocalErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleInputChange = (field: keyof VehicleAssigmentFormData) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        onFormChange(field, value);

        // Clear error when user starts typing
        if (localErrors[field]) {
          setLocalErrors(prev => ({ ...prev, [field]: '' }));
        }
      };
  
    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
         
      if (!validateForm()) return;
  
      setLocalErrors({});
      try {
        await onSave();
      } catch (error) {
        console.error('Error cargando conductores:', error);
        // You can add a toast notification here
      }
    };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-foreground max-w-4xl border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? "Editar Asignación" : "Nueva Asignación"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_id" className="text-foreground">
                Vehículo *
              </Label>
              <Select
                value={formData.vehicleId ? formData.vehicleId.toString() : ""}
                onValueChange={(value: string) => onFormChange("vehicleId", value)}
              >
                <SelectTrigger className="w-full bg-input border-border text-foreground">
                  <SelectValue placeholder="Seleccione un vehículo" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border min-w-[300px]">
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()} className="text-popover-foreground hover:bg-accent focus:bg-accent">
                      {vehicle.licencePlate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(localErrors.vehicleId || errors.vehicleId) && (
                <p className="text-sm text-destructive">{(localErrors.vehicleId || errors.vehicleId)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver_id" className="text-foreground">
                Conductor *
              </Label>
              <Select
                value={formData.driverId ? formData.driverId.toString() : ""}
                onValueChange={(value: string) => onFormChange("driverId", value)}
              >
                <SelectTrigger className="w-full bg-input border-border text-foreground">
                  <SelectValue placeholder="Seleccione un conductor" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border min-w-[300px]">
                  {drivers.map(driver => (
                    <SelectItem key={driver.id} value={driver.id.toString()} className="text-popover-foreground hover:bg-accent focus:bg-accent">
                      {driver.firstName} {driver.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(localErrors.driverId || errors.driverId) && (
                <p className="text-sm text-destructive">{(localErrors.driverId || errors.driverId)}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignmentStatus" className="text-foreground">
                Estado *
              </Label>
              <Select
                value={formData.assignmentStatus}
                onValueChange={(value: string) =>
                  onFormChange("assignmentStatus", value)
                }
              >
                <SelectTrigger className="w-full bg-input border-border text-foreground">
                  <SelectValue placeholder="Seleccione el estado" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border min-w-[200px]">
                  <SelectItem value="ACTIVE" className="text-popover-foreground hover:bg-accent focus:bg-accent">Activo</SelectItem>
                  <SelectItem value="INACTIVE" className="text-popover-foreground hover:bg-accent focus:bg-accent">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-foreground">
                Nota *
              </Label>
              <textarea
                id="note"
                value={formData.note}
                onChange={(event) => {
                  const value = event.target.value;
                  onFormChange("note", value);
                  if (localErrors.note || errors.note) {
                    setLocalErrors(prev => ({ ...prev, note: '' }));
                  }
                }}
                className="w-full bg-input border-border text-foreground rounded px-3 py-2 resize-none placeholder-muted-foreground"
                placeholder="Nota de asignación"
                disabled={isSaving}
                rows={3}
              />
              {(localErrors.note || errors.note) && (
                <p className="text-sm text-destructive">{(localErrors.note || errors.note)}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border text-foreground hover:bg-accent"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
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