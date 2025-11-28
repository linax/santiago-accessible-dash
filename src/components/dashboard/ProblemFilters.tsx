import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { LabelData, ProblemFilter } from "@/lib/types";
import { 
  problemTypes, 
  translateObstacleTag, 
  translateSurfaceProblemTag,
  obstacleTagTranslations,
  surfaceProblemTagTranslations
} from "@/lib/constants/problemTypes";

const NONE_SELECTED = "__NONE__";

interface ProblemFiltersProps {
  labels: LabelData[];
  allLabels?: LabelData[]; // Labels sin filtrar para calcular tags únicos
  filters: ProblemFilter;
  onFilterChange: (filters: ProblemFilter) => void;
}

export const ProblemFilters = ({ labels, allLabels, filters, onFilterChange }: ProblemFiltersProps) => {
  // Obtener todos los tags únicos de los obstáculos (usar allLabels si está disponible, sino labels)
  const obstacleTags = useMemo(() => {
    const labelsToUse = allLabels || labels;
    const tagsSet = new Set<string>();
    labelsToUse
      .filter((label) => label.label_type === "Obstacle" && label.tags)
      .forEach((label) => {
        label.tags?.forEach((tag) => {
          if (tag && tag.trim()) {
            const normalizedTag = tag.trim().toLowerCase();
            // Solo agregar si el tag existe en las traducciones definidas
            if (obstacleTagTranslations[normalizedTag]) {
              tagsSet.add(tag.trim());
            }
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
            const normalizedTag = tag.trim().toLowerCase();
            // Solo agregar si el tag existe en las traducciones definidas
            if (surfaceProblemTagTranslations[normalizedTag]) {
              tagsSet.add(tag.trim());
            }
          }
        });
      });
    return Array.from(tagsSet).sort();
  }, [allLabels, labels]);

  const isObstacleSelected = filters.types.length === 0 || filters.types.includes("Obstacle");
  const isSurfaceProblemSelected = filters.types.length === 0 || filters.types.includes("SurfaceProblem");

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

  // Helper: verificar si ningún item está seleccionado
  const areNoItemsSelected = (selectedItems: string[]): boolean => {
    return selectedItems.length === 1 && selectedItems[0] === NONE_SELECTED;
  };

  // Helper: toggle genérico para arrays de selección
  const toggleItem = (
    item: string,
    selectedItems: string[],
    allItems: string[]
  ): string[] => {
    const allSelected = areAllItemsSelected(selectedItems, allItems);
    const noneSelected = areNoItemsSelected(selectedItems);
    
    if (allSelected) {
      // Todos seleccionados: deseleccionar todos excepto el clickeado
      // Es decir, dejar seleccionado todo MENOS el item clickeado
      return allItems.filter(t => t !== item);
    } else if (noneSelected) {
      // Ninguno seleccionado: seleccionar solo el clickeado
      return [item];
    } else {
      // Toggle normal
      let newItems = selectedItems.includes(item)
        ? selectedItems.filter(t => t !== item)
        : [...selectedItems, item];
      
      // Limpiar NONE_SELECTED si por alguna razón quedó ahí (no debería)
      newItems = newItems.filter(t => t !== NONE_SELECTED);
      
      // Si no queda ninguno, marcar como NONE_SELECTED
      if (newItems.length === 0) {
        return [NONE_SELECTED];
      }
      
      // Si todos quedan seleccionados, retornar array vacío (ALL)
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

  // Seleccionar/deseleccionar todos los tags de obstáculos
  const toggleAllObstacleTags = () => {
    const currentTags = filters.obstacleTags || [];
    const allSelected = areAllItemsSelected(currentTags, obstacleTags);
    
    if (allSelected) {
      // Todos seleccionados: deseleccionar todos (marcar como NONE)
      onFilterChange({ ...filters, obstacleTags: [NONE_SELECTED] });
    } else {
      // No todos seleccionados: seleccionar todos (array vacío)
      onFilterChange({ ...filters, obstacleTags: [] });
    }
  };

  // Seleccionar/deseleccionar todos los tags de problemas de superficie
  const toggleAllSurfaceProblemTags = () => {
    const currentTags = filters.surfaceProblemTags || [];
    const allSelected = areAllItemsSelected(currentTags, surfaceProblemTags);
    
    if (allSelected) {
      // Todos seleccionados: deseleccionar todos (marcar como NONE)
      onFilterChange({ ...filters, surfaceProblemTags: [NONE_SELECTED] });
    } else {
      // No todos seleccionados: seleccionar todos (array vacío)
      onFilterChange({ ...filters, surfaceProblemTags: [] });
    }
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
                <AccordionTrigger className="group text-sm font-semibold text-foreground hover:no-underline py-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span>Filtrar por Tipos de Obstáculos</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {obstacleTags.length}
                    </Badge>
                    
                    {/* Checkbox "Seleccionar todo" visible solo cuando el acordeón está abierto (usando CSS) */}
                    <div 
                      className="hidden group-data-[state=open]:flex items-center space-x-2 ml-4" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        id="select-all-obstacle-tags"
                        checked={areAllItemsSelected(filters.obstacleTags || [], obstacleTags)}
                        onCheckedChange={(checked) => toggleAllObstacleTags()}
                        className="border-2 border-primary"
                      />
                      <span 
                        className="text-xs cursor-pointer font-semibold text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAllObstacleTags();
                        }}
                      >
                        Seleccionar todo
                      </span>
                    </div>
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
                <AccordionTrigger className="group text-sm font-semibold text-foreground hover:no-underline py-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span>Filtrar por Problemas de Superficie</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {surfaceProblemTags.length}
                    </Badge>
                    
                    {/* Checkbox "Seleccionar todo" visible solo cuando el acordeón está abierto (usando CSS) */}
                    <div 
                      className="hidden group-data-[state=open]:flex items-center space-x-2 ml-4" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        id="select-all-surface-tags"
                        checked={areAllItemsSelected(filters.surfaceProblemTags || [], surfaceProblemTags)}
                        onCheckedChange={(checked) => toggleAllSurfaceProblemTags()}
                        className="border-2 border-primary"
                      />
                      <span 
                        className="text-xs cursor-pointer font-semibold text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAllSurfaceProblemTags();
                        }}
                      >
                        Seleccionar todo
                      </span>
                    </div>
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
    </Card>
  );
};
