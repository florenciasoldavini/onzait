import type { DailyReportAttendanceSnapshot } from "@/features/daily-reports/types/daily-report-attendance";
import { z } from "zod";

const entrySchema = z
  .object({
    attendance_id: z.uuid(),
    worker_id: z.uuid(),
    worker_name: z.string().trim().min(1),
    status: z.enum(["present", "absent"]),
    hours_worked: z.number().finite().min(0).max(24).nullable(),
    notes: z
      .string()
      .trim()
      .max(2000)
      .transform((notes) => notes || null)
      .nullable()
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

/** Validates a capture; the future submission transaction must verify its source. */
export const dailyReportAttendanceSnapshotSchema: z.ZodType<DailyReportAttendanceSnapshot> =
  z
    .object({
      id: z.uuid(),
      daily_report_id: z.uuid(),
      captured_by: z.uuid(),
      captured_at: z.iso.datetime({ offset: true }),
      entries: z
        .array(entrySchema)
        .refine(
          (entries) =>
            new Set(entries.map((entry) => entry.worker_id)).size ===
            entries.length
        )
        .refine(
          (entries) =>
            new Set(entries.map((entry) => entry.attendance_id)).size ===
            entries.length
        )
    })
    .strict();
