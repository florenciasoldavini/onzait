import type {
  PROJECT_BUILDING_TYPES,
  PROJECT_PHASES,
  PROJECT_STATUSES,
  PROJECT_TYPES
} from "@/features/projects/constants";

export type ProjectBuildingType = (typeof PROJECT_BUILDING_TYPES)[number];
export type ProjectType = (typeof PROJECT_TYPES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type ProjectPhase = (typeof PROJECT_PHASES)[number];

export interface Project {
  address: string;
  building_type: ProjectBuildingType;
  cover_image_path: string | null;
  cover_image_url?: string | null;
  created_at: string;
  deleted_at: string | null;
  description: string | null;
  end_date: string | null;
  estimated_end_date: string | null;
  estimated_start_date: string | null;
  google_place_id: string;
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  owner_id: string;
  phase: ProjectPhase;
  progress_percentage: number;
  project_type: ProjectType;
  start_date: string | null;
  status: ProjectStatus;
  updated_at: string | null;
}

export interface ProjectFilters {
  buildingType?: ProjectBuildingType | "all";
  phase?: ProjectPhase | "all";
  projectType?: ProjectType | "all";
  query?: string;
  status?: ProjectStatus | "all";
}

export interface ResolvedProjectAddress {
  address: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

export interface ProjectFormValues {
  address: ResolvedProjectAddress | null;
  building_type: ProjectBuildingType;
  coverAsset?: {
    fileName?: string | null;
    mimeType?: string | null;
    uri: string;
  } | null;
  description: string;
  end_date: string;
  estimated_end_date: string;
  estimated_start_date: string;
  name: string;
  phase: ProjectPhase;
  progress_percentage: number;
  project_type: ProjectType;
  start_date: string;
  status: ProjectStatus;
}

export interface CreateProjectInput {
  address: string;
  building_type: ProjectBuildingType;
  description: string | null;
  end_date: string | null;
  estimated_end_date: string | null;
  estimated_start_date: string | null;
  google_place_id: string;
  latitude: number;
  longitude: number;
  name: string;
  phase: ProjectPhase;
  progress_percentage: number;
  project_type: ProjectType;
  start_date: string | null;
  status: ProjectStatus;
}

export type UpdateProjectInput = Partial<CreateProjectInput> & {
  cover_image_path?: string | null;
};

export interface AddressSuggestion {
  placeId: string;
  text: string;
}

export interface StaticMapPreview {
  attribution: string;
  imageDataUrl: string;
}
