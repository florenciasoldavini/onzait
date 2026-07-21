import { z } from 'zod';
import { Photo } from '@/features/photos/types/photo';

export const PhotoSchema: z.ZodType<Photo> = z.object({
  id: z.string(),
  user_id: z.string(),
  project_id: z.string(),
  url: z.string(),
  category: z.string(),
  notes: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
});
