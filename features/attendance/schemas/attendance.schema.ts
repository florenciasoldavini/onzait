import type { Attendance } from "@/features/attendance/types/attendance";
import { z } from "zod";

const timestampSchema = z.iso.datetime({ offset: true });

/** Record validation only; uniqueness and authorization belong in persistence. */
export const AttendanceSchema: z.ZodType<Attendance> = z
  .object({
    id: z.uuid(),
    project_id: z.uuid(),
    workspace_id: z.uuid(),
    worker_id: z.uuid(),
    attendance_date: z.iso.date(),
    status: z.enum(["present", "absent"]),
    hours_worked: z.number().finite().min(0).max(24).nullable(),
    notes: z
      .string()
      .trim()
      .max(2000)
      .transform((notes) => notes || null)
      .nullable(),
    created_by: z.uuid(),
    created_at: timestampSchema,
    updated_at: timestampSchema.nullable(),
    deleted_at: timestampSchema.nullable()
  })
  .strict()
  .refine(
    (entry) =>
      entry.status !== "absent" ||
      entry.hours_worked === null ||
      entry.hours_worked === 0,
    {
      path: ["hours_worked"],
      message: "Absent workers cannot have worked hours."
    }
  );
