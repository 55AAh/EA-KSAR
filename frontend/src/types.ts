export interface Unit {
  num: number;
  name: string;
  name_eng: string;
  design: string;
  stage: string | null;
  power: number | null;
  start_date: string | null;
}

export interface PlantUnits {
  name: string;
  sh_name: string;
  name_eng: string;
  sh_name_eng: string;
  units: Unit[];
}

export interface Placement {
  sector: number;
  sector_num: number;
  name: string;
}

export interface Plant {
  plant_id: number;
  name: string;
  sh_name: string;
  name_eng: string;
  sh_name_eng: string;
}

export interface SearchResult {
  id: number;
  type: string;
  name: string;
  description: string;
  data?: any; // Additional data for specific result types (Plant, Unit, etc.)
}

export interface Document {
  id: number;
  name: string;
  code: string;
  issue_date: string;
  valid_until: string | null;
  filename: string;
  file_size: number;
  file_extension: string;
  status: string;
}
