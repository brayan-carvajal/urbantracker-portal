import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface DriverScheduleHeaderProps {
  onCreateSchedule: () => void
}

export function DriverScheduleHeader({ onCreateSchedule }: DriverScheduleHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Horarios de Conductores
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona los horarios de trabajo de tus conductores
        </p>
      </div>
      <Button
        onClick={onCreateSchedule}
        className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105"
      >
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Horario
      </Button>
    </header>
  )
}