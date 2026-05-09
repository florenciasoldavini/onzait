export enum UnitOfMeasure {
  UNIT = "unit",
  KG = "kg",
  G = "g",
  M = "m",
  CM = "cm",
  MM = "mm",
  M2 = "m2",
  M3 = "m3",
  L = "l",
  ML = "ml",
  BAG = "bag",
  BOX = "box",
  ROLL = "roll",
  SHEET = "sheet",
  TUBE = "tube"
}
export interface Material {
  id: string;
  name: string;
  photo: string | null;
  description: string | null;
  unit_of_measure: UnitOfMeasure;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}
