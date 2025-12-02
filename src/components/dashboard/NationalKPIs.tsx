import { Users, UserCheck, TrendingUp, Users2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const kpis = [
  {
    icon: Users,
    value: "1.9M",
    label: "Personas con discapacidad",
    color: "text-primary",
  },
  {
    icon: TrendingUp,
    value: "11.1%",
    label: "Porcentaje de la población",
    color: "text-primary",
  },
  {
    icon: UserCheck,
    value: "+900.000",
    label: "Personas con dificultad para caminar o subir escaleras",
    color: "text-warning",
  },
  {
    icon: Users2,
    value: "18%",
    label: "Adultos mayores 65+",
    color: "text-primary",
  },
];

export const NationalKPIs = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index} className="shadow-lg hover:shadow-xl traynsition-shadow bg-green-light border-green-light">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <kpi.icon className="h-10 w-10 text-green-light-foreground" />
            </div>
            <div className="text-4xl font-bold mb-2 text-green-light-foreground">
              {kpi.value}
            </div>
            <p className="text-sm text-green-light-foreground/80">
              {kpi.label}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
