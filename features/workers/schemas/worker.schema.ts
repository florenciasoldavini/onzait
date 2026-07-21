import { Worker } from "@/features/workers/types/worker";
import { z } from "zod";

export const WorkerSchema: z.ZodType<Worker> = z.object({
  id: z.string(),
  user_id: z.string(),
  contractor_id: z.string(),
  first_name: z.string(),
  last_name: z.string().nullable(),
  avatar: z.string().nullable(),
  phone_number: z.string().nullable(),
  email: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable()
});
