import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabelData } from "@/lib/types";
import { problemTypes, translateTag } from "@/lib/constants/problemTypes";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface InteractiveMapProps {
  labels: LabelData[];
  loading: boolean;
}

export const InteractiveMap = ({ labels, loading }: InteractiveMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([-33.4411, -70.65343], 15);
    
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Data: <a href="https://sidewalk-santiago.cs.washington.edu/" target="_blank">Project Sidewalk API</a>',
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
        radius: 7,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      });

      // Mostrar iconos de warning según la severidad
      const warningIcons = "⚠️".repeat(label.severity);
      
      // Solo mostrar tags para Obstáculos y Problemas de Superficie
      const shouldShowTags = label.label_type === "Obstacle" || label.label_type === "SurfaceProblem";
      const tagsDisplay = shouldShowTags && label.tags && label.tags.length > 0 
        ? `<p class="text-xs text-gray-500 mt-1">Tags: ${label.tags.map(tag => translateTag(tag, label.label_type)).join(", ")}</p>` 
        : '';
      
      // Link a imagen de evaluación si hay gsv_panorama_id
      const imageLink = label.gsv_panorama_id 
        ? `<p class="text-xs mt-2"><a href="https://www.google.com/maps/@?api=1&map_action=pano&pano=${label.gsv_panorama_id}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">Imagen de evaluación</a></p>`
        : '';

      
      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold mb-1">${typeConfig?.label || label.label_type}</h3>
          <p class="text-sm mb-1">Severidad: ${warningIcons}</p>
          <p class="text-xs text-gray-600">
            Coordenadas: ${label.lat.toFixed(4)}, ${label.lng.toFixed(4)}
          </p>
          ${label.timestamp ? `<p class="text-xs text-gray-500 mt-1">Fecha de evaluación: ${new Date(label.timestamp).toLocaleDateString()}</p>` : ''}
          ${tagsDisplay}
          ${imageLink}
        </div>
      `);

      markersRef.current!.addLayer(marker);
    });
  }, [labels, loading]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Mapa Interactivo</CardTitle>
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
