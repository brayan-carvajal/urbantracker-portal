import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car } from "lucide-react"

import type { VehiculeStatistics } from "../types/vehiculeTypes";

interface StatisticsCardsProps {
  statistics: VehiculeStatistics;
}

export function StatisticsCards({ statistics }: StatisticsCardsProps) {
  const cards = [
    {
      title: "Total Vehículos",
      value: statistics.totalVehicules,
      description: "En la flota",
      icon: Car,
      iconColor: "text-success"
    },
    {
      title: "Vehículos Activos",
      value: statistics.activeVehicules,
      description: "En operación",
      icon: Car,
      iconColor: "text-success"
    },
    {
      title: "Vehículos Inactivos",
      value: statistics.inactiveVehicules,
      description: "Fuera de servicio",
      icon: Car,
      iconColor: "text-destructive"
    }
  ];

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
  );
}