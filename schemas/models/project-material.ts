import { z } from 'zod';
import { ProjectMaterial } from '@/types/models/project-material';

export const ProjectMaterialSchema: z.ZodType<ProjectMaterial> = z.object({
  id: z.string(),
  project_id: z.string(),
  material_id: z.string(),
  quantity: z.number(),
  unit_price: z.number(),
  purchase_due_date: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
});

