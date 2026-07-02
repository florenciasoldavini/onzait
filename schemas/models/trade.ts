import { z } from 'zod';
import { Trade } from '@/types/models/trade';

export const TradeSchema: z.ZodType<Trade> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
});

