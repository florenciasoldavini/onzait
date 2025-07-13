export type PhotoCategory =
  | "progress" // Photos related to the project
  | "marketing"; // Photos related to the site

export interface Photo {
  id: string;
  user_id: string;
  project_id: string;
  url: string;
  category: PhotoCategory;
  notes: string | null;
  created_at: Date;
  updated_at: Date | null;
}
