import type { Task, UpdateTaskInput } from "@/features/tasks/types";

export function buildTaskCompletionInput(
  task: Task,
  completed: boolean
): UpdateTaskInput {
  return {
    description: task.description,
    due_date: task.due_date,
    priority: task.priority,
    project_id: task.project?.id ?? null,
    status: completed ? "completed" : "to_do",
    title: task.title
  };
}

export function getTaskDueLabel(
  dueDate: string | null,
  today = currentLocalDate()
) {
  if (!dueDate) return null;
  if (dueDate < today) return `Overdue · ${formatShortDate(dueDate)}`;
  if (dueDate === today) return "Due today";
  if (dueDate === addDays(today, 1)) return "Due tomorrow";
  return `Due ${formatShortDate(dueDate)}`;
}

function currentLocalDate() {
  const now = new Date();
  return dateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function addDays(date: string, days: number) {
  const parsed = new Date(`${date}T12:00:00`);
  parsed.setDate(parsed.getDate() + days);
  return dateKey(parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate());
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short"
  }).format(new Date(`${date}T12:00:00`));
}
