import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, Edit, Trash2, Calendar, Users } from "lucide-react"
import { Vehicle } from "../types/vehiculeTypes"


interface VehicleCardProps {
  vehicle: Vehicle
  onEdit: (vehicle: Vehicle) => void
  onDelete: (id: number) => void
}

export function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
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

  return (
    <Card className="bg-card border-border hover:bg-accent transition-all duration-300 hover:scale-[1.02] overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Vehicle Image - Main Visual Element */}
          <div className="w-full lg:w-48 h-48 flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/5">
            {vehicle.outboundImageUrl || vehicle.returnImageUrl ? (
              <img 
                src={vehicle.outboundImageUrl || vehicle.returnImageUrl} 
                alt={`Imagen del vehículo ${vehicle.licencePlate}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  // Show fallback icon when image fails
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.fallback-icon')) {
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = 'fallback-icon w-full h-full flex items-center justify-center';
                    fallbackDiv.innerHTML = '<svg class="h-16 w-16 text-primary/60" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/></svg>';
                    parent.appendChild(fallbackDiv);
                  }
                }}
              />
            ) : (
              // Fallback Icon when no image
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                <Car className="h-16 w-16 text-primary/60" />
              </div>
            )}
          </div>
          
          {/* Vehicle Information */}
          <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="text-lg md:text-xl font-bold text-foreground">
                  {vehicle.licencePlate}
                </h3>
                <Badge className={`${getStatusStyles(vehicle.status)} w-fit`}>
                  {getStatusInSpanish(vehicle.status)}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground flex items-center gap-1 md:gap-2">
                    <Car className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" /> 
                    <span className="truncate">{vehicle.brand} {vehicle.model}</span>
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <span className="text-sm font-medium text-foreground flex items-center gap-1 md:gap-2">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" /> 
                    <span>Año: {vehicle.year}</span>
                  </span>
                  <span className="text-sm font-medium text-foreground flex items-center gap-1 md:gap-2">
                    <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" /> 
                    <span className="text-primary">Capacidad: {vehicle.passengerCapacity}</span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 sm:flex-shrink-0 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(vehicle)}
                className="flex items-center gap-1 md:gap-2 hover:bg-accent/10 hover:text-accent transition-all duration-200 flex-1 sm:flex-none"
              >
                <Edit className="h-4 w-4" />
                <span>Editar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(vehicle.id)}
                className="border-destructive/50 text-destructive hover:bg-destructive/10 flex-1 sm:flex-none"
              >
                <Trash2 className="h-4 w-4" />
                <span>Eliminar</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}