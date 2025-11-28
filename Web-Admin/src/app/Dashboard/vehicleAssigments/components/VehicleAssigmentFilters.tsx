import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

interface VehicleAssigmentFiltersProps {
  searchTerm: string
  statusFilter: string
  onSearchChange: (searchTerm: string) => void
  onStatusFilterChange: (filter: string) => void
}

export function VehicleAssigmentFilters({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange
}: VehicleAssigmentFiltersProps) {
  return (
    <div className="flex gap-4 items-center">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por placa del vehículo..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card border-border text-card-foreground placeholder-muted-foreground"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-48 bg-card border-border text-card-foreground">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all" className="text-popover-foreground hover:bg-accent focus:bg-accent">Todos los estados</SelectItem>
          <SelectItem value="ACTIVE" className="text-popover-foreground hover:bg-accent focus:bg-accent">Activo</SelectItem>
          <SelectItem value="INACTIVE" className="text-popover-foreground hover:bg-accent focus:bg-accent">Inactivo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}