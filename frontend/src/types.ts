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
