import {
  WEATHER_CONDITIONS,
  WEATHER_WIND_LEVELS,
  WEATHER_WORK_IMPACTS
} from "@/features/daily-reports/constants/weather.constants";
import type { DailyReportWeather } from "@/features/daily-reports/types/weather";
import { z } from "zod";

/** Domain validation; future forms must map issues to localized product copy. */
export const dailyReportWeatherSchema: z.ZodType<DailyReportWeather> = z
  .object({
    conditions: z
      .array(z.enum(WEATHER_CONDITIONS))
      .min(1)
      .refine((conditions) => new Set(conditions).size === conditions.length),
    temperature_celsius: z.number().finite().nullable(),
    wind: z.enum(WEATHER_WIND_LEVELS).nullable(),
    work_impact: z.enum(WEATHER_WORK_IMPACTS),
    notes: z
      .string()
      .trim()
      .max(2000)
      .transform((notes) => notes || null)
      .nullable(),
    source: z.literal("manual")
  })
  .strict();
