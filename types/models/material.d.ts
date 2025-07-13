export type UnitOfMeasure =
  | "unit"
  | "kg"
  | "g"
  | "m"
  | "cm"
  | "mm"
  | "m2"
  | "m3"
  | "l"
  | "ml"
  | "bag"
  | "box"
  | "roll"
  | "sheet"
  | "tube";

export interface Material {
  id: string;
  name: string;
  photo: string | null;
  description: string | null;
  unit_of_measure: UnitOfMeasure;
  created_at: Date;
  updated_at: Date | null;
}
