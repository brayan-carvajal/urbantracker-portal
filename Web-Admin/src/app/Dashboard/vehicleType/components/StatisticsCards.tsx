import { Card, CardContent } from "@/components/ui/card";
import type { VehicleTypesStatistics } from "../types/vehicleTypes";

interface StatisticsCardsProps {
  statistics: VehicleTypesStatistics;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ statistics }) => {
  const cards = [
    {
      title: "Total de Tipos de Vehículo",
      value: statistics.totalVehicles,
      description: "En la plataforma"
    },
    {
      title: "Nuevos este mes",
      value: statistics.newThisMonth,
      description: "Agregados recientemente",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="bg-card border-border hover:bg-card/80 transition-all duration-300 hover:scale-105"
        >
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default StatisticsCards;
