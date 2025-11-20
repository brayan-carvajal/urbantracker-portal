import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, Edit, Trash2 } from "lucide-react"
import { VehicleAssigment } from "../types/VehicleAssigmentsType"

interface VehicleAssigmentCardProps {
  vehicleAssigment: VehicleAssigment
  onEdit: (vehicle: VehicleAssigment) => void
  onDelete: (id: number) => void
}

const getStatusLabel = (status: string): string => {
    switch (status) {
        case 'ACTIVE':
            return 'Activo';
        case 'INACTIVE':
            return 'Inactivo';
        default:
            return status;
    }
};

const getStatusStyles = (status: string) => {
    const styles: Record<string, string> = {
      "ACTIVE": "bg-success text-success-foreground hover:bg-success/90",
      "INACTIVE": "bg-destructive text-destructive-foreground hover:bg-destructive/90"
    }
    return styles[status] || "bg-muted text-muted-foreground hover:bg-muted/80"
}

export function VehicleAssigmentCard({ vehicleAssigment, onEdit, onDelete }: VehicleAssigmentCardProps) {

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
                                    {vehicleAssigment.vehiclePlate}
                                </h3>
                                <Badge className={getStatusStyles(vehicleAssigment.assignmentStatus)}>
                                    {getStatusLabel(vehicleAssigment.assignmentStatus)}
                                </Badge>
                            </div>
                            <div className="text-muted-foreground space-y-1">
                                <div>
                                    <span className="font-medium text-foreground">Conductor: </span>
                                    <span className="text-primary">{vehicleAssigment.driverName}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-foreground">Nota: </span>
                                    <span className="text-muted-foreground">{vehicleAssigment.note}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(vehicleAssigment)}
                            className="flex items-center gap-2 hover:bg-accent/10 hover:text-accent transition-all duration-200"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(vehicleAssigment.id)}
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
