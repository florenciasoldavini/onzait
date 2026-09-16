import {
  buildSupplierListQueryPlan,
  buildSupplierSearchFilter
} from "@/features/suppliers/repositories/supplier-list-query";

describe("supplier list query", () => {
  it("scopes active suppliers to the workspace", () => {
    expect(
      buildSupplierListQueryPlan({
        workspaceId: "workspace-1"
      }).filters
    ).toEqual([
      { column: "deleted_at", operator: "is", value: null },
      { column: "workspace_id", operator: "eq", value: "workspace-1" }
    ]);
  });

  it("keeps admins in the selected workspace", () => {
    expect(
      buildSupplierListQueryPlan({
        workspaceId: "admin-1"
      }).filters
    ).toEqual([
      { column: "deleted_at", operator: "is", value: null },
      { column: "workspace_id", operator: "eq", value: "admin-1" }
    ]);
  });

  it("uses stable name ordering", () => {
    expect(
      buildSupplierListQueryPlan({
        filters: { sort: "name_desc" },
        workspaceId: "workspace-1"
      }).orders
    ).toEqual([
      { ascending: false, column: "name" },
      { ascending: true, column: "id" }
    ]);
  });

  it("searches all summary fields and escapes control characters", () => {
    const search = buildSupplierSearchFilter('A\\B"C');
    expect(search).toContain('name.ilike."%A\\\\B\\"C%"');
    expect(search).toContain("website_url.ilike.");
    expect(search).toContain("address.ilike.");
    expect(search).not.toContain("notes.ilike.");
  });
});
