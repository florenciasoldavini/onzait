export interface Attendance {
  id: string;
  date: Date;
  project_id: string;
  worker_id: string;
  present: boolean;
  hours_worked: number | null;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}
