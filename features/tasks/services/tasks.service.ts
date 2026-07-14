import {
  getTaskRow,
  insertTaskRow,
  listTaskRows,
  softDeleteTaskRow,
  updateTaskRow
} from "@/features/tasks/repositories/tasks.repository";
import type {
  CreateTaskInput,
  TaskFilters,
  UpdateTaskInput
} from "@/features/tasks/types";

export function listTasks(options: {
  filters?: TaskFilters;
  userId: string;
  userRole: "admin" | "user";
}) {
  return listTaskRows(options);
}

export function getTask(taskId: string) {
  return getTaskRow(taskId);
}

export function createTask(input: CreateTaskInput) {
  return insertTaskRow(input);
}

export function updateTask(taskId: string, input: UpdateTaskInput) {
  return updateTaskRow(taskId, input);
}

export function softDeleteTask(taskId: string) {
  return softDeleteTaskRow(taskId);
}
