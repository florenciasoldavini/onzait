import { z } from 'zod';
import {
  Project,
  BuildingType,
  ProjectType,
  ProjectStatus,
  ProjectPhase,
} from '@/types/models/project';

export const ProjectSchema: z.ZodType<Project> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  cover_image: z.string().nullable(),
  address: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  building_type: z.nativeEnum(BuildingType),
  project_type: z.nativeEnum(ProjectType),
  status: z.nativeEnum(ProjectStatus),
  phase: z.nativeEnum(ProjectPhase),
  progress_percentage: z.number(),
  estimated_start_date: z.date().nullable(),
  start_date: z.date().nullable(),
  estimated_end_date: z.date().nullable(),
  end_date: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
});

