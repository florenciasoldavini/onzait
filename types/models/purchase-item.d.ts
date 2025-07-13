export interface PurchaseItem {
  id: string;
  purchase_id: string;
  material_id: string;
  quantity: number | null;
  unit_price: number | null;
  total_price: number | null;
  created_at: Date;
  updated_at: Date | null;
}
