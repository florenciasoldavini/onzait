import { z } from 'zod';
import { UserMaterial } from '@/types/models/user-material';

export const UserMaterialSchema: z.ZodType<UserMaterial> = z.object({
  id: z.string(),
  user_id: z.string(),
  material_id: z.string(),
  estimated_price: z.number(),
  notes: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
});

