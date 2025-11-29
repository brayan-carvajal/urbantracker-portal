import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { VehicleFormData, VehicleType, VehicleStatus } from "../hooks/useVehicles"

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
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Vehiculo" : "Nuevo Vehiculo"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licensePlate" className="text-gray-400">
                Matrícula *
              </Label>
              <Input
                id="licensePlate"
                value={formData.licensePlate}
                onChange={(e) => onFormChange('licensePlate', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="ABC-123"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type" className="text-gray-400">
                Tipo *
              </Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: VehicleType) => onFormChange('type', value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {VEHICLE_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-gray-400">
                Marca *
              </Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => onFormChange('brand', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Volvo"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model" className="text-gray-400">
                Modelo *
              </Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => onFormChange('model', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="FH16"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-gray-400">
                Compañia *
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => onFormChange('company', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Transporte SA"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-400">
                Estado *
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: VehicleStatus) => onFormChange('status', value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {VEHICLE_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="driver" className="text-gray-400">
                Conductor
              </Label>
              <Input
                id="driver"
                value={formData.driver}
                onChange={(e) => onFormChange('driver', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Nombre del conductor"
              />
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isEditing ? "Editar" : "Crear"} Vehiculo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}