export interface UserMaterial {
  id: string;
  user_id: string;
  material_id: string;
  estimated_price: number;
  notes: string | null;
  created_at: Date;
  updated_at: Date | null;
}
