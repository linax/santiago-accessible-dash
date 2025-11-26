import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { LabelData } from "@/lib/types";

interface AuditCoverageProps {
  labels: LabelData[];
  loading: boolean;
  kmExplored: number | null;
}

const TOTAL_STREETS = 42; // Mismo valor que en ApiKPIs

export const AuditCoverage = ({ labels, loading, kmExplored }: AuditCoverageProps) => {
  const streetsAudited = kmExplored ?? 6; // Usar valor dinámico o fallback
  const percentage = Math.round((streetsAudited / TOTAL_STREETS) * 100);

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-6 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2 text-foreground">Cobertura de Auditorías</h3>
          <p className="text-muted-foreground">
            {Math.trunc(streetsAudited)} km auditados de {TOTAL_STREETS} km totales en la comuna
          </p>
        </div>
        
        <Progress value={percentage} className="h-4 mb-4" />
        
        <div className="text-5xl font-bold text-primary">
          {percentage}%
        </div>
      </CardContent>
    </Card>
  );
};
