import { z } from 'zod';
import { User } from '@/types/models/user';

export const UserSchema: z.ZodType<User> = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  avatar: z.string().nullable(),
  email: z.string(),
  phone_number: z.string().nullable(),
  role: z.string(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
});
