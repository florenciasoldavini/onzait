import { z } from "zod";

// Enums
export const BuildingTypeEnum = z.nativeEnum({
  RESIDENTIAL: "residential",
  COMMERCIAL: "commercial",
  INDUSTRIAL: "industrial",
  INFRASTRUCTURE: "infrastructure",
  INSTITUTIONAL: "institutional",
  MIXED_USE: "mixed_use"
});

export const ProjectTypeEnum = z.nativeEnum({
  NEW_BUILD: "new_build",
  RENOVATION: "renovation",
  REMODEL: "remodel",
  EXPANSION: "expansion",
  MAINTENANCE: "maintenance"
});

export const ProjectStatusEnum = z.nativeEnum({
  PLANNED: "planned",
  IN_PROGRESS: "in_progress",
  ON_HOLD: "on_hold",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
});

export const ProjectPhaseEnum = z.nativeEnum({
  CONCEPT: "concept",
  DESIGN: "design",
  PERMITS: "permits",
  PRECONSTRUCTION: "preconstruction",
  PROCUREMENT: "procurement",
  CONSTRUCTION: "construction",
  POST_CONSTRUCTION: "post_construction"
});

// Base Project schema for validation
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  cover_image: z.string().nullable(),
  address: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  building_type: BuildingTypeEnum,
  project_type: ProjectTypeEnum,
  status: ProjectStatusEnum,
  phase: ProjectPhaseEnum,
  progress_percentage: z.number().min(0).max(100),
  estimated_start_date: z.date().nullable(),
  start_date: z.date().nullable(),
  estimated_end_date: z.date().nullable(),
  end_date: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable()
});

// Schema for creating a project
export const CreateProjectSchema = ProjectSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true
});

// Schema for updating a project
export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  id: z.string()
});

// Schema for project query params
export const ProjectQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  status: z.string().optional(),
  phase: z.string().optional(),
  building_type: z.string().optional(),
  search: z.string().optional()
});
