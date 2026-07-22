import { z } from 'zod';
import { Material, UnitOfMeasure } from '@/features/materials/types/material';

export const MaterialSchema: z.ZodType<Material> = z.object({
  id: z.string(),
  name: z.string(),
  photo: z.string().nullable(),
  description: z.string().nullable(),
  unit_of_measure: z.nativeEnum(UnitOfMeasure),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
});

