import {
  buildWorkerListQueryPlan,
  buildWorkerSearchFilter
} from "@/features/workers/repositories/worker-list-query";

describe("worker list query", () => {
  it("scopes active workers to the workspace", () => {
    expect(
      buildWorkerListQueryPlan({
        workspaceId: "workspace-1"
      }).filters
    ).toEqual([
      { column: "deleted_at", operator: "is", value: null },
      { column: "workspace_id", operator: "eq", value: "workspace-1" }
    ]);
  });

  it("applies contractor and any-of trade filters", () => {
    expect(
      buildWorkerListQueryPlan({
        filters: {
          contractorId: "contractor-1",
          tradeCategoryIds: ["trade-2", "trade-1"]
        },
        workspaceId: "workspace-1"
      }).filters
    ).toEqual([
      { column: "deleted_at", operator: "is", value: null },
      { column: "workspace_id", operator: "eq", value: "workspace-1" },
      {
        column: "contractor_id",
        operator: "eq",
        value: "contractor-1"
      },
      {
        column: "trade_filter.trade_category_id",
        operator: "in",
        value: ["trade-1", "trade-2"]
      }
    ]);
  });

  it("uses stable name ordering", () => {
    expect(
      buildWorkerListQueryPlan({
        filters: { sort: "name_desc" },
        workspaceId: "workspace-1"
      }).orders
    ).toEqual([
      { ascending: false, column: "first_name" },
      { ascending: false, column: "last_name" },
      { ascending: true, column: "id" }
    ]);
  });

  it("escapes search control characters", () => {
    expect(buildWorkerSearchFilter('A\\B"C')).toContain(
      'first_name.ilike."%A\\\\B\\"C%"'
    );
  });
});
