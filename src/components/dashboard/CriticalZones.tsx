import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, AlertCircle } from "lucide-react";
import { LabelData, GeographicZone } from "@/lib/types";

interface CriticalZonesProps {
  labels: LabelData[];
  loading: boolean;
}

export const CriticalZones = ({ labels, loading }: CriticalZonesProps) => {
  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Top 5 Zonas con Más Problemas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Define geographic grid (3x3)
  const centerLat = -33.4489;
  const centerLng = -70.6693;
  const gridSize = 0.015;

  const zones: GeographicZone[] = [];
  
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const bounds = {
        north: centerLat + (i + 1) * gridSize,
        south: centerLat + i * gridSize,
        east: centerLng + (j + 1) * gridSize,
        west: centerLng + j * gridSize,
      };

      const zoneLabels = labels.filter(
        (l) =>
          l.lat >= bounds.south &&
          l.lat < bounds.north &&
          l.lng >= bounds.west &&
          l.lng < bounds.east
      );

      if (zoneLabels.length > 0) {
        const avgSeverity =
          zoneLabels.reduce((sum, l) => sum + l.severity, 0) / zoneLabels.length;

        const zoneName = `Sector ${String.fromCharCode(65 + (i + 1))}${j + 2}`;
        
        zones.push({
          name: zoneName,
          bounds,
          count: zoneLabels.length,
          avgSeverity,
        });
      }
    }
  }

  const topZones = zones
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Top 5 Zonas con Más Problemas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topZones.map((zone, index) => (
            <div
              key={zone.name}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{zone.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {zone.count} problemas identificados
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                <span className="font-medium">
                  {zone.avgSeverity.toFixed(1)} / 5.0
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
