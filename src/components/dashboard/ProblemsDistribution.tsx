import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { LabelData } from "@/lib/types";

interface ProblemsDistributionProps {
  labels: LabelData[];
  loading: boolean;
}

const COLORS = {
  CurbRamp: "#10B981",
  Obstacle: "#F97316",
  SurfaceProblem: "#3B82F6",
  NoCrosswalk: "#EAB308",
  NoCurbRamp: "#EF4444",
  Crosswalk: "#EAB308",
};

export const ProblemsDistribution = ({ labels, loading }: ProblemsDistributionProps) => {
  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Distribución de Problemas</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const distribution = labels.reduce((acc, label) => {
    acc[label.label_type] = (acc[label.label_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const labelTypeMapping: Record<string, string> = {
    "CurbRamp": "Rampas",
    "Obstacle": "Obstáculos",
    "NoCurbRamp": "SinRampa",
    "SurfaceProblem": "Superficie",
    "NoCrosswalk": "Cruces",
    "Crosswalk": "Cruces"
 
  };

  const data = Object.entries(distribution)
    .filter(([name]) => name in labelTypeMapping)
    .map(([name, value]) => ({
      name: labelTypeMapping[name],
      value,
      originalName: name,
    }));

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Distribución de Problemas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.originalName as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
