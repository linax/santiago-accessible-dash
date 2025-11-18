import { Map, Search, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LabelData } from "@/lib/types";

interface ApiKPIsProps {
  labels: LabelData[];
  loading: boolean;
  kmExplored: number | null;
}

const TOTAL_STREETS = 42; // Valor constante compartido

export const ApiKPIs = ({ labels, loading, kmExplored }: ApiKPIsProps) => {
  const totalProblems = labels.length;
  const streetsAudited = kmExplored ?? 5.4; // Usar valor dinámico o fallback
  const coverage = Math.round((streetsAudited / TOTAL_STREETS) * 100);

  const kpis = [
    {
      icon: Map,
      value: `${TOTAL_STREETS} km`,
      label: "Área objetivo a mapear",
      color: "text-primary",
    },
    {
      icon: Search,
      value: `${Math.trunc(streetsAudited)} km`,
      label: "Mapeados",
      color: "text-success",
    },
    {
      icon: AlertTriangle,
      value: totalProblems,
      label: "Problemas identificados",
      color: "text-warning",
    },
    {
      icon: CheckCircle,
      value: `${coverage}%`,
      label: "Cobertura de mapeos",
      color: "text-success",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-10 w-10 mb-4" />
              <Skeleton className="h-10 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <kpi.icon className={`h-12 w-12 ${kpi.color}`} />
            </div>
            <div className="text-5xl font-bold mb-2 text-foreground">
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
