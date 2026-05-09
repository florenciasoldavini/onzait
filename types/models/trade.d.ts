export interface Trade {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}
