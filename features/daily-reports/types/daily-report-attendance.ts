import type { AttendanceStatus } from "@/features/attendance/types/attendance";

/** Copied values; rendering history must not resolve current worker names. */
export interface DailyReportAttendanceEntry {
  attendance_id: string;
  worker_id: string;
  worker_name: string;
  status: AttendanceStatus;
  hours_worked: number | null;
  notes: string | null;
}

/** One immutable capture per submission; a resubmission creates a new snapshot. */
export interface DailyReportAttendanceSnapshot {
  id: string;
  daily_report_id: string;
  captured_by: string;
  captured_at: string;
  /** An empty capture is valid and distinct from no snapshot. */
  entries: DailyReportAttendanceEntry[];
}
