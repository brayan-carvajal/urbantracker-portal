import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Route, Edit, Trash2 } from "lucide-react"
import { RouteResponse } from "../types/routeTypes"

interface RouteCardProps {
  route: RouteResponse
  onEdit: (route: RouteResponse) => void
  onDelete: (id: number) => void
}

export function RouteCard({ route, onEdit, onDelete }: RouteCardProps) {
  const getStatusStyles = (active: boolean) => {
    return active
      ? "bg-success text-success-foreground hover:bg-success/90"
      : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
  }

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
                  {route.numberRoute}
                </h3>
                <Badge className={getStatusStyles(route.active)}>
                  {route.active ? "Activa" : "Inactiva"}
                </Badge>
              </div>
              {route.description && (
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {route.description}
                  </span>
                </div>
              )}
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">
                  Distancia:{" "}
                </span>
                <span className="text-primary">{route.totalDistance || 0} km</span>
                <span className="mx-2">•</span>
                <span className="font-medium text-muted-foreground">
                  Puntos:{" "}
                </span>
                <span className="text-primary">{route.waypoints}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(route)}
              className="flex items-center gap-2 hover:bg-accent/10 hover:text-accent transition-all duration-200"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(route.id!)}
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
