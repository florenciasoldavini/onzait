# Attendance

Purpose: define attendance records and their relationship to daily reports
Source of truth for: attendance fields, validation, report linking, and capture semantics
Update when: attendance fields, persistence, or report submission behavior changes
Last reviewed: 2026-09-19

## Current Scope

`features/attendance/types/attendance.ts` owns the editable `Attendance` contract,
validated by `AttendanceSchema`. These replace the unused planned `date: Date`
and `present: boolean` fields with `attendance_date` and `status`. No callers or
persisted tables used the old contract.

The contract is shared by web, iOS, and Android. This change provides models,
validation, and tests only, not UI, queries, submission workflows, or persistence.

## Register Fields

- UUIDs: `id`, `project_id`, `workspace_id`, `worker_id`, and `created_by`.
- `attendance_date`: site-local calendar date in `YYYY-MM-DD` form.
- `status`: explicitly `present` or `absent`. No record means not recorded, not
  absent. Only mark absence for workers expected at that project.
- `hours_worked`: null when unrecorded, or decimal hours from 0 through 24.
  Absent workers may have only null or zero hours. Partial days are present.
- `notes`: null or trimmed text up to 2,000 characters; blank text becomes null.
- `created_at`: timestamp; `updated_at` and `deleted_at`: nullable timestamps.
  All timestamps require UTC or an explicit offset.

Weather never automatically sets attendance. Being present does not mean work
continued throughout the day. The 24-hour bound is per record; this schema does
not reconcile hours across projects or model daylight-saving shift durations.

## Linking to Daily Reports

Live attendance has no `daily_report_id`. A draft report's Crew section will query
active attendance where `project_id` matches the report's project and
`attendance_date` matches `report_date`. Attendance may exist before the report,
and deleting a report must not delete the register.

Future database constraints must ensure one active report per project/date and
one active attendance entry per worker/project/date. A worker may attend multiple
projects on the same day. Workspace scope must match the project, and selected
workers must belong to the appropriate organization. Authorization must use
project capabilities and RLS; `created_by` is immutable audit metadata only.

## Submitted Report Snapshots

`features/daily-reports/types/daily-report-attendance.ts` owns
`DailyReportAttendanceSnapshot`, validated by
`dailyReportAttendanceSnapshotSchema` in that feature.

Each capture includes its own `id`, `daily_report_id`, `captured_by`, `captured_at`,
and `entries`. Each entry copies `attendance_id`, `worker_id`, `worker_name`,
`status`, `hours_worked`, and `notes`. A worker and source attendance entry may
appear only once per capture. An empty entries array means attendance was
captured with zero records; it is distinct from no capture.

Submitted reports render copied values, without resolving current worker names
or attendance values. Soft-deleting or correcting live records must not alter a
capture. Source IDs are provenance, not instructions to load current values.

When submission is implemented, a trusted transaction must verify project/date
and workspace scope, read active attendance and worker names consistently, derive
capture metadata from the submitting user and server time, persist the snapshot,
and submit the report atomically. Do not accept historical copies from the client.

Reopening preserves prior captures. Every resubmission creates a new snapshot ID;
future append-only submission history must reference that exact snapshot ID to
identify the capture for each submission. Enforce snapshot immutability and
retention at the database boundary, including protection against cascading
source-record deletion. The current schemas cannot enforce these cross-record or
lifecycle rules.

Clock-in/out, shifts, overtime, payroll, contractor billing, and aggregate-hour
reconciliation are deferred.
