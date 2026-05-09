export interface Photo {
  id: string;
  user_id: string;
  project_id: string;
  url: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}
