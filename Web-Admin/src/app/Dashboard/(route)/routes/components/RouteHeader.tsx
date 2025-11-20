import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface RouteHeaderProps {
  onCreateRoute: () => void;
}

export default function RouteHeader({ onCreateRoute }: RouteHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestión de Rutas</h1>
        <p className="text-muted-foreground mt-2">
          Administra las rutas de transporte
        </p>
      </div>
      <Button
        onClick={onCreateRoute}
        className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105"
      >
        <Plus className="h-4 w-4 mr-2" />
        Nueva ruta
      </Button>
    </div>
  );
}