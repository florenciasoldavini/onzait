import { dailyReportWeatherSchema } from "@/features/daily-reports/schemas/weather.schema";
import type { DailyReport } from "@/features/daily-reports/types/daily-report";
import { z } from "zod";

const timestampSchema = z.iso.datetime({ offset: true });

const reportShape = {
  id: z.uuid(),
  project_id: z.uuid(),
  workspace_id: z.uuid(),
  report_date: z.iso.date(),
  weather: dailyReportWeatherSchema.nullable(),
  created_by: z.uuid(),
  created_at: timestampSchema,
  updated_at: timestampSchema.nullable(),
  deleted_at: timestampSchema.nullable()
};

/** Record validation, not a client write payload or authorization check. */
export const dailyReportSchema: z.ZodType<DailyReport> = z.discriminatedUnion(
  "status",
  [
    z
      .object({
        ...reportShape,
        status: z.literal("draft"),
        submitted_by: z.null(),
        submitted_at: z.null()
      })
      .strict(),
    z
      .object({
        ...reportShape,
        status: z.literal("submitted"),
        submitted_by: z.uuid(),
        submitted_at: timestampSchema
      })
      .strict()
  ]
);
