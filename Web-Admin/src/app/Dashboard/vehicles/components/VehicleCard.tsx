import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, Edit, Trash2, Calendar, Users, Palette, Building, CheckCircle, XCircle } from "lucide-react"
import type { Vehicle, Company, VehicleType } from "../types/vehiculeTypes"


interface VehicleCardProps {
  vehicle: Vehicle
  companies: Company[]
  vehicleTypes: VehicleType[]
  onEdit: (vehicle: Vehicle) => void
  onDelete: (id: number) => void
}

export function VehicleCard({ vehicle, companies, vehicleTypes, onEdit, onDelete }: VehicleCardProps) {
  const getStatusInSpanish = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return 'Activo';
      case 'INACTIVE':
        return 'Inactivo';
      default:
        return status;
    }
  };

  const getStatusStyles = (status: Vehicle['status']) => {
    const styles: Record<string, string> = {
      "ACTIVE": "bg-success text-success-foreground hover:bg-success/90",
      "INACTIVE": "bg-destructive text-destructive-foreground hover:bg-destructive/90"
    }
    return styles[status] || "bg-muted text-muted-foreground hover:bg-muted/80"
  }

  const getCompanyName = (companyId: number): string => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'N/A';
  };

  const getVehicleTypeName = (vehicleTypeId: number): string => {
    const vehicleType = vehicleTypes.find(vt => vt.id === vehicleTypeId);
    return vehicleType ? vehicleType.name : 'N/A';
  };

  return (
    <Card className="bg-card border-border hover:bg-accent transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Vehicle Image */}
          <div className="flex-shrink-0">
            {vehicle.hasOutboundImage ? (
              <img
                src={`http://localhost:8080/api/v1/vehicles/${vehicle.id}/images/outbound?t=${Date.now()}`}
                alt={`Imagen del vehículo ${vehicle.licencePlate}`}
                className="w-20 h-20 object-cover rounded-lg border border-border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  // Show fallback icon when image fails
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.fallback-icon')) {
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = 'fallback-icon w-20 h-20 flex items-center justify-center bg-primary/10 rounded-lg border border-border';
                    fallbackDiv.innerHTML = '<svg class="h-7 w-7 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/></svg>';
                    parent.appendChild(fallbackDiv);
                  }
                }}
              />
            ) : (
              <div className="w-20 h-20 bg-primary/10 rounded-lg border border-border flex items-center justify-center">
                <Car className="h-7 w-7 text-primary" />
              </div>
            )}
          </div>

          {/* Vehicle Information */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-foreground truncate">
                    {vehicle.licencePlate}
                  </h3>
                  <Badge className={`${getStatusStyles(vehicle.status)} text-xs`}>
                    {getStatusInSpanish(vehicle.status)}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  Marca: <span className="font-medium text-primary">{vehicle.brand}</span> • Modelo: <span className="font-medium text-primary">{vehicle.model}</span> • {vehicle.color} • {vehicle.year}
                </p>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Capacidad:</span>
                    <span className="font-medium text-primary">{vehicle.passengerCapacity}</span>
                  </span>

                  <span className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Compañía:</span>
                    <span className="font-medium truncate max-w-[120px]" title={getCompanyName(vehicle.companyId)}>
                      {getCompanyName(vehicle.companyId)}
                    </span>
                  </span>

                  <span className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="font-medium truncate max-w-[120px]" title={getVehicleTypeName(vehicle.vehicleTypeId)}>
                      {getVehicleTypeName(vehicle.vehicleTypeId)}
                    </span>
                  </span>

                  <span className="flex items-center gap-2">
                    {vehicle.inService ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-muted-foreground">En servicio:</span>
                    <span className={`font-medium ${vehicle.inService ? "text-green-600" : "text-red-600"}`}>
                      {vehicle.inService ? "Sí" : "No"}
                    </span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(vehicle)}
                  className="flex items-center gap-2 hover:bg-accent/10 hover:text-accent transition-all duration-200"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(vehicle.id)}
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Eliminar</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}