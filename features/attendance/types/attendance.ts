export type AttendanceStatus = "present" | "absent";

/** Editable register entry, linked to a report by project and local date. */
export interface Attendance {
  id: string;
  project_id: string;
  /** Must match the project's workspace. */
  workspace_id: string;
  worker_id: string;
  /** Site-local calendar date (YYYY-MM-DD), not a timestamp. */
  attendance_date: string;
  status: AttendanceStatus;
  /** Null means unrecorded; absent entries allow only null or zero. */
  hours_worked: number | null;
  notes: string | null;
  /** Immutable audit metadata, not an authorization key. */
  created_by: string;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}
