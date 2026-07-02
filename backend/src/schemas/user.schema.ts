import { z } from "zod";

// Base User schema for validation
export const UserSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  avatar: z.string().nullable(),
  email: z.string().email(),
  phone_number: z.string().nullable(),
  role: z.string(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable()
});

// Schema for creating a user (omits auto-generated fields)
export const CreateUserSchema = UserSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true
});

// Schema for updating a user (all fields optional except id)
export const UpdateUserSchema = CreateUserSchema.partial().extend({
  id: z.string()
});

// Schema for user query params
export const UserQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional()
});
