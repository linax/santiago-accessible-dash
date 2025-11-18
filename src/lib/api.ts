import { LabelData } from "./types";

const API_BASE = "https://sidewalk-santiago.cs.washington.edu/v3";

const LABEL_URL ="https://sidewalk-santiago.cs.washington.edu/label/id/24986"

// Tipo para GeoJSON Feature
interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    label_cluster_id?: number;
    label_id?: number;
    label_type?: string;
    severity?: number;
    avg_label_date?: string;
    time_created?: string;
    tags?: string[];
    description?: string | null;
    gsv_panorama_id?: string;
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

// Tipo para la respuesta del endpoint overallStats
export interface OverallStatsResponse {
  launch_date?: string;
  avg_timestamp_last_100_labels?: string;
  km_explored?: number;
  km_explored_no_overlap?: number;
  user_counts?: {
    all_users?: number;
    labelers?: number;
    validators?: number;
    registered?: number;
    anonymous?: number;
    turker?: number;
    researcher?: number;
  };
  labels?: {
    label_count?: number;
    [key: string]: unknown;
  };
  validations?: {
    total_validations?: number;
    [key: string]: unknown;
  };
}

export const getOverallData = async (): Promise<OverallStatsResponse | null> => {
  try{
    const response = await fetch(`${API_BASE}/api/overallStats?filetype=json`, {
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json() as OverallStatsResponse;
    return data;
  }
  catch(error){
    console.warn("Error fetching overall data:", error);
    return null;
  }
}

export const fetchSidewalkData = async (): Promise<LabelData[]> => {
  try {
    //labeled clusters: labelClusters?filetype=geojson
    const response = await fetch(`${API_BASE}/api/rawLabels?filetype=geojson `, {
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
        label_id: item.properties?.label_id || item.properties?.label_cluster_id || 0,
        label_type: item.properties?.label_type || "Other",
        severity: item.properties?.severity  || 1,
        lat: lat, // latitude
        lng: lng, // longitude
        timestamp: item.properties?.avg_label_date || item.properties?.time_created,
        description: item.properties?.description || undefined,
        tags: item.properties?.tags || [],
        gsv_panorama_id: item.properties?.gsv_panorama_id || undefined,
      });
    }
    
    return labels;
  } catch (error) {
    console.warn("Using fallback data due to API error:", error);
    return FALLBACK_DATA;
  }
};
