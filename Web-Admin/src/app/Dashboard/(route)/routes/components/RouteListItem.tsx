import { Edit3, Trash2 } from 'lucide-react';
import { RouteResponse } from '../types/routeTypes';

interface RouteListItemProps {
  route: RouteResponse;
  onEdit: (route: RouteResponse) => void;
  onDelete: (routeId: number) => void;
}

export default function RouteListItem({ route, onEdit, onDelete }: RouteListItemProps) {
  return (
    <div className="p-6 hover:bg-accent transition-colors border border-border rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h3 className="text-xl font-medium text-foreground">
              {route.numberRoute}
            </h3>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                route.active
                  ? "bg-success/20 text-success hover:bg-success/30"
                  : "bg-destructive/20 text-destructive hover:bg-destructive/30"
              }`}
            >
              {route.active ? "Activa" : "Inactiva"}
            </span>
          </div>

          {route.description && (
            <p className="text-muted-foreground mb-3 max-w-2xl">
              {route.description}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">
                Distancia:
              </span>{" "}
              {route.totalDistance || 0} km
            </div>
            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">
                Puntos:
              </span>{" "}
              {route.waypoints}
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-6">
          <button
            onClick={() => onEdit(route)}
            className="text-primary hover:text-primary/80 px-4 py-2 text-sm font-medium rounded-md hover:bg-primary/10 transition-colors flex items-center gap-2"
          >
            <Edit3 size={16} />
            Editar
          </button>
          <button
            onClick={() => onDelete(route.id!)}
            className="text-destructive hover:text-destructive/80 px-4 py-2 text-sm font-medium rounded-md hover:bg-destructive/10 transition-colors flex items-center gap-2"
          >
            <Trash2 size={16} />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}