export interface LabelData {
  label_id: number;
  label_type: string;
  severity: number;
  lat: number;
  lng: number;
  timestamp?: string;
  description?: string;
  tags?: string[];
}

export interface ProblemFilter {
  types: string[];
  severityRange: [number, number];
  obstacleTags?: string[];
}

export interface GeographicZone {
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  count: number;
  avgSeverity: number;
}
