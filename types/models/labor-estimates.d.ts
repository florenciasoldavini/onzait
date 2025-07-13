export interface LaborEstimate {
  id: string;
  project_id: string;
  trade_id: string;
  cost: number;
  created_at: Date;
  updated_at: Date | null;
}
