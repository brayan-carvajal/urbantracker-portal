<<<<<<< HEAD
import { Plus, Minus, Navigation } from "lucide-react"
=======
import { Plus, Minus } from "lucide-react"
>>>>>>> 3875d8517a1b40b03f0b5291e2efa1301caa1e0e

import { Button } from "components/ui/button"
import { useMapboxRef, useUserLocation } from "./map-view"

export function MapControls() {
  const mapRef = useMapboxRef();
  const userLocation = useUserLocation();

  const handleZoom = (delta: number) => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.zoomTo(currentZoom + delta, { duration: 400 });
    }
  };

  const handleCenterOnLocation = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo({
        center: userLocation,
        zoom: 16,
        duration: 1000,
      });
    }
  };

  return (
<<<<<<< HEAD
    <div className="bg-background/90 border border-border rounded-lg shadow-lg overflow-hidden flex flex-col space-y-1 p-1 ">
=======
    <div className="bg-background/90 border border-border rounded-lg shadow-lg overflow-hidden">
>>>>>>> 3875d8517a1b40b03f0b5291e2efa1301caa1e0e
      <Button
        size="icon"
        className="w-8 h-8 bg-background text-foreground hover:bg-accent hover:shadow-lg hover:scale-105 border-0 rounded-none transition-all duration-200"
        variant="ghost"
        onClick={() => handleZoom(1)}
      >
        <Plus className="h-4 w-4" />
      </Button>
<<<<<<< HEAD
=======

      <div className="h-px bg-border" />

>>>>>>> 3875d8517a1b40b03f0b5291e2efa1301caa1e0e
      <Button
        size="icon"
        className="w-8 h-8 bg-background text-foreground hover:bg-accent hover:shadow-md border-0 rounded-none transition-all duration-200"
        variant="ghost"
        onClick={() => handleZoom(-1)}
      >
        <Minus className="h-4 w-4" />
      </Button>
<<<<<<< HEAD
      
      <Button
        size="icon"
        className="w-8 h-8 bg-background text-foreground hover:bg-accent hover:shadow-md border-0 rounded-none transition-all duration-200"
        variant="ghost"
        onClick={handleCenterOnLocation}
        disabled={!userLocation}
        title="Centrar en mi ubicación"
      >
        <Navigation className="h-4 w-4" />
      </Button>
=======
>>>>>>> 3875d8517a1b40b03f0b5291e2efa1301caa1e0e
    </div>
  );
}

