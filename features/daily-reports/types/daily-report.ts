import type { DailyReportWeather } from "@/features/daily-reports/types/weather";

interface DailyReportBase {
  id: string;
  project_id: string;
  /** Must match the project's workspace; never an authorization substitute. */
  workspace_id: string;
  /** Site-local calendar date (YYYY-MM-DD), not a timestamp. */
  report_date: string;
  /** Null means not recorded, rather than clear weather or no work impact. */
  weather: DailyReportWeather | null;
  /** Immutable author audit metadata, not an ownership key. */
  created_by: string;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

/** Current submission metadata is cleared when a report is explicitly reopened. */
export type DailyReport = DailyReportBase &
  (
    | {
        status: "draft";
        submitted_by: null;
        submitted_at: null;
      }
    | {
        status: "submitted";
        submitted_by: string;
        submitted_at: string;
      }
  );

export type DailyReportStatus = DailyReport["status"];
