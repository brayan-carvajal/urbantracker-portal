import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  VehiculeFormData,
  Company,
  VehicleType,
} from "../types/vehiculeTypes";
import { Loader2, Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehicleModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: VehiculeFormData;
  onClose: () => void;
  onSave: () => void;
  onFormChange: (
    field: keyof VehiculeFormData,
    value: string | number | boolean | File | null
  ) => void;
  isSaving: boolean;
  errors: Record<string, string>;
  companies: Company[];
  vehicleTypes: VehicleType[];
}

type VehicleStatus = string;

const VEHICLE_STATUSES = [
  { value: "ACTIVE", label: "Activo" },
  { value: "INACTIVE", label: "Inactivo" },
] as const;

const getStatusLabel = (status: string): string => {
  const statusObj = VEHICLE_STATUSES.find((s) => s.value === status);
  return statusObj ? statusObj.label : status;
};

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  isEditing,
  formData,
  onClose,
  onSave,
  onFormChange,
  companies,
  vehicleTypes,
}) => {
  const handleFileChange = (field: 'outboundImage' | 'returnImage', file: File | null) => {
    onFormChange(field, file);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.licencePlate.trim()) {
      newErrors.licencePlate = "Número de matrícula requerido";
    } else if (formData.licencePlate.trim().length < 4) {
      newErrors.licencePlate =
        "Número de matrícula debe tener al menos 4 caracteres";
    } else if (!/^[A-Z]{3}-\d{3}$/.test(formData.licencePlate.trim())) {
      newErrors.licencePlate = "Número de matrícula debe tener formato AAA-123";
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "Marca requerida";
    } else if (formData.brand.trim().length < 2) {
      newErrors.brand = "Marca debe tener al menos 2 caracteres";
    }

    if (!formData.model.trim()) {
      newErrors.model = "Modelo requerido";
    } else if (formData.model.trim().length < 2) {
      newErrors.model = "Modelo debe tener al menos 2 caracteres";
    }

    if (formData.companyId === 0) {
      newErrors.companyId = "Compañía requerida";
    }

    if (formData.vehicleTypeId === 0) {
      newErrors.vehicleTypeId = "Tipo de vehículo requerido";
    }

    if (formData.year <= 0) {
      newErrors.year = "Año debe ser mayor a 0";
    }

    if (formData.passengerCapacity <= 0) {
      newErrors.passengerCapacity = "Capacidad debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange =
    (field: keyof VehiculeFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        event.target.type === "number"
          ? Number(event.target.value)
          : event.target.value;
      onFormChange(field, value);

      // Clear error when user starts typing
      if (errors[field as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSave();
    } catch (error) {
      console.error("Error cargando conductores:", error);
      // You can add a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-foreground max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Vehiculo" : "Nuevo Vehiculo"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licencePlate" className="text-foreground">
                Matrícula *
              </Label>
              <Input
                id="licencePlate"
                value={formData.licencePlate}
                onChange={handleInputChange("licencePlate")}
                className="bg-input border-border text-foreground"
                placeholder="ABC-123"
                disabled={isLoading}
              />
              {errors.licencePlate && (
                <p className="text-sm text-destructive">{errors.licencePlate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleTypeId" className="text-foreground">
                Tipo de Vehículo *
              </Label>
              <Select
                value={`${formData.vehicleTypeId}`}
                onValueChange={(value) =>
                  onFormChange("vehicleTypeId", Number(value))
                }
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Seleccione el tipo de vehículo" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()} className="text-popover-foreground hover:bg-accent focus:bg-accent">
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicleTypeId && (
                <p className="text-sm text-destructive">{errors.vehicleTypeId}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-foreground">
                Marca *
              </Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={handleInputChange("brand")}
                className="bg-input border-border text-foreground"
                placeholder="Volvo"
                disabled={isLoading}
              />
              {errors.brand && (
                <p className="text-sm text-destructive">{errors.brand}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model" className="text-foreground">
                Modelo *
              </Label>
              <Input
                id="model"
                value={formData.model}
                onChange={handleInputChange("model")}
                className="bg-input border-border text-foreground"
                placeholder="FH16"
                disabled={isLoading}
              />
              {errors.model && (
                <p className="text-sm text-destructive">{errors.model}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyId" className="text-foreground">
                Compañía *
              </Label>
              <Select
                value={`${formData.companyId}`}
                onValueChange={(value) =>
                  onFormChange("companyId", Number(value))
                }
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Seleccione la compañía" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()} className="text-popover-foreground hover:bg-accent focus:bg-accent">
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.companyId && (
                <p className="text-sm text-destructive">{errors.companyId}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year" className="text-foreground">
                Año *
              </Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={handleInputChange("year")}
                className="bg-input border-border text-foreground"
                placeholder="2023"
                disabled={isLoading}
              />
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color" className="text-foreground">
                Color
              </Label>
              <Input
                id="color"
                value={formData.color}
                onChange={handleInputChange("color")}
                className="bg-input border-border text-foreground"
                placeholder="Rojo"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passengerCapacity" className="text-foreground">
                Capacidad de Pasajeros *
              </Label>
              <Input
                id="passengerCapacity"
                type="number"
                value={formData.passengerCapacity}
                onChange={handleInputChange("passengerCapacity")}
                className="bg-input border-border text-foreground"
                placeholder="10"
                disabled={isLoading}
              />
              {errors.passengerCapacity && (
                <p className="text-sm text-destructive">
                  {errors.passengerCapacity}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-foreground">
                Estado *
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: VehicleStatus) =>
                  onFormChange("status", value)
                }
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Seleccione el estado">
                    {formData.status
                      ? getStatusLabel(formData.status)
                      : "Seleccione el estado"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {VEHICLE_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value} className="text-popover-foreground hover:bg-accent focus:bg-accent">
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inService" className="text-foreground">
              En Servicio
            </Label>
            <input
              id="inService"
              type="checkbox"
              checked={formData.inService}
              onChange={(e) => onFormChange("inService", e.target.checked)}
              className="bg-input border-border text-foreground"
              disabled={isLoading}
            />
          </div>

          {/* Images */}
          <div className="bg-accent/50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Imágenes de Referencia
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Imagen
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  {formData.outboundImage ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {formData.outboundImage.name}
                      </p>
                        <button
                          onClick={() =>
                            handleFileChange("outboundImage", null)
                          }
                          className="text-destructive hover:text-destructive/80 text-sm"
                        >
                          Remover
                        </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Subir imagen 
                      </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(
                              "outboundImage",
                              e.target.files?.[0] || null
                            )
                          }
                          className="hidden"
                          id="outbound-image"
                        />
                      <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                        <label
                          htmlFor="outbound-image"
                          className="cursor-pointer"
                        >
                          Seleccionar Archivo
                        </label>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border text-foreground hover:bg-accent"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Editar" : "Crear"} Vehiculo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};


