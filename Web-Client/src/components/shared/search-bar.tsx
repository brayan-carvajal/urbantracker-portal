import { Search } from "lucide-react"
import { Input } from "components/ui/input"

export function SearchBar() {
  return (
  <div className="w-full flex px-2 bg-transparent">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Buscar..."
          className="pl-10 border-border text-foreground placeholder-muted-foreground rounded-full focus:bg-transparent focus:ring-1 focus:ring-border focus:border-border w-full bg-transparent transition-colors duration-200 hover:border-border hover:ring-0"
        />
      </div>
    </div>
  )
}
