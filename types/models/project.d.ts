export type BuildingType =
  | "residential"
  | "commercial"
  | "industrial"
  | "infrastructure"
  | "institutional"
  | "mixed_use";

export type ProjectType =
  | "new_build"
  | "renovation"
  | "remodel"
  | "expansion"
  | "maintenance";

export type ProjectStatus =
  | "planned"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "cancelled";

export type ProjectPhase =
  | "concept"
  | "design"
  | "permits"
  | "preconstruction"
  | "procurement"
  | "construction"
  | "post_construction";

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  cover_image_path: string | null;
  address: string;
  google_place_id: string;
  latitude: number;
  longitude: number;
  building_type: BuildingType;
  project_type: ProjectType;
  status: ProjectStatus;
  phase: ProjectPhase;
  progress_percentage: number;
  estimated_start_date: string | null;
  start_date: string | null;
  estimated_end_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}
