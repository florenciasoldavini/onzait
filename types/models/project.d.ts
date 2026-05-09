/**
 * Type of building/construction being worked on
 */
export enum BuildingType {
  RESIDENTIAL = "residential",
  COMMERCIAL = "commercial",
  INDUSTRIAL = "industrial",
  INFRASTRUCTURE = "infrastructure",
  INSTITUTIONAL = "institutional",
  MIXED_USE = "mixed_use"
}

/**
 * Type of construction work being performed
 */
export enum ProjectType {
  NEW_BUILD = "new_build",
  RENOVATION = "renovation",
  REMODEL = "remodel",
  EXPANSION = "expansion",
  MAINTENANCE = "maintenance"
}

/**
 * Overall project status (high-level state)
 */
export enum ProjectStatus {
  PLANNED = "planned",
  IN_PROGRESS = "in_progress",
  ON_HOLD = "on_hold",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

/**
 * Specific phase/stage of the project lifecycle
 * (what stage the project is currently in)
 */
export enum ProjectPhase {
  CONCEPT = "concept",
  DESIGN = "design",
  PERMITS = "permits",
  PRECONSTRUCTION = "preconstruction",
  PROCUREMENT = "procurement",
  CONSTRUCTION = "construction",
  POST_CONSTRUCTION = "post_construction"
}

export interface Project {
  id: string;
  name: string;
  description: string;
  cover_image: string | null;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  building_type: BuildingType;
  project_type: ProjectType;
  status: ProjectStatus;
  phase: ProjectPhase;
  progress_percentage: number;
  estimated_start_date: Date | null;
  start_date: Date | null;
  estimated_end_date: Date | null;
  end_date: Date | null;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}
