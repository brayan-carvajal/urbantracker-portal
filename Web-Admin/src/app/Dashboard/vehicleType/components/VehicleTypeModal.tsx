import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { VehicleTypeFormData } from "../types/vehicleTypes";

interface VehicleTypeModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: VehicleTypeFormData;
  onClose: () => void;
  onSave: () => void;
  onFormChange: (field: keyof VehicleTypeFormData, value: string) => void;
  isSaving: boolean;
  errors: Record<string, string>;
}

const VehicleTypeModal: React.FC<VehicleTypeModalProps> = ({
  isOpen,
  isEditing,
  formData,
  onClose,
  onSave,
  onFormChange,
  isSaving,
  errors,
}) => {
  const [localErrors, setLocalErrors] = useState<Partial<VehicleTypeFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<VehicleTypeFormData> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Nombre requerido";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Nombre debe tener al menos 2 caracteres";
    }
    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof VehicleTypeFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      onFormChange(field, value);
      if (localErrors[field]) {
        setLocalErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;
    await onSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-foreground max-w-2xl border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? "Editar Tipo de Vehículo" : "Nuevo Tipo de Vehículo"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Nombre *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange("name")}
                className="bg-input border-border text-foreground"
                placeholder="Nombre del tipo de vehículo"
                disabled={isSaving}
              />
              {localErrors.name && (
                <p className="text-sm text-destructive">{localErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">
                Descripción
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={handleInputChange("description")}
                className="bg-input border-border text-foreground"
                placeholder="Descripción del tipo de vehículo"
                disabled={isSaving}
              />
              {localErrors.description && (
                <p className="text-sm text-destructive">{localErrors.description}</p>
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
              {isEditing ? "Editar" : "Crear"} Tipo de Vehículo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};


export default VehicleTypeModal;
