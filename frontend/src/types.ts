export interface Unit {
  num: number;
  name: string;
  name_eng: string;
  design: string;
  stage: string | null;
  power: number | null;
  start_date: string | null;
  reactor_vessel?: {
    vessel_id: number;
    unit_id: number;
    sectors: Sector[];
    coupon_complects: CouponComplect[];
  };
}

export interface Sector {
  rpv_sector_id: number;
  vessel_id: number;
  sector_number: number;
  placements: Placement[];
}

export interface Placement {
  placement_id: number;
  sector_id: number;
  num_in_sector: number;
  name: string;
  coords: [number, number];
  text_coords: [number, number];
  loads: PlacementLoad[];
  occupied: boolean;
  last_sys_name: string | null;
}

export interface PlacementLoad {
  container_sys_name: string;
  load_date: string;
  extract_date: string | null;
}

export interface CouponComplect {
  coupon_complect_id: number;
  vessel_id: number;
  name: string;
  complect_number: number | null;
  is_additional: boolean;
}

export interface PlantUnits {
  name: string;
  sh_name: string;
  name_eng: string;
  sh_name_eng: string;
  units: Unit[];
}

export interface Plant {
  plant_id: number;
  num: number;
  sh_name: string;
  name: string;
  descr: string | null;
  sh_name_eng: string;
  name_eng: string;
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
