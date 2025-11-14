export interface LabelData {
  label_id: number;
  label_type: string;
  severity: number;
  lat: number;
  lng: number;
  timestamp?: string;
  description?: string;
}

export interface LabelTypeStats {
  count: number;
  count_with_severity: number;
  severity_mean?: number;
  severity_sd?: number;
}

export interface AggregateStats {
  launch_date: string;
  avg_timestamp_last_100_labels: string;
  km_explored: number;
  km_explored_no_overlap: number;
  user_counts: {
    all_users: number;
    labelers: number;
    validators: number;
    registered: number;
    anonymous: number;
    turker: number;
    researcher: number;
  };
  labels: {
    label_count: number;
    [key: string]: number | LabelTypeStats;
  };
  validations: {
    total_validations: number;
    [key: string]: number | {
      validated: number;
      agreed: number;
      disagreed: number;
      accuracy?: number;
    };
  };
}

export interface ProblemFilter {
  types: string[];
  severityRange: [number, number];
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
