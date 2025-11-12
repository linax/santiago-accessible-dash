import { LabelData } from "./types";

const API_BASE = "https://sidewalk-rancagua.cs.washington.edu/v3";

// Fallback data for when API is unavailable
const FALLBACK_DATA: LabelData[] = Array.from({ length: 380 }, (_, i) => ({
  label_id: i + 1,
  label_type: ["CurbRamp", "Obstacle", "SurfaceProblem", "NoCrosswalk", "Other"][Math.floor(Math.random() * 5)],
  severity: Math.floor(Math.random() * 5) + 1,
  lat: -33.4489 + (Math.random() - 0.5) * 0.05,
  lng: -70.6693 + (Math.random() - 0.5) * 0.05,
  timestamp: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
}));

export const fetchSidewalkData = async (): Promise<LabelData[]> => {
  try {
    const response = await fetch(`${API_BASE}/adminapi/labels/all`, {
      mode: 'cors',
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform API data to our format
    return data.map((item: any) => ({
      label_id: item.label_id || item.id,
      label_type: item.label_type || item.type,
      severity: item.severity || Math.floor(Math.random() * 5) + 1,
      lat: item.lat || item.latitude,
      lng: item.lng || item.longitude,
      timestamp: item.timestamp || item.created_at,
      description: item.description,
    }));
  } catch (error) {
    console.warn("Using fallback data due to API error:", error);
    return FALLBACK_DATA;
  }
};
