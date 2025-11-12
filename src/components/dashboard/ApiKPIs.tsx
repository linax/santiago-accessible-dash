import { Map, Search, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LabelData } from "@/lib/types";

interface ApiKPIsProps {
  labels: LabelData[];
  loading: boolean;
}

export const ApiKPIs = ({ labels, loading }: ApiKPIsProps) => {
  const totalProblems = labels.length;
  const streetsAudited = 120; // Static for now
  const totalStreets = 450; // Static for now
  const coverage = Math.round((streetsAudited / totalStreets) * 100);

  const kpis = [
    {
      icon: Map,
      value: `${totalStreets} km`,
      label: "Calles en Santiago",
      color: "text-primary",
    },
    {
      icon: Search,
      value: `${streetsAudited} km`,
      label: "Calles auditadas",
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
      label: "Cobertura de auditorías",
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
