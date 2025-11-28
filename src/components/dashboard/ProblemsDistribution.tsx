import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { LabelData } from "@/lib/types";
import { problemTypes } from "@/lib/constants/problemTypes";

interface ProblemsDistributionProps {
  labels: LabelData[];
  loading: boolean;
}

// Helper para obtener el color basado en el tipo
const getColorForType = (type: string) => {
  // Mapeo especial para casos que podrían no estar exactamente en problemTypes
  if (type === "NoCrosswalk") return problemTypes.find(p => p.id === "Crosswalk")?.color || "#EAB308";
  
  const problem = problemTypes.find(p => p.id === type);
  return problem ? problem.color : "#8884d8";
};

export const ProblemsDistribution = ({ labels, loading }: ProblemsDistributionProps) => {
  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Distribución de Atributos</CardTitle>
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
        <CardTitle>Distribución de Atributos</CardTitle>
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
                <Cell key={`cell-${index}`} fill={getColorForType(entry.originalName)} />
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
