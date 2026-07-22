import { z } from 'zod';
import { Supplier } from '@/features/suppliers/types/supplier';

export const SupplierSchema: z.ZodType<Supplier> = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  website: z.string().nullable(),
  phone_number: z.string().nullable(),
  address: z.string().nullable(),
  coordinates: z.object({
    lat: z.number().nullable(),
    lng: z.number().nullable(),
  }),
  opening_hours: z.array(z.string()),
  notes: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
});

