import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react"
import type { DriverScheduleStatistics } from "../types/driverScheduleTypes"

interface StatisticsCardsProps {
  statistics: DriverScheduleStatistics
}

export function StatisticsCards({ statistics }: StatisticsCardsProps) {
  const cards = [
    {
      title: "Total Horarios",
      value: statistics.totalSchedules,
      description: "Registrados",
      icon: Calendar,
      iconColor: "text-success"
    },
    {
      title: "Horarios Activos",
      value: statistics.activeSchedules,
      description: "En servicio",
      icon: CheckCircle,
      iconColor: "text-success"
    },
    {
      title: "Horarios Inactivos",
      value: statistics.inactiveSchedules,
      description: "Fuera de servicio",
      icon: XCircle,
      iconColor: "text-destructive"
    },
    {
      title: "Días Laborales",
      value: Object.keys(statistics.schedulesByDay).length,
      description: "Días asignados",
      icon: Clock,
      iconColor: "text-primary"
    }
  ]

  return (
    <div className="grid gap-6 md:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="bg-card border-border hover:bg-accent transition-all duration-300 hover:scale-105"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.iconColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}