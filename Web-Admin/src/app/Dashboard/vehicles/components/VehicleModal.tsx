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
import { Loader2, Upload, Car } from "lucide-react";
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

    if (!formData.companyId || formData.companyId === 0) {
      newErrors.companyId = "Compañía requerida";
    }

    if (!formData.vehicleTypeId || formData.vehicleTypeId === 0) {
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
      <DialogContent 
        className="bg-card text-foreground max-w-6xl w-[96vw] max-h-[95vh] overflow-hidden p-0"
        aria-describedby="vehicle-modal-description"
      >
        <DialogHeader className="sticky top-0 bg-card border-b border-border z-20 px-4 sm:px-6 py-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
            <Car className="h-6 w-6 text-primary" />
            {isEditing ? "Editar Vehículo" : "Nuevo Vehículo"}
          </DialogTitle>
        </DialogHeader>
        
        {/* Hidden description for accessibility */}
        <div id="vehicle-modal-description" className="sr-only">
          Formulario para crear o editar información de vehículos
        </div>
        
        <div className="overflow-y-auto max-h-[calc(95vh-100px)]">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-8">
            {/* Sección 1: Información Básica */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">1</span>
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Información Básica del Vehículo
                </h2>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Matrícula */}
                <div className="space-y-3">
                  <Label htmlFor="licencePlate" className="text-sm font-semibold text-foreground">
                    Matrícula del vehículo *
                  </Label>
                  <Input
                    id="licencePlate"
                    value={formData.licencePlate}
                    onChange={handleInputChange("licencePlate")}
                    className="bg-input border-border text-foreground h-12 text-base"
                    placeholder="ABC-123"
                    disabled={isLoading}
                  />
                  {errors.licencePlate && (
                    <p className="text-sm text-destructive font-medium">{errors.licencePlate}</p>
                  )}
                </div>

                {/* Tipo de Vehículo */}
                <div className="space-y-3">
                  <Label htmlFor="vehicleTypeId" className="text-sm font-semibold text-foreground">
                    Tipo de vehículo *
                  </Label>
                  <Select
                    value={formData.vehicleTypeId ? `${formData.vehicleTypeId}` : ""}
                    onValueChange={(value) =>
                      onFormChange("vehicleTypeId", value ? Number(value) : null)
                    }
                  >
                    <SelectTrigger className="bg-input border-border text-foreground h-12 text-base">
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
                    <p className="text-sm text-destructive font-medium">{errors.vehicleTypeId}</p>
                  )}
                </div>

                {/* Marca */}
                <div className="space-y-3">
                  <Label htmlFor="brand" className="text-sm font-semibold text-foreground">
                    Marca *
                  </Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={handleInputChange("brand")}
                    className="bg-input border-border text-foreground h-12 text-base"
                    placeholder="Volvo, Mercedes, Scania..."
                    disabled={isLoading}
                  />
                  {errors.brand && (
                    <p className="text-sm text-destructive font-medium">{errors.brand}</p>
                  )}
                </div>

                {/* Modelo */}
                <div className="space-y-3">
                  <Label htmlFor="model" className="text-sm font-semibold text-foreground">
                    Modelo *
                  </Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={handleInputChange("model")}
                    className="bg-input border-border text-foreground h-12 text-base"
                    placeholder="FH16, Sprinter, etc."
                    disabled={isLoading}
                  />
                  {errors.model && (
                    <p className="text-sm text-destructive font-medium">{errors.model}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 2: Detalles del Vehículo */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">2</span>
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Detalles y Características
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Compañía */}
                <div className="space-y-3 md:col-span-2 xl:col-span-2">
                  <Label htmlFor="companyId" className="text-sm font-semibold text-foreground">
                    Compañía *
                  </Label>
                  <Select
                    value={formData.companyId ? `${formData.companyId}` : ""}
                    onValueChange={(value) =>
                      onFormChange("companyId", value ? Number(value) : null)
                    }
                  >
                    <SelectTrigger className="bg-input border-border text-foreground h-12 text-base">
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
                    <p className="text-sm text-destructive font-medium">{errors.companyId}</p>
                  )}
                </div>

                {/* Año */}
                <div className="space-y-3">
                  <Label htmlFor="year" className="text-sm font-semibold text-foreground">
                    Año *
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={handleInputChange("year")}
                    className="bg-input border-border text-foreground h-12 text-base"
                    placeholder="2023"
                    min="1900"
                    max="2030"
                    disabled={isLoading}
                  />
                  {errors.year && (
                    <p className="text-sm text-destructive font-medium">{errors.year}</p>
                  )}
                </div>

                {/* Color */}
                <div className="space-y-3">
                  <Label htmlFor="color" className="text-sm font-semibold text-foreground">
                    Color
                  </Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={handleInputChange("color")}
                    className="bg-input border-border text-foreground h-12 text-base"
                    placeholder="Rojo, azul, blanco..."
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Capacidad */}
                <div className="space-y-3">
                  <Label htmlFor="passengerCapacity" className="text-sm font-semibold text-foreground">
                    Capacidad de pasajeros *
                  </Label>
                  <Input
                    id="passengerCapacity"
                    type="number"
                    value={formData.passengerCapacity}
                    onChange={handleInputChange("passengerCapacity")}
                    className="bg-input border-border text-foreground h-12 text-base"
                    placeholder="10"
                    min="1"
                    max="100"
                    disabled={isLoading}
                  />
                  {errors.passengerCapacity && (
                    <p className="text-sm text-destructive font-medium">{errors.passengerCapacity}</p>
                  )}
                </div>

                {/* Estado */}
                <div className="space-y-3">
                  <Label htmlFor="status" className="text-sm font-semibold text-foreground">
                    Estado del vehículo *
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: VehicleStatus) =>
                      onFormChange("status", value)
                    }
                  >
                    <SelectTrigger className="bg-input border-border text-foreground h-12 text-base">
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

                {/* En Servicio */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">
                    Configuración de servicio
                  </Label>
                  <div className="flex items-center space-x-3 p-4 bg-accent/20 rounded-lg border border-border h-12">
                    <input
                      id="inService"
                      type="checkbox"
                      checked={formData.inService ?? false}
                      onChange={(e) => onFormChange("inService", e.target.checked)}
                      className="h-5 w-5 text-primary border-border rounded focus:ring-primary focus:ring-2"
                      disabled={isLoading}
                    />
                    <Label htmlFor="inService" className="text-foreground font-medium cursor-pointer">
                      En servicio activo
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 3: Imágenes */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">3</span>
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Imágenes del Vehículo
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Imagen Principal */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-3 block">
                      Imagen del vehículo
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center min-h-[200px] flex flex-col justify-center bg-accent/10 hover:bg-accent/20 transition-colors">
                      {formData.outboundImage ? (
                        <div className="space-y-4">
                          {/* Vista previa de la imagen */}
                          <div className="flex justify-center">
                            <img
                              src={URL.createObjectURL(formData.outboundImage)}
                              alt="Vista previa"
                              className="max-h-40 max-w-full object-contain rounded-lg shadow-sm"
                              onLoad={(e) => {
                                // Liberar el objeto URL después de cargar la imagen
                                URL.revokeObjectURL((e.target as HTMLImageElement).src);
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground font-medium break-all">
                              {formData.outboundImage.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Tamaño: {(formData.outboundImage.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleFileChange("outboundImage", null)}
                            className="text-destructive border-destructive/50 hover:bg-destructive/10"
                            size="sm"
                          >
                            Remover imagen
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground font-medium">
                              Subir imagen del vehículo
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Formatos soportados: JPG, PNG, WebP
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              e.stopPropagation();
                              handleFileChange(
                                "outboundImage",
                                e.target.files?.[0] || null
                              );
                            }}
                            className="hidden"
                            id="outbound-image"
                          />
                          <Button 
                            type="button"
                            variant="outline" 
                            className="border-border text-foreground hover:bg-accent" 
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              document.getElementById('outbound-image')?.click();
                            }}
                          >
                            <Upload className="h-4 w-4" />
                            Seleccionar archivo
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Consejos de Imagen */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-foreground">
                    Recomendaciones para la imagen
                  </Label>
                  <div className="bg-accent/20 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-foreground text-sm">Para mejores resultados:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Imagen en formato cuadrado o rectangular</li>
                      <li>• Resolución mínima de 800x600 píxeles</li>
                      <li>• Archivo de tamaño máximo 5MB</li>
                      <li>• Vehículo completamente visible</li>
                      <li>• Buena iluminación y calidad</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="sticky bottom-0 bg-card pt-6 border-t border-border -mx-4 sm:-mx-6 px-4 sm:px-6 -mb-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full sm:w-auto border-border text-foreground hover:bg-accent transition-colors h-12 text-base font-medium"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground transition-colors h-12 text-base font-medium"
                >
                  {isLoading && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                  {isEditing ? "Actualizar Vehículo" : "Crear Vehículo"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
