import { Plus, Minus, Navigation, Moon, Sun } from "lucide-react"


import { Button } from "components/ui/button"
import { useMapboxRef } from "./map-view"
import { useTheme } from "@/hooks/useTheme"

export function MapControls() {
  const mapRef = useMapboxRef();
  const { theme, setTheme } = useTheme();

  const handleZoom = (delta: number) => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.zoomTo(currentZoom + delta, { duration: 400 });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="absolute bottom-6 right-6 flex flex-col space-y-2 z-20">
      <Button
        size="icon"
        className="w-8 h-8 bg-background/90 border-2 border-border rounded-lg shadow-lg hover:bg-accent"
        variant="ghost"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4 text-foreground" />
        ) : (
          <Moon className="h-4 w-4 text-foreground" />
        )}
      </Button>

      <div className="bg-background/90 border border-border rounded-lg shadow-lg overflow-hidden">
        <Button
          size="icon"
          className="w-8 h-8 bg-background text-foreground hover:bg-accent border-0 rounded-none"
          variant="ghost"
          onClick={() => handleZoom(1)}
        >
          <Plus className="h-4 w-4" />
        </Button>

        <div className="h-px bg-border" />

        <Button
          size="icon"
          className="w-8 h-8 bg-background text-foreground hover:bg-accent border-0 rounded-none"
          variant="ghost"
          onClick={() => handleZoom(-1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

    </div>
  );
}

