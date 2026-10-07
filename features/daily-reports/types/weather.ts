import type {
  WEATHER_CONDITIONS,
  WEATHER_WIND_LEVELS,
  WEATHER_WORK_IMPACTS
} from "@/features/daily-reports/constants/weather.constants";

export type WeatherCondition = (typeof WEATHER_CONDITIONS)[number];
export type WeatherWindLevel = (typeof WEATHER_WIND_LEVELS)[number];
export type WeatherWorkImpact = (typeof WEATHER_WORK_IMPACTS)[number];

/** Manual observation embedded in a daily report, which owns the project and date. */
export interface DailyReportWeather {
  /** One or more distinct conditions observed over the report's day. */
  conditions: WeatherCondition[];
  /** One observed temperature in Celsius; null means not recorded. */
  temperature_celsius: number | null;
  /** Qualitative observation, not an equipment operating limit. */
  wind: WeatherWindLevel | null;
  /** Actual reported impact, never inferred from temperature or wind. */
  work_impact: WeatherWorkImpact;
  notes: string | null;
  source: "manual";
}
