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
    <Card className="bg-card border-border hover:bg-accent transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-1 items-center gap-4 min-w-0">
            <div className="p-3 bg-primary/20 rounded-full flex-shrink-0">
              <Car className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="text-lg md:text-xl font-bold text-foreground truncate">
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
          </div>
          
          <div className="flex gap-2 sm:flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(vehicle)}
              className="flex items-center gap-1 md:gap-2 hover:bg-accent/10 hover:text-accent transition-all duration-200 flex-1 sm:flex-none"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Editar</span>
              <span className="sm:hidden">Editar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(vehicle.id)}
              className="border-destructive/50 text-destructive hover:bg-destructive/10 flex-1 sm:flex-none"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Eliminar</span>
              <span className="sm:hidden">Eliminar</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}