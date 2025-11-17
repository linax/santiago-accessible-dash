import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LabelData, ProblemFilter } from "@/lib/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface InteractiveMapProps {
  labels: LabelData[];
  loading: boolean;
  filters: ProblemFilter;
  onFilterChange: (filters: ProblemFilter) => void;
}

const problemTypes = [
  { id: "CurbRamp", label: "Rampas", color: "#EF4444" },
  { id: "Obstacle", label: "Obstáculos", color: "#F59E0B" },
  { id: "SurfaceProblem", label: "Superficie", color: "#EAB308" },
  { id: "Crosswalk", label: "Cruces", color: "#3B82F6" },
  { id: "NoCurbRamp", label: "SinRampa", color: "#6B7280" },
];

export const InteractiveMap = ({ labels, loading, filters, onFilterChange }: InteractiveMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([-33.4489, -70.6693], 13);
    
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstanceRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current || loading) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add markers for each label
    labels.forEach((label) => {
      const typeConfig = problemTypes.find((t) => t.id === label.label_type);
      const color = typeConfig?.color || "#6B7280";

      const marker = L.circleMarker([label.lat, label.lng], {
        radius: 11,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      });

      const stars = "★".repeat(label.severity) + "☆".repeat(3 - label.severity);
      
      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold mb-1">${typeConfig?.label || label.label_type}</h3>
          <p class="text-sm mb-1">Severidad: ${stars}</p>
          <p class="text-xs text-gray-600">
            ${label.lat.toFixed(4)}, ${label.lng.toFixed(4)}
          </p>
          ${label.timestamp ? `<p class="text-xs text-gray-500 mt-1">${new Date(label.timestamp).toLocaleDateString()}</p>` : ''}
        </div>
      `);

      markersRef.current!.addLayer(marker);
    });
  }, [labels, loading]);

  const toggleType = (typeId: string) => {
    const newTypes = filters.types.includes(typeId)
      ? filters.types.filter((t) => t !== typeId)
      : [...filters.types, typeId];
    
    onFilterChange({ ...filters, types: newTypes });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Filtrar por tipo de problema</CardTitle>
        <div className="flex flex-wrap gap-4 mt-4">
          {problemTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                id={type.id}
                checked={filters.types.length === 0 || filters.types.includes(type.id)}
                onCheckedChange={() => toggleType(type.id)}
              />
              <Label htmlFor={type.id} className="flex items-center gap-2 cursor-pointer">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: type.color }}
                />
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={mapRef}
          className="w-full h-[500px] rounded-lg overflow-hidden"
          style={{ zIndex: 0 }}
        />
      </CardContent>
    </Card>
  );
};
