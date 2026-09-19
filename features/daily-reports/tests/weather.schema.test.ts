import { dailyReportWeatherSchema } from "@/features/daily-reports/schemas/weather.schema";
import type { DailyReportWeather } from "@/features/daily-reports/types/weather";

const observation: DailyReportWeather = {
  conditions: ["clear", "rain"],
  temperature_celsius: null,
  wind: null,
  work_impact: "no_impact",
  notes: null,
  source: "manual"
};

describe("daily report weather schema", () => {
  it("accepts changing conditions without requiring measured weather", () => {
    expect(dailyReportWeatherSchema.parse(observation)).toEqual(observation);
  });

  it("keeps work impact independent from observed conditions", () => {
    const result = dailyReportWeatherSchema.parse({
      ...observation,
      temperature_celsius: 39.5,
      wind: "strong",
      notes: "  Interior work continued.  "
    });

    expect(result).toMatchObject({
      temperature_celsius: 39.5,
      wind: "strong",
      work_impact: "no_impact",
      notes: "Interior work continued."
    });
  });

  it.each([-12.5, 0, 24.5])("preserves an observed %s °C", (temperature) => {
    expect(
      dailyReportWeatherSchema.parse({
        ...observation,
        temperature_celsius: temperature
      }).temperature_celsius
    ).toBe(temperature);
  });

  it("normalizes blank notes to unrecorded", () => {
    expect(
      dailyReportWeatherSchema.parse({ ...observation, notes: "   " }).notes
    ).toBeNull();
  });

  it("accepts notes at the length limit", () => {
    expect(
      dailyReportWeatherSchema.safeParse({
        ...observation,
        notes: "a".repeat(2000)
      }).success
    ).toBe(true);
  });

  it.each([
    { conditions: [] },
    { conditions: ["rain", "rain"] },
    { conditions: ["sunny"] },
    { work_impact: undefined },
    { work_impact: "unsafe" },
    { wind: "hurricane" },
    { temperature_celsius: NaN },
    { temperature_celsius: Infinity },
    { temperature_celsius: -Infinity },
    { temperature_celsius: "25" },
    { source: "api" },
    { source: undefined },
    { notes: "a".repeat(2001) },
    { project_id: "a-project" }
  ])("rejects invalid or unsupported observation fields: %p", (fields) => {
    expect(
      dailyReportWeatherSchema.safeParse({ ...observation, ...fields }).success
    ).toBe(false);
  });
});
