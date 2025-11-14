import { LabelData, AggregateStats, LabelTypeStats } from "./types";

const API_BASE = "https://sidewalk-santiago.cs.washington.edu/v3";

// Tipo para GeoJSON Feature
interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    label_cluster_id?: number;
    label_type?: string;
    median_severity?: number;
    avg_label_date?: string;
  };
}

interface GeoJSONResponse {
  type: string;
  features: GeoJSONFeature[];
}

// Fallback data for when API is unavailable
const FALLBACK_DATA: LabelData[] = Array.from({ length: 380 }, (_, i) => ({
  label_id: i + 1,
  label_type: ["CurbRamp", "Obstacle", "SurfaceProblem", "Crosswalk", "Other"][Math.floor(Math.random() * 5)],
  severity: Math.floor(Math.random() * 5) + 1,
  lat: -33.4489 + (Math.random() - 0.5) * 0.05,
  lng: -70.6693 + (Math.random() - 0.5) * 0.05,
  timestamp: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
}));

export const fetchAggregateStats = async (): Promise<AggregateStats | null> => {
  try {
    const response = await fetch(`${API_BASE}/api/aggregateStatistics`, {
      mode: 'cors',
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    return await response.json() as AggregateStats;
  } catch (error) {
    console.warn("Could not fetch aggregate stats:", error);
    return null;
  }
};

// Función para convertir stats agregadas a LabelData simulado para gráficos
export const convertAggregateToLabels = (stats: AggregateStats): LabelData[] => {
  const labels: LabelData[] = [];
  let labelId = 1;
  
  Object.entries(stats.labels).forEach(([labelType, data]) => {
    if (typeof data === 'object' && 'count' in data) {
      const typeData = data as LabelTypeStats;
      const avgSeverity = typeData.severity_mean || 1;
      
      // Crear labels simulados basados en el count
      for (let i = 0; i < typeData.count; i++) {
        labels.push({
          label_id: labelId++,
          label_type: labelType,
          severity: Math.round(avgSeverity),
          lat: -33.4489 + (Math.random() - 0.5) * 0.05,
          lng: -70.6693 + (Math.random() - 0.5) * 0.05,
          timestamp: stats.avg_timestamp_last_100_labels,
        });
      }
    }
  });
  
  return labels;
};

export const fetchSidewalkData = async (): Promise<LabelData[]> => {
  try {
    // Primero intentar obtener datos agregados
    const aggregateStats = await fetchAggregateStats();
    if (aggregateStats) {
      return convertAggregateToLabels(aggregateStats);
    }
    
    // Si falla, intentar el endpoint de clusters geográficos
    const response = await fetch(`${API_BASE}/api/labelClusters?filetype=geojson`, {
      mode: 'cors',
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const dataFromJson = await response.json() as GeoJSONResponse;
    
    if (!dataFromJson.features || !Array.isArray(dataFromJson.features)) {
      throw new Error("Invalid GeoJSON format: features array not found");
    }
    
    const data = dataFromJson.features;
    const labels: LabelData[] = [];
    
    for (const item of data) {
      if (!item.geometry || !item.geometry.coordinates) {
        console.warn("Invalid feature geometry:", item);
        continue;
      }
      
      const [lng, lat] = item.geometry.coordinates;
      
      labels.push({
        label_id: item.properties?.label_cluster_id || 0,
        label_type: item.properties?.label_type || "Other",
        severity: item.properties?.median_severity || 1,
        lat: lat,
        lng: lng,
        timestamp: item.properties?.avg_label_date,
      });
    }
    
    return labels;
  } catch (error) {
    console.warn("Using fallback data due to API error:", error);
    return FALLBACK_DATA;
  }
};
