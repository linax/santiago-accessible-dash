import { useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { LabelData, ProblemFilter } from "@/lib/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface InteractiveMapProps {
  labels: LabelData[];
  allLabels?: LabelData[]; // Labels sin filtrar para calcular tags únicos
  loading: boolean;
  filters: ProblemFilter;
  onFilterChange: (filters: ProblemFilter) => void;
}

const problemTypes = [
  { id: "CurbRamp", label: "Rampas", color: "#22C55E" }, // Verde
  { id: "Obstacle", label: "Obstáculos", color: "#F97316" }, // Naranjo
  { id: "SurfaceProblem", label: "Superficie", color: "#3B82F6" }, // Azul
  { id: "Crosswalk", label: "Cruces", color: "#EAB308" }, // Amarillo
  { id: "NoCurbRamp", label: "SinRampa", color: "#EF4444" }, // Rojo
];

// Diccionario de traducciones para tags de obstáculos
const obstacleTagTranslations: Record<string, string> = {
  "construction": "construcción",
  "litter/garbage": "basura en la vereda",
  "litter/gardbage": "basura en la vereda", // Manejo de typo en el tag original
  "narrow": "vereda angosta",
  "parked bike": "bicicleta estacionada",
  "parked car": "auto estacionado",
  "pole": "poste",
  "sign": "letrero o señalética",
  "tree": "árbol",
};

// Diccionario de traducciones para tags de problemas de superficie
const surfaceProblemTagTranslations: Record<string, string> = {
  "brick/cobberstone": "adoquines",
  "brick/cobblestone": "adoquines", // Manejo de variación de escritura
  "bumpy": "disparejo",
  "cracks": "grietas",
  "height difference": "desnivel",
  "narrow sidewalk": "vereda angosta",
  "uneven/slanted": "inclinación",
  "utility panel": "tapa o cámara de servicio",
  "very broken": "muy rota",
};

// Función helper para traducir tags de obstáculos
const translateObstacleTag = (tag: string): string => {
  return obstacleTagTranslations[tag.toLowerCase()] || tag;
};

// Función helper para traducir tags de problemas de superficie
const translateSurfaceProblemTag = (tag: string): string => {
  return surfaceProblemTagTranslations[tag.toLowerCase()] || tag;
};

// Función genérica para traducir tags según el tipo de label
const translateTag = (tag: string, labelType: string): string => {
  if (labelType === "Obstacle") {
    return translateObstacleTag(tag);
  } else if (labelType === "SurfaceProblem") {
    return translateSurfaceProblemTag(tag);
  }
  return tag;
};

export const InteractiveMap = ({ labels, allLabels, loading, filters, onFilterChange }: InteractiveMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Obtener todos los tags únicos de los obstáculos (usar allLabels si está disponible, sino labels)
  const obstacleTags = useMemo(() => {
    const labelsToUse = allLabels || labels;
    const tagsSet = new Set<string>();
    labelsToUse
      .filter((label) => label.label_type === "Obstacle" && label.tags)
      .forEach((label) => {
        label.tags?.forEach((tag) => {
          if (tag && tag.trim()) {
            tagsSet.add(tag.trim());
          }
        });
      });
    return Array.from(tagsSet).sort();
  }, [allLabels, labels]);

  // Obtener todos los tags únicos de problemas de superficie
  const surfaceProblemTags = useMemo(() => {
    const labelsToUse = allLabels || labels;
    const tagsSet = new Set<string>();
    labelsToUse
      .filter((label) => label.label_type === "SurfaceProblem" && label.tags)
      .forEach((label) => {
        label.tags?.forEach((tag) => {
          if (tag && tag.trim()) {
            tagsSet.add(tag.trim());
          }
        });
      });
    return Array.from(tagsSet).sort();
  }, [allLabels, labels]);

  const isObstacleSelected = filters.types.length === 0 || filters.types.includes("Obstacle");
  const isSurfaceProblemSelected = filters.types.length === 0 || filters.types.includes("SurfaceProblem");

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
        radius: 8,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      });

      const stars = "★".repeat(label.severity) + "☆".repeat(3 - label.severity);
      const tagsDisplay = label.tags && label.tags.length > 0 
        ? `<p class="text-xs text-gray-500 mt-1">Tags: ${label.tags.map(tag => translateTag(tag, label.label_type)).join(", ")}</p>` 
        : '';

      
      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold mb-1">${typeConfig?.label || label.label_type}</h3>
          <p class="text-sm mb-1">Severidad: ${stars}</p>
          <p class="text-xs text-gray-600">
            ${label.lat.toFixed(4)}, ${label.lng.toFixed(4)}
          </p>
          ${label.timestamp ? `<p class="text-xs text-gray-500 mt-1">${new Date(label.timestamp).toLocaleDateString()}</p>` : ''}
          ${tagsDisplay}
        </div>
      `);

      markersRef.current!.addLayer(marker);
    });
  }, [labels, loading]);

  const toggleType = (typeId: string) => {
    const newTypes = filters.types.includes(typeId)
      ? filters.types.filter((t) => t !== typeId)
      : [...filters.types, typeId];
    
    // Si se deselecciona Obstacle, limpiar los tags seleccionados
    const newObstacleTags = typeId === "Obstacle" && newTypes.includes("Obstacle")
      ? filters.obstacleTags
      : typeId === "Obstacle" && !newTypes.includes("Obstacle")
      ? []
      : filters.obstacleTags;
    
    // Si se deselecciona SurfaceProblem, limpiar los tags seleccionados
    const newSurfaceProblemTags = typeId === "SurfaceProblem" && newTypes.includes("SurfaceProblem")
      ? filters.surfaceProblemTags
      : typeId === "SurfaceProblem" && !newTypes.includes("SurfaceProblem")
      ? []
      : filters.surfaceProblemTags;
    
    onFilterChange({ ...filters, types: newTypes, obstacleTags: newObstacleTags, surfaceProblemTags: newSurfaceProblemTags });
  };

  const toggleObstacleTag = (tag: string) => {
    const currentTags = filters.obstacleTags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    
    onFilterChange({ ...filters, obstacleTags: newTags });
  };

  const toggleSurfaceProblemTag = (tag: string) => {
    const currentTags = filters.surfaceProblemTags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    
    onFilterChange({ ...filters, surfaceProblemTags: newTags });
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
        
        {/* Subcategorías de tags para Obstáculos en acordeón */}
        {isObstacleSelected && obstacleTags.length > 0 && (
          <div className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="obstacle-tags" className="border-none">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-2">
                  <div className="flex items-center gap-2">
                    <span>Filtrar por Tipos de Obstáculos</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {obstacleTags.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-3 pt-2">
                    {obstacleTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`obstacle-tag-${tag}`}
                          checked={(filters.obstacleTags || []).length === 0 || (filters.obstacleTags || []).includes(tag)}
                          onCheckedChange={() => toggleObstacleTag(tag)}
                        />
                        <Label 
                          htmlFor={`obstacle-tag-${tag}`} 
                          className="text-sm cursor-pointer"
                        >
                          {translateObstacleTag(tag)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* Subcategorías de tags para Problemas de Superficie en acordeón */}
        {isSurfaceProblemSelected && surfaceProblemTags.length > 0 && (
          <div className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="surface-problem-tags" className="border-none">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-2">
                  <div className="flex items-center gap-2">
                    <span>Filtrar por Problemas de Superficie</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {surfaceProblemTags.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-3 pt-2">
                    {surfaceProblemTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`surface-tag-${tag}`}
                          checked={(filters.surfaceProblemTags || []).length === 0 || (filters.surfaceProblemTags || []).includes(tag)}
                          onCheckedChange={() => toggleSurfaceProblemTag(tag)}
                        />
                        <Label 
                          htmlFor={`surface-tag-${tag}`} 
                          className="text-sm cursor-pointer"
                        >
                          {translateSurfaceProblemTag(tag)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
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
