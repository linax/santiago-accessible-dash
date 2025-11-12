import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Veredas en mal estado", value: 78 },
  { name: "Falta de rampas", value: 72 },
  { name: "Obstáculos en vía pública", value: 68 },
  { name: "Ausencia de señalización táctil", value: 59 },
  { name: "Semáforos sin señal sonora", value: 54 },
];

export const BarriersChart = () => {
  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical" margin={{ left: 180 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis type="category" dataKey="name" width={180} />
            <Tooltip 
              formatter={(value) => `${value}%`}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
