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
  { id: "NoCurbRamp", label: "Falta rebaje de vereda", color: "#EF4444" }, // Rojo
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
    const map = L.map(mapRef.current).setView([-33.4411, -70.65343], 15);
    
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

  // Constantes y helpers
  const allTypeIds = problemTypes.map(t => t.id);
  const allTypesSelected = filters.types.length === 0;
  const noTypesSelected = filters.types.length === allTypeIds.length && 
    allTypeIds.every(id => filters.types.includes(id));

  // Helper: verificar si todos los items de un array están seleccionados
  const areAllItemsSelected = (selectedItems: string[], allItems: string[]): boolean => {
    return selectedItems.length === 0 || 
           (selectedItems.length === allItems.length && allItems.every(item => selectedItems.includes(item)));
  };

  // Helper: toggle genérico para arrays de selección
  const toggleItem = (
    item: string,
    selectedItems: string[],
    allItems: string[]
  ): string[] => {
    const allSelected = areAllItemsSelected(selectedItems, allItems);
    
    if (allSelected) {
      // Todos seleccionados: deseleccionar todos excepto el clickeado
      return allItems.filter(t => t !== item);
    } else {
      // Toggle normal
      const newItems = selectedItems.includes(item)
        ? selectedItems.filter(t => t !== item)
        : [...selectedItems, item];
      
      // Si todos quedan seleccionados, retornar array vacío
      return areAllItemsSelected(newItems, allItems) ? [] : newItems;
    }
  };

  // Seleccionar/deseleccionar todos los tipos
  const toggleAllTypes = () => {
    if (allTypesSelected) {
      // Deseleccionar todos: poner todos los tipos en el array y limpiar tags
      onFilterChange({ 
        ...filters, 
        types: allTypeIds,
        obstacleTags: [],
        surfaceProblemTags: []
      });
    } else {
      // Seleccionar todos: array vacío y seleccionar todos los tags
      onFilterChange({ 
        ...filters, 
        types: [],
        obstacleTags: [],
        surfaceProblemTags: []
      });
    }
  };

  // Toggle de un tipo individual
  const toggleType = (typeId: string) => {
    let newTypes: string[];
    
    if (allTypesSelected) {
      // Todos seleccionados: deseleccionar todos excepto el clickeado
      newTypes = allTypeIds.filter(id => id !== typeId);
    } else if (noTypesSelected) {
      // Ninguno seleccionado: seleccionar solo el clickeado
      newTypes = [typeId];
    } else {
      // Toggle normal
      newTypes = toggleItem(typeId, filters.types, allTypeIds);
    }
    
    // Limpiar tags si se deselecciona el tipo correspondiente
    const isObstacleSelected = newTypes.length === 0 || newTypes.includes("Obstacle");
    const isSurfaceProblemSelected = newTypes.length === 0 || newTypes.includes("SurfaceProblem");
    
    onFilterChange({ 
      ...filters, 
      types: newTypes,
      obstacleTags: isObstacleSelected ? filters.obstacleTags : [],
      surfaceProblemTags: isSurfaceProblemSelected ? filters.surfaceProblemTags : []
    });
  };

  // Toggle de tags de obstáculos
  const toggleObstacleTag = (tag: string) => {
    const currentTags = filters.obstacleTags || [];
    const newTags = toggleItem(tag, currentTags, obstacleTags);
    onFilterChange({ ...filters, obstacleTags: newTags });
  };

  // Toggle de tags de problemas de superficie
  const toggleSurfaceProblemTag = (tag: string) => {
    const currentTags = filters.surfaceProblemTags || [];
    const newTags = toggleItem(tag, currentTags, surfaceProblemTags);
    onFilterChange({ ...filters, surfaceProblemTags: newTags });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Filtrar por tipo de atributo</CardTitle>
        <div className="flex flex-wrap gap-4 mt-4">
          {/* Checkbox "Seleccionar todo" con distintivo */}
          <div className="flex items-center space-x-2 border-r pr-4 mr-2">
            <Checkbox
              id="select-all"
              checked={allTypesSelected}
              onCheckedChange={toggleAllTypes}
              className="border-2 border-primary"
            />
            <Label htmlFor="select-all" className="flex items-center gap-2 cursor-pointer font-semibold text-primary">
              Seleccionar todo
            </Label>
          </div>
          
          {/* Checkboxes individuales */}
          {problemTypes.map((type) => {
            // Un tipo está seleccionado si: todos están seleccionados (length === 0) 
            // O si el tipo específico está en el array (pero no todos están en el array)
            const isTypeSelected = allTypesSelected || 
              (filters.types.includes(type.id) && !noTypesSelected);
            
            return (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={isTypeSelected}
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
            );
          })}
        </div>
        
        {/* Subcategorías de tags para Obstáculos en acordeón */}
        {/* Solo mostrar si Obstacle está seleccionado, hay tags disponibles, y no todos están deseleccionados */}
        {isObstacleSelected && obstacleTags.length > 0 && !noTypesSelected && (
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
                    {obstacleTags.map((tag) => {
                      const currentTags = filters.obstacleTags || [];
                      const allSelected = areAllItemsSelected(currentTags, obstacleTags);
                      const isTagSelected = allSelected || currentTags.includes(tag);
                      
                      return (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`obstacle-tag-${tag}`}
                            checked={isTagSelected}
                            onCheckedChange={() => toggleObstacleTag(tag)}
                          />
                          <Label 
                            htmlFor={`obstacle-tag-${tag}`} 
                            className="text-sm cursor-pointer"
                          >
                            {translateObstacleTag(tag)}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* Subcategorías de tags para Problemas de Superficie en acordeón */}
        {/* Solo mostrar si SurfaceProblem está seleccionado, hay tags disponibles, y no todos están deseleccionados */}
        {isSurfaceProblemSelected && surfaceProblemTags.length > 0 && !noTypesSelected && (
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
                    {surfaceProblemTags.map((tag) => {
                      const currentTags = filters.surfaceProblemTags || [];
                      const allSelected = areAllItemsSelected(currentTags, surfaceProblemTags);
                      const isTagSelected = allSelected || currentTags.includes(tag);
                      
                      return (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`surface-tag-${tag}`}
                            checked={isTagSelected}
                            onCheckedChange={() => toggleSurfaceProblemTag(tag)}
                          />
                          <Label 
                            htmlFor={`surface-tag-${tag}`} 
                            className="text-sm cursor-pointer"
                          >
                            {translateSurfaceProblemTag(tag)}
                          </Label>
                        </div>
                      );
                    })}
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
