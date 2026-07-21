import { Client } from "@/features/clients/types/client";
import { z } from "zod";

export const ClientSchema: z.ZodType<Client> = z.object({
  id: z.string(),
  user_id: z.string(),
  first_name: z.string(),
  last_name: z.string().nullable(),
  avatar: z.string().nullable(),
  email: z.string().nullable(),
  phone_number: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable()
});
