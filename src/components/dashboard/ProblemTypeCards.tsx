import { AlertTriangle, Construction, Footprints, Navigation, HelpCircle, TriangleRight, LandPlot, Cross } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LabelData } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

interface ProblemTypeCardsProps {
  labels: LabelData[];
  loading: boolean;
}

const problemConfig = [
  { type: "Obstacle", label: "Obstáculos en la vereda", icon: Construction, color: "text-warning" },
  { type: "SurfaceProblem", label: "Problema de superficie", icon: LandPlot, color: "text-warning" },
  { type: "NoCurbRamp", label: "Falta de rebajes de vereda", icon: AlertTriangle, color: "text-danger" },
];

export const  ProblemTypeCards = ({ labels, loading }: ProblemTypeCardsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-12 w-12 mb-4" />
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = problemConfig.map((config) => {
    const typeLabels = labels.filter((l) => l.label_type === config.type);
    const avgSeverity = typeLabels.length > 0
      ? typeLabels.reduce((sum, l) => sum + l.severity, 0) / typeLabels.length
      : 0;
    
    const severityDist = [1, 2, 3].map((sev) => ({
      severity: sev,
      count: typeLabels.filter((l) => l.severity === sev).length,
    }));

    return {
      ...config,
      count: typeLabels.length,
      avgSeverity: avgSeverity.toFixed(1),
      distribution: severityDist,
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <Card key={stat.type} className="shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <stat.icon className={`h-12 w-12 ${stat.color}`} />
            </div>
            
            <div className="text-4xl font-bold mb-2 text-foreground">
              {stat.count}
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {stat.label}
            </p>
            
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">
                Severidad promedio: {stat.avgSeverity} / 5.0
              </p>
              <Progress 
                value={parseFloat(stat.avgSeverity) * 20} 
                className="h-2"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Distribución</p>
              <div className="flex gap-1">
                {stat.distribution.map((d) => (
                  <div
                    key={d.severity}
                    className="flex-1 bg-muted rounded"
                    style={{ 
                      height: `${Math.max(d.count / stat.count * 60, 4)}px`,
                      opacity: 0.5 + (d.severity / 10)
                    }}
                    title={`Severidad ${d.severity}: ${d.count}`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
