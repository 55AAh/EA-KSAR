// Global types that match backend/models Pydantic schemas

export interface UnitModel {
  unit_id: number;
  plant_id: number;
  num: number;
  name: string;
  name_eng: string;
  design: string;
  stage: string | null;
  power: number;
  start_date: string | null;
  reactor_vessel: ReactorVesselModel | null;
}

export interface ReactorVesselModel {
  vessel_id: number;
  unit_id: number;
  sectors: ReactorVesselSectorModel[] | null;
  coupon_complects: CouponComplectModel[] | null;
}

export interface ReactorVesselSectorModel {
  rpv_sector_id: number;
  vessel_id: number;
  sector_number: number;
  placements: PlacementModel[] | null;
}

export interface PlacementModel {
  placement_id: number;
  sector_id: number;
  num_in_sector: number;
  name: string;
}

export interface CouponComplectModel {
  coupon_complect_id: number;
  vessel_id: number;
  name: string;
  compect_number: number | null;
  is_additional: boolean;
  container_systems: ContainerSysModel[] | null;
}

export interface ContainerSysModel {
  container_sys_id: number;
  coupon_complect_id: number;
  name: string;
}

export interface CouponLoadModel {
  cpn_load_id: number;
  load_date: string;
  irrad_container_sys_id: number;
  irrad_placement_id: number;
  coupon_extract: CouponExtractModel | null;
}

export interface CouponExtractModel {
  cpn_extract_id: number;
  cpn_load_id: number;
  extract_date: string;
  irrad_container_sys_id: number;
}

// Legacy interfaces for existing components (to be migrated gradually)
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

// Other global types
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
  data?: any;
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
