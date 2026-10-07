import { dailyReportAttendanceSnapshotSchema } from "@/features/daily-reports/schemas/daily-report-attendance.schema";
import type { DailyReportAttendanceSnapshot } from "@/features/daily-reports/types/daily-report-attendance";

const snapshot: DailyReportAttendanceSnapshot = {
  id: "11111111-1111-4111-8111-111111111111",
  daily_report_id: "22222222-2222-4222-8222-222222222222",
  captured_by: "33333333-3333-4333-8333-333333333333",
  captured_at: "2026-09-19T18:00:00-03:00",
  entries: [
    {
      attendance_id: "44444444-4444-4444-8444-444444444444",
      worker_id: "55555555-5555-4555-8555-555555555555",
      worker_name: "Alex Example",
      status: "present",
      hours_worked: 4.5,
      notes: "Left early due to rain."
    }
  ]
};

describe("daily report attendance snapshot schema", () => {
  it("accepts copied attendance and names without loading live records", () => {
    expect(dailyReportAttendanceSnapshotSchema.parse(snapshot)).toEqual(
      snapshot
    );
  });

  it("represents an explicitly captured empty register", () => {
    expect(
      dailyReportAttendanceSnapshotSchema.parse({ ...snapshot, entries: [] })
        .entries
    ).toEqual([]);
    expect(
      dailyReportAttendanceSnapshotSchema.safeParse({
        ...snapshot,
        entries: undefined
      }).success
    ).toBe(false);
  });

  it.each([null, 0])(
    "preserves an absent worker with %s hours",
    (hours_worked) => {
      expect(
        dailyReportAttendanceSnapshotSchema.safeParse({
          ...snapshot,
          entries: [{ ...snapshot.entries[0], status: "absent", hours_worked }]
        }).success
      ).toBe(true);
    }
  );

  it.each([
    [
      "duplicate worker",
      { attendance_id: "66666666-6666-4666-8666-666666666666" }
    ],
    [
      "duplicate source entry",
      { worker_id: "77777777-7777-4777-8777-777777777777" }
    ]
  ])("rejects %s in the same capture", (_label, fields) => {
    expect(
      dailyReportAttendanceSnapshotSchema.safeParse({
        ...snapshot,
        entries: [snapshot.entries[0], { ...snapshot.entries[0], ...fields }]
      }).success
    ).toBe(false);
  });

  it.each([
    ["blank historical name", { worker_name: "   " }],
    ["missing historical name", { worker_name: undefined }],
    ["absent with positive hours", { status: "absent", hours_worked: 2 }],
    ["negative hours", { hours_worked: -1 }],
    ["excessive hours", { hours_worked: 25 }],
    ["nonfinite hours", { hours_worked: Infinity }],
    ["unknown status", { status: "late" }],
    ["oversized notes", { notes: "x".repeat(2001) }],
    ["invalid worker reference", { worker_id: "invalid" }],
    ["invalid source reference", { attendance_id: "invalid" }]
  ])("rejects %s", (_label, fields) => {
    expect(
      dailyReportAttendanceSnapshotSchema.safeParse({
        ...snapshot,
        entries: [{ ...snapshot.entries[0], ...fields }]
      }).success
    ).toBe(false);
  });

  it.each(["id", "daily_report_id", "captured_by"])(
    "requires a UUID for %s",
    (field) => {
      expect(
        dailyReportAttendanceSnapshotSchema.safeParse({
          ...snapshot,
          [field]: "invalid"
        }).success
      ).toBe(false);
    }
  );

  it("requires a timestamp with a timezone", () => {
    expect(
      dailyReportAttendanceSnapshotSchema.safeParse({
        ...snapshot,
        captured_at: "2026-09-19T18:00:00"
      }).success
    ).toBe(false);
  });
});
