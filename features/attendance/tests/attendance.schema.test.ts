import { AttendanceSchema } from "@/features/attendance/schemas/attendance.schema";
import type { Attendance } from "@/features/attendance/types/attendance";

const entry: Attendance = {
  id: "11111111-1111-4111-8111-111111111111",
  project_id: "22222222-2222-4222-8222-222222222222",
  workspace_id: "33333333-3333-4333-8333-333333333333",
  worker_id: "44444444-4444-4444-8444-444444444444",
  created_by: "55555555-5555-4555-8555-555555555555",
  attendance_date: "2026-09-19",
  status: "present",
  hours_worked: null,
  notes: null,
  created_at: "2026-09-19T12:00:00Z",
  updated_at: null,
  deleted_at: null
};

describe("attendance schema", () => {
  it("allows attendance before a daily report exists", () => {
    expect(AttendanceSchema.parse(entry)).toEqual(entry);
  });

  it.each([null, 0, 4.5, 24])(
    "accepts present workers with %s hours",
    (hours_worked) => {
      expect(
        AttendanceSchema.parse({ ...entry, hours_worked }).hours_worked
      ).toBe(hours_worked);
    }
  );

  it.each([null, 0])("accepts absent workers with %s hours", (hours_worked) => {
    expect(
      AttendanceSchema.safeParse({ ...entry, status: "absent", hours_worked })
        .success
    ).toBe(true);
  });

  it("normalizes optional notes and accepts leap days and offset timestamps", () => {
    expect(
      AttendanceSchema.parse({
        ...entry,
        notes: "   ",
        attendance_date: "2024-02-29",
        updated_at: "2026-09-19T15:00:00-03:00"
      })
    ).toMatchObject({ notes: null, attendance_date: "2024-02-29" });
    expect(
      AttendanceSchema.parse({ ...entry, notes: "  Left early.  " }).notes
    ).toBe("Left early.");
  });

  it.each([
    ["absent with worked hours", { status: "absent", hours_worked: 1 }],
    ["negative hours", { hours_worked: -1 }],
    ["more than a day", { hours_worked: 24.5 }],
    ["infinite hours", { hours_worked: Infinity }],
    ["NaN hours", { hours_worked: NaN }],
    ["string hours", { hours_worked: "8" }],
    ["unrecorded status", { status: undefined }],
    ["unsupported status", { status: "late" }],
    ["invalid date", { attendance_date: "2026-02-29" }],
    ["timestamp as date", { attendance_date: "2026-09-19T00:00:00Z" }],
    ["oversized notes", { notes: "x".repeat(2001) }],
    ["report foreign key", { daily_report_id: entry.id }],
    ["legacy presence", { present: true }],
    ["invalid audit timestamp", { created_at: "2026-09-19" }]
  ])("rejects %s", (_label, fields) => {
    expect(AttendanceSchema.safeParse({ ...entry, ...fields }).success).toBe(
      false
    );
  });

  it.each(["id", "project_id", "workspace_id", "worker_id", "created_by"])(
    "requires a UUID for %s",
    (field) => {
      expect(
        AttendanceSchema.safeParse({ ...entry, [field]: "invalid" }).success
      ).toBe(false);
    }
  );
});
