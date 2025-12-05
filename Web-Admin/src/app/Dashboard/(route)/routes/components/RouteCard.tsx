import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Route, Edit, Trash2, MapPin, Calendar } from "lucide-react"
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
        <div className="flex items-start gap-4">
          {/* Route Images */}
          <div className="flex-shrink-0 flex gap-2">
            {/* Outbound Image */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground font-medium">Ida</span>
              <div className="w-16 h-16">
                {route.hasOutboundImage ? (
                  <img
                    src={`http://localhost:8080/api/v1/routes/${route.id}/images/outbound?t=${Date.now()}`}
                    alt="Imagen de ida"
                    className="w-full h-full object-cover rounded-lg border border-border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.fallback-icon')) {
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = 'fallback-icon w-full h-full bg-primary/10 rounded-lg border border-border flex items-center justify-center';
                        fallbackDiv.innerHTML = '<svg class="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/></svg>';
                        parent.appendChild(fallbackDiv);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 rounded-lg border border-border flex items-center justify-center">
                    <Route className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
            </div>

            {/* Return Image */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground font-medium">Vuelta</span>
              <div className="w-16 h-16">
                {route.hasReturnImage ? (
                  <img
                    src={`http://localhost:8080/api/v1/routes/${route.id}/images/return?t=${Date.now()}`}
                    alt="Imagen de vuelta"
                    className="w-full h-full object-cover rounded-lg border border-border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.fallback-icon')) {
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = 'fallback-icon w-full h-full bg-primary/10 rounded-lg border border-border flex items-center justify-center';
                        fallbackDiv.innerHTML = '<svg class="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/></svg>';
                        parent.appendChild(fallbackDiv);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 rounded-lg border border-border flex items-center justify-center">
                    <Route className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Route Information */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-foreground truncate">
                    Ruta {route.numberRoute}
                  </h3>
                  <Badge className={`${getStatusStyles(route.active)} text-xs`}>
                    {route.active ? "Activa" : "Inactiva"}
                  </Badge>
                </div>

                {route.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {route.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Distancia:</span>
                    <span className="font-medium text-primary">{route.totalDistance || 0} km</span>
                  </span>

                  <span className="flex items-center gap-2">
                    <Route className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Puntos:</span>
                    <span className="font-medium text-primary">{route.waypoints}</span>
                  </span>

                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Creado:</span>
                    <span className="font-medium text-muted-foreground">
                      {new Date(route.createdAt).toLocaleDateString()}
                    </span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(route)}
                  className="flex items-center gap-2 hover:bg-accent/10 hover:text-accent transition-all duration-200"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(route.id!)}
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
