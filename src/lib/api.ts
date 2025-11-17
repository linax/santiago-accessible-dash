import { LabelData } from "./types";

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

export const getOverallData = async (): Promise<LabelData[]> => {
  return FALLBACK_DATA;
}

export const fetchSidewalkData = async (): Promise<LabelData[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/labelClusters?filetype=geojson`, {
      mode: 'cors',
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const dataFromJson = await response.json() as GeoJSONResponse;
    
    // Verificar que features existe y es un array
    if (!dataFromJson.features || !Array.isArray(dataFromJson.features)) {
      throw new Error("Invalid GeoJSON format: features array not found");
    }
    
    const data = dataFromJson.features;
    
    // Transform API data to our format
    // GeoJSON coordinates are [longitude, latitude], but Leaflet needs [latitude, longitude]
    const labels: LabelData[] = [];
    
    for (const item of data) {
      if (!item.geometry || !item.geometry.coordinates) {
        console.warn("Invalid feature geometry:", item);
        continue;
      }
      
      // GeoJSON: [lng, lat] -> Leaflet: [lat, lng]
      const [lng, lat] = item.geometry.coordinates;
      
      labels.push({
        label_id: item.properties?.label_cluster_id || 0,
        label_type: item.properties?.label_type || "Other",
        severity: item.properties?.median_severity || 1,
        lat: lat, // latitude
        lng: lng, // longitude
        timestamp: item.properties?.avg_label_date,
      });
    }
    
    return labels;
  } catch (error) {
    console.warn("Using fallback data due to API error:", error);
    return FALLBACK_DATA;
  }
};
