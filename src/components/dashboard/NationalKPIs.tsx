import { Users, UserCheck, TrendingUp, Users2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const kpis = [
  {
    icon: Users,
    value: "2.6M",
    label: "Personas con discapacidad",
    color: "text-primary",
  },
  {
    icon: TrendingUp,
    value: "16.7%",
    label: "Porcentaje de la población",
    color: "text-primary",
  },
  {
    icon: UserCheck,
    value: "20%",
    label: "Reportan barreras de movilidad",
    color: "text-warning",
  },
  {
    icon: Users2,
    value: "2.8M",
    label: "Adultos mayores 65+",
    color: "text-primary",
  },
];

export const NationalKPIs = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <kpi.icon className={`h-10 w-10 ${kpi.color}`} />
            </div>
            <div className="text-4xl font-bold mb-2 text-foreground">
              {kpi.value}
            </div>
            <p className="text-sm text-muted-foreground">
              {kpi.label}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
