import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car } from "lucide-react"

import type { VehicleAssigmentsStatistics } from "../types/VehicleAssigmentsType";

interface StatisticsCardsProps {
  statistics: VehicleAssigmentsStatistics;
}

export function StatisticsCards({ statistics }: StatisticsCardsProps) {
  const cards = [
    {
      title: "Total de Asignaciones",
      value: statistics.totalVehicles,
      description: "En la plataforma",
      icon: Car,
      iconColor: "text-success"
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 max-w-sm mx-auto">
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