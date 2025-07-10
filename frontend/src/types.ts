export interface Unit {
  unit_id: number;
  plant_id: number;
  num: number;
  name: string;
  name_eng: string;
  design: string;
  stage: string | null;
  power: number;
  start_date: string | null;
  reactor_vessel: ReactorVessel;
}

export interface ReactorVessel {
  vessel_id: number;
  unit_id: number;
  sectors: Sector[];
  coupon_complects: CouponComplect[];
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
  name: string;
  complect_number: number | null;
  is_additional: boolean;
  container_systems: ContainerSystem[];
}

export interface ContainerSystem {
  container_sys_id: number;
  name: string;
  load_status: ContainerSystemLoadStatus | null;
}

export interface ContainerSystemLoadStatus {
  cpn_load_id: number;
  load_date: string;
  irrad_placement: {
    placement_id: number;
    name: string;
  };
  extract?: {
    cpn_extract_id: number;
    extract_date: string;
  };
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

// Updated interfaces to match backend Pydantic schemas exactly

// Schema for container system in unit2 response
export interface ContainerSystemSchema {
  container_sys_id: number;
  name: string;
}

// Schema for placement in unit2 response
export interface PlacementSchema {
  placement_id: number;
  name: string;
  num_in_sector: number;
  coords?: [number, number] | null;
}

// Schema for reactor vessel sector in unit2 response
export interface ReactorVesselSectorSchema {
  rpv_sector_id: number;
  sector_number: number;
  placements: PlacementSchema[];
}

// Schema for coupon complect in unit2 response
export interface CouponComplectSchema {
  coupon_complect_id: number;
  name: string;
  complect_number: number | null;
  is_additional: boolean | null;
  container_systems: ContainerSystemSchema[];
}

// Schema for reactor vessel in unit2 response
export interface ReactorVesselSchema {
  vessel_id: number;
  sectors: ReactorVesselSectorSchema[];
  coupon_complects: CouponComplectSchema[];
}

// Schema for the unit in unit2 response
export interface UnitSchema {
  unit_id: number;
  plant_id: number;
  num: number;
  name: string;
  name_eng: string;
  design: string;
  stage: string | null;
  power: number;
  start_date: string | null;
  reactor_vessel: ReactorVesselSchema;
}

// Schema for coupon extract
export interface CouponExtractSchema {
  cpn_extract_id: number;
  extract_date: string;
  irrad_container_sys_id: number;
}

// Schema for coupon load
export interface CouponLoadSchema {
  cpn_load_id: number;
  load_date: string;
  irrad_container_sys_id: number;
  irrad_placement_id: number;
  coupon_extract?: CouponExtractSchema | null;
}

// Main response schema for unit_detail2
export interface Unit2ResponseSchema {
  unit: UnitSchema;
  loads: Record<number, CouponLoadSchema>;
  cs_load_ids: Record<number, number[]>;
  p_load_ids: Record<number, number[]>;
}
