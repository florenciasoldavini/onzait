import { Attendance } from "@/types/models/attendance";
import { z } from "zod";

export const AttendanceSchema: z.ZodType<Attendance> = z.object({
  id: z.string(),
  date: z.date(),
  project_id: z.string(),
  worker_id: z.string(),
  present: z.boolean(),
  hours_worked: z.number().nullable(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable()
});
