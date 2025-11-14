import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LabelData } from "@/lib/types";

interface SeverityChartProps {
  labels: LabelData[];
  loading: boolean;
}

const SEVERITY_COLORS = ["#10B981", "#84CC16", "#EAB308", "#F59E0B", "#EF4444"];

export const SeverityChart = ({ labels, loading }: SeverityChartProps) => {
  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Severidad de Problemas</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const severityCount = labels.reduce((acc, label) => {
    acc[label.severity] = (acc[label.severity] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const data = [
    { name: "Bajo", severity: 1, count: severityCount[1] || 0 },
    { name: "Moderado", severity: 2, count: severityCount[2] || 0 },
    { name: "Alto", severity: 3, count: severityCount[3] || 0 },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Severidad de Problemas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.severity - 1]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
