export interface ProjectMaterial {
  id: string;
  project_id: string;
  material_id: string;
  quantity: number;
  unit_price: number;
  purchase_due_date: Date | null;
  created_at: Date;
  updated_at: Date | null;
}
