import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

interface CompanyFiltersProps {
  searchTerm: string
  statusFilter: string
  onSearchChange: (searchTerm: string) => void
  onStatusFilterChange: (filter: string) => void
}

export function CompanyFilters({ 
  searchTerm, 
  statusFilter, 
  onSearchChange, 
  onStatusFilterChange 
}: CompanyFiltersProps) {
  return (
    <div className="flex gap-4 items-center">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nombre, NIT o teléfono..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-48 bg-input border-border text-foreground">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all" className="text-popover-foreground hover:bg-accent focus:bg-accent">Todos los estados</SelectItem>
          <SelectItem value="Activo" className="text-popover-foreground hover:bg-accent focus:bg-accent">Activo</SelectItem>
          <SelectItem value="Inactivo" className="text-popover-foreground hover:bg-accent focus:bg-accent">Inactivo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}