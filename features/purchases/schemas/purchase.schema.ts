import { z } from 'zod';
import { Purchase } from '@/features/purchases/types/purchase';

export const PurchaseSchema: z.ZodType<Purchase> = z.object({
  id: z.string(),
  project_id: z.string(),
  supplier_id: z.string().nullable(),
  total_amount: z.number(),
  receipt_url: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
});

