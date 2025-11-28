import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

interface RouteScheduleFiltersProps {
  searchTerm: string
  dayFilter: string
  routeFilter: string
  statusFilter: string
  onSearchChange: (searchTerm: string) => void
  onDayFilterChange: (filter: string) => void
  onRouteFilterChange: (filter: string) => void
  onStatusFilterChange: (filter: string) => void
}

export function RouteScheduleFilters({
  searchTerm,
  dayFilter,
  routeFilter,
  statusFilter,
  onSearchChange,
  onDayFilterChange,
  onRouteFilterChange,
  onStatusFilterChange
}: RouteScheduleFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por día, hora..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card border-border text-card-foreground placeholder-muted-foreground"
        />
      </div>

      <Select value={dayFilter} onValueChange={onDayFilterChange}>
        <SelectTrigger className="w-48 bg-card border-border text-card-foreground">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Todos los días" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all">Todos los días</SelectItem>
          <SelectItem value="MONDAY">Lunes</SelectItem>
          <SelectItem value="TUESDAY">Martes</SelectItem>
          <SelectItem value="WEDNESDAY">Miércoles</SelectItem>
          <SelectItem value="THURSDAY">Jueves</SelectItem>
          <SelectItem value="FRIDAY">Viernes</SelectItem>
          <SelectItem value="SATURDAY">Sábado</SelectItem>
          <SelectItem value="SUNDAY">Domingo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}