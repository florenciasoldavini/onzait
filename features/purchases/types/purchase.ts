export interface Purchase {
  id: string;
  project_id: string;
  supplier_id: string | null;
  total_amount: number;
  receipt_url: string | null;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}
