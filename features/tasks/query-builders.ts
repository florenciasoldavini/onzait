import type { TaskFilters } from "@/features/tasks/types";
import { normalizeTaskFilters } from "@/features/tasks/validation";

interface TaskQueryFilter {
  column: string;
  operator: "eq" | "ilike" | "in" | "is";
  value: string | string[] | null;
}

export function buildTaskListQueryPlan({
  filters,
  userId,
  userRole
}: {
  filters?: TaskFilters;
  userId: string;
  userRole: "admin" | "user";
}) {
  const normalized = normalizeTaskFilters(filters);
  const queryFilters: TaskQueryFilter[] = [
    { column: "deleted_at", operator: "is", value: null }
  ];

  if (userRole !== "admin") {
    queryFilters.push({ column: "owner_id", operator: "eq", value: userId });
  }

  if (normalized.projectId === "unassigned") {
    queryFilters.push({
      column: "project_id",
      operator: "is",
      value: null
    });
  } else if (normalized.projectId) {
    queryFilters.push({
      column: "project_id",
      operator: "eq",
      value: normalized.projectId
    });
  }

  if (normalized.statuses) {
    queryFilters.push({
      column: "status",
      operator: "in",
      value: normalized.statuses
    });
  }

  if (normalized.priorities) {
    queryFilters.push({
      column: "priority",
      operator: "in",
      value: normalized.priorities
    });
  }

  if (normalized.query) {
    queryFilters.push({
      column: "title",
      operator: "ilike",
      value: `%${normalized.query}%`
    });
  }

  const order = (() => {
    switch (normalized.sort) {
      case "due_asc":
        return { ascending: true, column: "due_date", nullsFirst: false };
      case "priority_desc":
        return { ascending: false, column: "priority", nullsFirst: false };
      case "title_asc":
        return { ascending: true, column: "title", nullsFirst: false };
      default:
        return { ascending: false, column: "created_at", nullsFirst: false };
    }
  })();

  return { filters: queryFilters, order };
}
