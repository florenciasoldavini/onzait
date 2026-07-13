import type { ProjectFilters } from "@/features/projects/types";
import { normalizeProjectFilters } from "@/features/projects/validation";

export interface ProjectListQueryPlan {
  filters: {
    column: string;
    operator: "eq" | "ilike" | "in" | "is";
    value: unknown;
  }[];
  order: { ascending: boolean; column: string };
}

export function buildProjectListQueryPlan({
  filters,
  userId,
  userRole
}: {
  filters?: ProjectFilters;
  userId: string;
  userRole: "admin" | "user";
}): ProjectListQueryPlan {
  const normalized = normalizeProjectFilters(filters);
  const queryFilters: ProjectListQueryPlan["filters"] = [
    { column: "deleted_at", operator: "is", value: null }
  ];

  if (userRole !== "admin") {
    queryFilters.push({ column: "owner_id", operator: "eq", value: userId });
  }

  if (normalized.statuses) {
    queryFilters.push({
      column: "status",
      operator: "in",
      value: normalized.statuses
    });
  }

  if (normalized.phases) {
    queryFilters.push({
      column: "phase",
      operator: "in",
      value: normalized.phases
    });
  }

  if (normalized.projectTypes) {
    queryFilters.push({
      column: "project_type",
      operator: "in",
      value: normalized.projectTypes
    });
  }

  if (normalized.buildingTypes) {
    queryFilters.push({
      column: "building_type",
      operator: "in",
      value: normalized.buildingTypes
    });
  }

  if (normalized.query) {
    queryFilters.push({
      column: "name",
      operator: "ilike",
      value: `%${normalized.query}%`
    });
  }

  return {
    filters: queryFilters,
    order: {
      ascending: normalized.sort.endsWith("_asc"),
      column: normalized.sort.startsWith("name") ? "name" : "created_at"
    }
  };
}
