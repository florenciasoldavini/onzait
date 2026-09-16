import {
  buildContractorListQueryPlan,
  buildContractorSearchFilter
} from "@/features/contractors/repositories/contractor-list-query";

describe("contractor list query", () => {
  it("scopes active contractors to the workspace", () => {
    expect(
      buildContractorListQueryPlan({
        workspaceId: "workspace-1"
      }).filters
    ).toEqual([
      { column: "deleted_at", operator: "is", value: null },
      { column: "workspace_id", operator: "eq", value: "workspace-1" }
    ]);
  });

  it("keeps admins in the selected workspace", () => {
    expect(
      buildContractorListQueryPlan({
        workspaceId: "admin-1"
      }).filters
    ).toEqual([
      { column: "deleted_at", operator: "is", value: null },
      { column: "workspace_id", operator: "eq", value: "admin-1" }
    ]);
  });

  it("does not let a picker override the active workspace", () => {
    expect(
      buildContractorListQueryPlan({
        filters: { workspaceId: "owner-1" },
        workspaceId: "admin-1"
      }).filters
    ).toEqual([
      { column: "deleted_at", operator: "is", value: null },
      { column: "workspace_id", operator: "eq", value: "admin-1" }
    ]);
  });

  it("uses stable name ordering", () => {
    expect(
      buildContractorListQueryPlan({
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
    expect(buildContractorSearchFilter('A\\B"C')).toContain(
      'first_name.ilike."%A\\\\B\\"C%"'
    );
  });
});
