import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Route } from "lucide-react"

import type { RouteStatistics } from "../types/routeTypes";

interface StatisticsCardsProps {
  statistics: RouteStatistics;
}

export function StatisticsCards({ statistics }: StatisticsCardsProps) {
  const cards = [
    {
      title: "Total Rutas",
      value: statistics.totalRoutes,
      description: "En el sistema",
      icon: Route,
      iconColor: "text-success"
    },
    {
      title: "Rutas Activas",
      value: statistics.activeRoutes,
      description: "En operación",
      icon: Route,
      iconColor: "text-success"
    },
    {
      title: "Nuevas este mes",
      value: statistics.newThisMonth,
      description: "Agregadas recientemente",
      icon: Route,
      iconColor: "text-primary"
    },
    {
      title: "Rutas Inactivas",
      value: statistics.inactiveRoutes,
      description: "Fuera de servicio",
      icon: Route,
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