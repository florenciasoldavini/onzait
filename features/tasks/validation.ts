import { TASK_PRIORITIES, TASK_STATUSES } from "@/features/tasks/constants";
import type {
  CreateTaskInput,
  TaskFilters,
  TaskFormValues,
  UpdateTaskInput
} from "@/features/tasks/types";
import { z } from "zod";

export const taskFormSchema = z.object({
  description: z
    .string()
    .max(3000, "Description must be 3000 characters or less."),
  due_date: z
    .string()
    .trim()
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "Use YYYY-MM-DD."
    }),
  priority: z.enum(TASK_PRIORITIES),
  project_id: z.union([z.literal(""), z.string().uuid("Select a project.")]),
  status: z.enum(TASK_STATUSES),
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters.")
    .max(160)
});

export function toCreateTaskInput(values: TaskFormValues): CreateTaskInput {
  return {
    description: normalizeNullableText(values.description),
    due_date: normalizeNullableText(values.due_date),
    priority: values.priority,
    project_id: normalizeNullableText(values.project_id),
    status: values.status,
    title: values.title.trim()
  };
}

export function toUpdateTaskInput(values: TaskFormValues): UpdateTaskInput {
  return toCreateTaskInput(values);
}

export function normalizeTaskFilters(filters: TaskFilters = {}) {
  return {
    priorities: filters.priorities?.length ? filters.priorities : null,
    projectId:
      filters.projectId && filters.projectId !== "all"
        ? filters.projectId
        : null,
    query: normalizeNullableText(filters.query ?? ""),
    sort: filters.sort ?? "created_desc",
    statuses: filters.statuses?.length ? filters.statuses : null
  };
}

function normalizeNullableText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}
