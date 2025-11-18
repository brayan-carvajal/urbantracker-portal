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
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-primary/20 rounded-full">
              <Car className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-foreground">
                  {vehicle.licencePlate}
                </h3>
                <Badge className={getStatusStyles(vehicle.status)}>
                  {getStatusInSpanish(vehicle.status)}
                </Badge>
              </div>
              <div className="text-muted-foreground">
                <span className="font-medium text-foreground flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" /> Marca/Modelo: {vehicle.brand} {vehicle.model}
                </span>

                <span className="font-medium text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" /> Año: {vehicle.year}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" /> <span className="text-primary">Capacidad: {vehicle.passengerCapacity} pasajeros</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(vehicle)}
              className="flex items-center gap-2 hover:bg-accent/10 hover:text-accent transition-all duration-200"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(vehicle.id)}
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}