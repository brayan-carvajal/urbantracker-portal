import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface VehicleTypeFiltersProps {
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
}

const VehicleTypeFilters: React.FC<VehicleTypeFiltersProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="flex gap-4 items-center">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-input border-border text-foreground placeholder-muted-foreground"
        />
      </div>
    </div>
  );
};

export default VehicleTypeFilters;
