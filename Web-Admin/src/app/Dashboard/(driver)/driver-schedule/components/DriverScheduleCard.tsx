import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Clock, Edit, Trash2 } from "lucide-react"
import type { DriverWithSchedules } from "../types/driverScheduleTypes"

interface DriverScheduleCardProps {
  driverWithSchedules: DriverWithSchedules
  onEdit: (driver: DriverWithSchedules) => void
  onDelete: (driver: DriverWithSchedules) => void
}

export function DriverScheduleCard({ driverWithSchedules, onEdit, onDelete }: DriverScheduleCardProps) {
  const { driver, schedules } = driverWithSchedules

  const getDayName = (dayOfWeek: string) => {
    const days = {
      'MONDAY': 'L',
      'TUESDAY': 'M',
      'WEDNESDAY': 'X',
      'THURSDAY': 'J',
      'FRIDAY': 'V',
      'SATURDAY': 'S',
      'SUNDAY': 'D'
    }
    return days[dayOfWeek.toUpperCase() as keyof typeof days] || dayOfWeek
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5) // HH:MM format
  }

  // Sort schedules by day of week
  const sortedSchedules = [...schedules].sort((a, b) => {
    const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
    return dayOrder.indexOf(a.dayOfWeek.toUpperCase()) - dayOrder.indexOf(b.dayOfWeek.toUpperCase())
  })

  return (
    <Card className="bg-card border-border hover:bg-accent transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6 flex-1">
            <div className="p-4 bg-primary/20 rounded-full">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-foreground">
                  {`${driver.firstName} ${driver.lastName}`}
                </h3>
                <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {schedules.length} horario{schedules.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Schedule Grid */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Horarios:</div>
                <div className="grid grid-cols-7 gap-2">
                  {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => {
                    const daySchedules = sortedSchedules.filter(s => s.dayOfWeek.toUpperCase() === day)
                    return (
                      <div key={day} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">{getDayName(day)}</div>
                        {daySchedules.length > 0 ? (
                          <div className="space-y-1">
                            {daySchedules.map(schedule => (
                              <div key={schedule.id} className={`p-2 rounded text-xs ${
                                schedule.active
                                  ? 'bg-success/20 text-success border border-success/30'
                                  : 'bg-destructive/20 text-destructive border border-destructive/30'
                              }`}>
                                <div className="font-medium">{formatTime(schedule.startTime)}</div>
                                <div className="text-muted-foreground">-</div>
                                <div className="font-medium">{formatTime(schedule.endTime)}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-2 rounded bg-muted/50 border border-border text-muted-foreground text-xs">
                            Sin horario
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(driverWithSchedules)}
              className="flex items-center gap-2 hover:bg-accent/10 hover:text-accent transition-all duration-200"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(driverWithSchedules)}
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}