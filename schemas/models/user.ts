import { z } from 'zod';
import { User } from '@/types/models/user';

export const UserSchema: z.ZodType<User> = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string().nullable(),
  avatar: z.string().nullable(),
  email: z.string().email(),
  phone_number: z.string().nullable(),
  role: z.enum(["admin", "user"]),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
});
