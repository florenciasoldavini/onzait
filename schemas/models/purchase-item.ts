import { z } from 'zod';
import { PurchaseItem } from '@/types/models/purchase-item';

export const PurchaseItemSchema: z.ZodType<PurchaseItem> = z.object({
  id: z.string(),
  purchase_id: z.string(),
  material_id: z.string(),
  quantity: z.number().nullable(),
  unit_price: z.number().nullable(),
  total_price: z.number().nullable(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
});

