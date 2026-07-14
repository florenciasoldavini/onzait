import { z } from 'zod';
import { LaborEstimate } from '@/types/models/labor-estimates';

export const LaborEstimateSchema: z.ZodType<LaborEstimate> = z.object({
  id: z.string(),
  project_id: z.string(),
  trade_id: z.string(),
  cost: z.number(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
});

