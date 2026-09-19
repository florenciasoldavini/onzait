import { dailyReportSchema } from "@/features/daily-reports/schemas/daily-report.schema";
import type { DailyReport } from "@/features/daily-reports/types/daily-report";

const draft: DailyReport = {
  id: "11111111-1111-4111-8111-111111111111",
  project_id: "22222222-2222-4222-8222-222222222222",
  workspace_id: "33333333-3333-4333-8333-333333333333",
  report_date: "2026-09-19",
  status: "draft",
  weather: null,
  created_by: "44444444-4444-4444-8444-444444444444",
  submitted_by: null,
  submitted_at: null,
  created_at: "2026-09-19T12:00:00Z",
  updated_at: null,
  deleted_at: null
};

const submitted: DailyReport = {
  ...draft,
  status: "submitted",
  submitted_by: "55555555-5555-4555-8555-555555555555",
  submitted_at: "2026-09-19T18:00:00-03:00"
};

describe("daily report schema", () => {
  it("accepts a draft with no weather or narrative fields", () => {
    expect(dailyReportSchema.parse(draft)).toEqual(draft);
  });

  it("accepts submission without weather by someone other than the author", () => {
    expect(dailyReportSchema.parse(submitted)).toEqual(submitted);
  });

  it("validates and normalizes the embedded weather observation", () => {
    expect(
      dailyReportSchema.parse({
        ...draft,
        weather: {
          conditions: ["rain"],
          temperature_celsius: 0,
          wind: null,
          work_impact: "partially_stopped",
          notes: "  Exterior work paused.  ",
          source: "manual"
        }
      }).weather
    ).toMatchObject({
      temperature_celsius: 0,
      notes: "Exterior work paused."
    });
  });

  it("preserves a leap-day report date independently of UTC timestamps", () => {
    expect(
      dailyReportSchema.parse({ ...draft, report_date: "2024-02-29" })
        .report_date
    ).toBe("2024-02-29");
  });

  it.each([
    "2026-02-29",
    "2026-04-31",
    "2026-13-01",
    "19/09/2026",
    "2026-09-19T00:00:00Z"
  ])("rejects invalid calendar date %s", (report_date) => {
    expect(dailyReportSchema.safeParse({ ...draft, report_date }).success).toBe(
      false
    );
  });

  it.each(["id", "project_id", "workspace_id", "created_by"])(
    "requires a UUID for %s",
    (field) => {
      expect(
        dailyReportSchema.safeParse({ ...draft, [field]: "invalid" }).success
      ).toBe(false);
    }
  );

  it.each([
    ["draft with submitter", { submitted_by: submitted.submitted_by }],
    ["draft with submission time", { submitted_at: submitted.submitted_at }],
    ["submitted without metadata", { status: "submitted" }],
    ["unsupported status", { status: "approved" }],
    ["missing weather field", { weather: undefined }],
    ["empty weather object", { weather: {} }],
    ["invalid creation timestamp", { created_at: "yesterday" }],
    ["timestamp without timezone", { updated_at: "2026-09-19T12:00:00" }],
    ["invalid deletion timestamp", { deleted_at: "2026-09-19" }],
    ["deferred summary", { work_summary: "Work completed" }],
    ["deferred issues", { issues_notes: "None" }],
    ["deferred next steps", { next_steps: "Continue work" }]
  ])("rejects %s", (_label, fields) => {
    expect(dailyReportSchema.safeParse({ ...draft, ...fields }).success).toBe(
      false
    );
  });

  it.each([
    { submitted_by: null },
    { submitted_by: "invalid" },
    { submitted_at: null },
    { submitted_at: "2026-09-19" }
  ])("rejects incomplete or malformed submission metadata: %p", (fields) => {
    expect(
      dailyReportSchema.safeParse({ ...submitted, ...fields }).success
    ).toBe(false);
  });

  it("accepts update and soft-delete audit timestamps", () => {
    const archived = {
      ...submitted,
      updated_at: "2026-09-20T12:00:00Z",
      deleted_at: "2026-09-20T12:00:00Z"
    };

    expect(dailyReportSchema.parse(archived)).toEqual(archived);
  });
});
