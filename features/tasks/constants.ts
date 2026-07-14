export const TASK_STATUSES = [
  "to_do",
  "in_progress",
  "blocked",
  "completed"
] as const;

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export const TASK_STATUS_LABELS = {
  blocked: "Blocked",
  completed: "Completed",
  in_progress: "In progress",
  to_do: "To do"
} as const;

export const TASK_PRIORITY_LABELS = {
  high: "High",
  low: "Low",
  medium: "Medium",
  urgent: "Urgent"
} as const;
