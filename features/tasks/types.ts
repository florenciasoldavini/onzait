import type {
  TASK_PRIORITIES,
  TASK_STATUSES
} from "@/features/tasks/constants";

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskSort =
  | "created_desc"
  | "due_asc"
  | "priority_desc"
  | "title_asc";

export interface Task {
  completed_at: string | null;
  created_at: string;
  deleted_at: string | null;
  description: string | null;
  due_date: string | null;
  id: string;
  owner_id: string;
  priority: TaskPriority;
  project: {
    id: string;
    name: string;
  } | null;
  status: TaskStatus;
  title: string;
  updated_at: string | null;
}

export interface TaskFilters {
  priorities?: TaskPriority[];
  projectId?: string | "all" | "unassigned";
  query?: string;
  sort?: TaskSort;
  statuses?: TaskStatus[];
}

export interface TaskFormValues {
  description: string;
  due_date: string;
  priority: TaskPriority;
  project_id: string;
  status: TaskStatus;
  title: string;
}

export interface CreateTaskInput {
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  project_id: string | null;
  status: TaskStatus;
  title: string;
}

export type UpdateTaskInput = CreateTaskInput;
