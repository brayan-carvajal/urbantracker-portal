import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Route, Car, Edit, Trash2 } from "lucide-react"
import { RouteAssignment } from "../types/routeAssignmentTypes"

interface RouteAssignmentCardProps {
  routeAssignment: RouteAssignment
  onEdit: (assignment: RouteAssignment) => void
  onDelete: (id: number) => void
}

const getStatusLabel = (assignmentStatus: string): string => {
    return assignmentStatus === 'ACTIVE' ? 'Activo' : 'Inactivo';
};

const getStatusColor = (assignmentStatus: string): string => {
    return assignmentStatus === 'ACTIVE' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground';
};

export function RouteAssignmentCard({ routeAssignment, onEdit, onDelete }: RouteAssignmentCardProps) {

    return (
        <Card className="bg-card border-border hover:bg-accent transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-primary/20 rounded-full">
                            <Route className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-foreground">
                                    Ruta {routeAssignment.routeNumber} - Vehículo {routeAssignment.vehiclePlate}
                                </h3>
                                <Badge className={getStatusColor(routeAssignment.assignmentStatus)}>
                                    {getStatusLabel(routeAssignment.assignmentStatus)}
                                </Badge>
                            </div>
                            <div className="text-muted-foreground space-y-1">
                                {routeAssignment.driverId && (
                                    <div>
                                        <span className="font-medium text-foreground">Conductor ID: </span>
                                        <span className="text-primary">{routeAssignment.driverId}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="font-medium text-foreground">Estado: </span>
                                    <span className={`font-medium ${routeAssignment.assignmentStatus === 'ACTIVE' ? 'text-success' : 'text-destructive'}`}>
                                        {routeAssignment.assignmentStatus === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                {routeAssignment.note && (
                                    <div>
                                        <span className="font-medium text-foreground">Nota: </span>
                                        <span className="text-muted-foreground">{routeAssignment.note}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="font-medium text-foreground">Creado: </span>
                                    <span className="text-muted-foreground">{new Date(routeAssignment.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(routeAssignment)}
                            className="flex items-center gap-2 hover:bg-accent/10 hover:text-accent transition-all duration-200"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(routeAssignment.id)}
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