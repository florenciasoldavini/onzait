/**
 * Type of building/construction being worked on
 */
export type BuildingType =
  | "residential" // Residential buildings (homes, apartments, condos)
  | "commercial" // Commercial buildings (offices, retail, hospitality)
  | "industrial" // Industrial buildings (factories, warehouses, manufacturing)
  | "infrastructure" // Infrastructure projects (roads, bridges, utilities)
  | "institutional" // Institutional buildings (schools, hospitals, government offices)
  | "mixed_use"; // Mixed-use buildings (residential and commercial)

/**
 * Type of construction work being performed
 */
export type ProjectType =
  | "new_build" // New construction from ground up
  | "renovation" // Renovation/refurbishment of existing building
  | "remodel" // Remodel of existing building
  | "expansion" // Building extensions or additions
  | "maintenance"; // Maintenance and minor repairs

/**
 * Overall project status (high-level state)
 */
export type ProjectStatus =
  | "planned" // Project is planned
  | "in_progress" // Project is in progress
  | "on_hold" // Project is on hold
  | "completed" // Project is completed
  | "cancelled"; // Project is cancelled

/**
 * Specific phase/stage of the project lifecycle
 * (what stage the project is currently in)
 */
export type ProjectPhase =
  | "concept" // Initial concept and feasibility
  | "design" // Design and planning
  | "permits" // Building permits and approvals
  | "preconstruction" // Preconstruction setup and site readiness
  | "procurement" // Material and contractor procurement
  | "construction" // Active building phase
  | "post_construction"; // Final reviews, fixes, and handover

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
}
