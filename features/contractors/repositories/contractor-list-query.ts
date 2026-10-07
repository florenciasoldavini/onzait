import { normalizeContractorFilters } from "@/features/contractors/schemas/contractor.schema";
import type {
  ContractorFilters,
  ContractorSort
} from "@/features/contractors/types/contractor";

export interface ContractorListQueryPlan {
  filters: {
    column: string;
    operator: "eq" | "is" | "or";
    value: string | null;
  }[];
  orders: { ascending: boolean; column: string }[];
}

export function buildContractorListQueryPlan({
  filters,
  workspaceId
}: {
  filters?: ContractorFilters;
  workspaceId: string;
}): ContractorListQueryPlan {
  const normalized = normalizeContractorFilters(filters);
  const queryFilters: ContractorListQueryPlan["filters"] = [
    { column: "deleted_at", operator: "is", value: null }
  ];

  if (workspaceId) {
    queryFilters.push({
      column: "workspace_id",
      operator: "eq",
      value: workspaceId
    });
  }

  if (normalized.query) {
    queryFilters.push({
      column: "",
      operator: "or",
      value: buildContractorSearchFilter(normalized.query)
    });
  }

  return {
    filters: queryFilters,
    orders: getContractorOrders(normalized.sort)
  };
}

export function buildContractorSearchFilter(query: string) {
  const escaped = query.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
  const pattern = `"%${escaped}%"`;

  return [
    `first_name.ilike.${pattern}`,
    `last_name.ilike.${pattern}`,
    `phone_number.ilike.${pattern}`,
    `email.ilike.${pattern}`
  ].join(",");
}

function getContractorOrders(sort: ContractorSort) {
  if (sort.startsWith("name")) {
    return [
      { ascending: sort === "name_asc", column: "first_name" },
      { ascending: sort === "name_asc", column: "last_name" },
      { ascending: true, column: "id" }
    ];
  }

  return [
    { ascending: sort === "created_asc", column: "created_at" },
    { ascending: true, column: "id" }
  ];
}
