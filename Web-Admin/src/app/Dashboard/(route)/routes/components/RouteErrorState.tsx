interface RouteErrorStateProps {
  error: string;
}

export default function RouteErrorState({ error }: RouteErrorStateProps) {
  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <div className="text-center">
        <p className="text-destructive mb-4">Error al cargar rutas: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}