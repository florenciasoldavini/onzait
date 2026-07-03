import type { ProjectFilters } from "@/features/projects/types";
import { normalizeProjectFilters } from "@/features/projects/validation";

export interface ProjectListQueryPlan {
  filters: {
    column: string;
    operator: "eq" | "ilike" | "is";
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

  if (normalized.status) {
    queryFilters.push({
      column: "status",
      operator: "eq",
      value: normalized.status
    });
  }

  if (normalized.phase) {
    queryFilters.push({
      column: "phase",
      operator: "eq",
      value: normalized.phase
    });
  }

  if (normalized.projectType) {
    queryFilters.push({
      column: "project_type",
      operator: "eq",
      value: normalized.projectType
    });
  }

  if (normalized.buildingType) {
    queryFilters.push({
      column: "building_type",
      operator: "eq",
      value: normalized.buildingType
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
    order: { ascending: false, column: "created_at" }
  };
}
