import { Plus, Route } from 'lucide-react';

interface RouteEmptyStateProps {
  onCreateRoute: () => void;
}

export default function RouteEmptyState({ onCreateRoute }: RouteEmptyStateProps) {
  return (
    <div className="p-12 text-center">
      <Route size={48} className="mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">
        No hay rutas registradas
      </h3>
      <p className="text-muted-foreground mb-6">
        Crea tu primera ruta para comenzar
      </p>
      <button
        onClick={onCreateRoute}
        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
      >
        <Plus size={20} />
        Crear Primera Ruta
      </button>
    </div>
  );
}