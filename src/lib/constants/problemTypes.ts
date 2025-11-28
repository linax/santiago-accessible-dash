export const problemTypes = [
  { id: "NoCurbRamp", label: "Falta rebaje de vereda", color: "#800020" }, 
  { id: "SurfaceProblem", label: "Superficie", color: "#FF0000" }, 
  { id: "Obstacle", label: "Obstáculos", color: "#3B82F6" }, 
  { id: "Crosswalk", label: "Cruces", color: "#EAB308" }, 
  { id: "CurbRamp", label: "Rampas", color: "#22C55E" }, 
];

// Diccionario de traducciones para tags de obstáculos
export const obstacleTagTranslations: Record<string, string> = {
  "construction": "Construcción",
  "litter/garbage": "Basura en la vereda",
  "narrow": "Vereda angosta",
  "parked bike": "Bicicleta estacionada",
  "parked car": "Auto estacionado",
  "pole": "Poste",
  "sign": "Letrero o señalética",
  "tree": "Árbol",
};

// Diccionario de traducciones para tags de problemas de superficie
export const surfaceProblemTagTranslations: Record<string, string> = {
  "brick/cobberstone": "Adoquines",
  "brick/cobblestone": "Adoquines",
  "sand/gravel": "Arena o gravilla",
  "bumpy": "Disparejo",
  "cracks": "Grietas",
  "height difference": "Desnivel",
  "narrow sidewalk": "Vereda angosta",
  "uneven/slanted": "Inclinación",
  "utility panel": "Tapa o cámara de servicio",
  "very broken": "Muy deteriorada",
};

// Función helper para traducir tags de obstáculos
export const translateObstacleTag = (tag: string): string => {
  return obstacleTagTranslations[tag.toLowerCase()] || tag;
};

// Función helper para traducir tags de problemas de superficie
export const translateSurfaceProblemTag = (tag: string): string => {
  return surfaceProblemTagTranslations[tag.toLowerCase()] || tag;
};

// Función genérica para traducir tags según el tipo de label
export const translateTag = (tag: string, labelType: string): string => {
  if (labelType === "Obstacle") {
    return translateObstacleTag(tag);
  } else if (labelType === "SurfaceProblem") {
    return translateSurfaceProblemTag(tag);
  }
  return tag;
};
