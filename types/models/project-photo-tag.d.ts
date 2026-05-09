export interface ProjectPhotoTag {
  id: string;
  project_id: string;
  name: string;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}
