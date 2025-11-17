import { Plus, Minus } from "lucide-react"

import { Button } from "components/ui/button"
import { useMapboxRef } from "./map-view"

export function MapControls() {
  const mapRef = useMapboxRef();

  const handleZoom = (delta: number) => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.zoomTo(currentZoom + delta, { duration: 400 });
    }
  };

  return (
    <div className="bg-background/90 border border-border rounded-lg shadow-lg overflow-hidden">
      <Button
        size="icon"
        className="w-8 h-8 bg-background text-foreground hover:bg-accent hover:shadow-lg hover:scale-105 border-0 rounded-none transition-all duration-200"
        variant="ghost"
        onClick={() => handleZoom(1)}
      >
        <Plus className="h-4 w-4" />
      </Button>

      <div className="h-px bg-border" />

      <Button
        size="icon"
        className="w-8 h-8 bg-background text-foreground hover:bg-accent hover:shadow-md border-0 rounded-none transition-all duration-200"
        variant="ghost"
        onClick={() => handleZoom(-1)}
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );
}

