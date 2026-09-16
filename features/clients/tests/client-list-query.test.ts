import {
  buildClientListQueryPlan,
  buildClientSearchFilter
} from "@/features/clients/repositories/client-list-query";

describe("client list query", () => {
  it("scopes clients to the active workspace", () => {
    const plan = buildClientListQueryPlan({
      filters: { workspaceId: "other-user" },
      workspaceId: "current-user"
    });

    expect(plan.filters).toContainEqual({
      column: "workspace_id",
      operator: "eq",
      value: "current-user"
    });
  });

  it("does not let a picker override the active workspace", () => {
    const plan = buildClientListQueryPlan({
      filters: { workspaceId: "project-owner" },
      workspaceId: "admin-user"
    });

    expect(plan.filters).toContainEqual({
      column: "workspace_id",
      operator: "eq",
      value: "admin-user"
    });
  });

  it("uses deterministic alphabetical ordering", () => {
    const plan = buildClientListQueryPlan({
      filters: { sort: "name_desc" },
      workspaceId: "current-user"
    });

    expect(plan.orders).toEqual([
      { ascending: false, column: "first_name" },
      { ascending: false, column: "last_name" },
      { ascending: true, column: "id" }
    ]);
  });

  it("searches every contact field and escapes quotes", () => {
    expect(buildClientSearchFilter('Ada "A"')).toContain(
      'first_name.ilike."%Ada \\"A\\"%"'
    );
    expect(buildClientSearchFilter("Ada")).toContain("email.ilike.");
  });
});
