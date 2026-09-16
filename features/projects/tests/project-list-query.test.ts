import { buildProjectListQueryPlan } from "@/features/projects/repositories/project-list-query";

describe("project list query", () => {
  it("scopes workspace project lists explicitly", () => {
    const plan = buildProjectListQueryPlan({
      filters: { status: "in_progress" },
      workspaceId: "user-id"
    });

    expect(plan.filters).toContainEqual({
      column: "deleted_at",
      operator: "is",
      value: null
    });
    expect(plan.filters).toContainEqual({
      column: "workspace_id",
      operator: "eq",
      value: "user-id"
    });
  });

  it("filters linked projects by client", () => {
    const plan = buildProjectListQueryPlan({
      filters: { clientId: "client-id" },
      workspaceId: "user-id"
    });

    expect(plan.filters).toContainEqual({
      column: "client_id",
      operator: "eq",
      value: "client-id"
    });
  });

  it("keeps global admins inside the selected workspace context", () => {
    const plan = buildProjectListQueryPlan({
      filters: { status: "in_progress" },
      workspaceId: "admin-id"
    });

    expect(plan.filters).toContainEqual({
      column: "workspace_id",
      operator: "eq",
      value: "admin-id"
    });
  });

  it("plans multi-select category filters", () => {
    const plan = buildProjectListQueryPlan({
      filters: {
        phases: ["design", "construction"],
        projectTypes: ["new_build", "renovation"],
        statuses: ["planned", "in_progress"]
      },
      workspaceId: "user-id"
    });

    expect(plan.filters).toContainEqual({
      column: "status",
      operator: "in",
      value: ["planned", "in_progress"]
    });
    expect(plan.filters).toContainEqual({
      column: "phase",
      operator: "in",
      value: ["design", "construction"]
    });
    expect(plan.filters).toContainEqual({
      column: "project_type",
      operator: "in",
      value: ["new_build", "renovation"]
    });
  });

  it("sorts by newest creation by default", () => {
    const plan = buildProjectListQueryPlan({
      filters: {},
      workspaceId: "user-id"
    });

    expect(plan.orders).toEqual([
      { ascending: false, column: "created_at" },
      { ascending: true, column: "id" }
    ]);
  });

  it("sorts alphabetically ascending when requested", () => {
    const plan = buildProjectListQueryPlan({
      filters: { sort: "name_asc" },
      workspaceId: "user-id"
    });

    expect(plan.orders).toEqual([
      { ascending: true, column: "name" },
      { ascending: true, column: "id" }
    ]);
  });

  it("sorts alphabetically descending when requested", () => {
    const plan = buildProjectListQueryPlan({
      filters: { sort: "name_desc" },
      workspaceId: "user-id"
    });

    expect(plan.orders).toEqual([
      { ascending: false, column: "name" },
      { ascending: true, column: "id" }
    ]);
  });

  it("sorts creation ascending when requested", () => {
    const plan = buildProjectListQueryPlan({
      filters: { sort: "created_asc" },
      workspaceId: "user-id"
    });

    expect(plan.orders).toEqual([
      { ascending: true, column: "created_at" },
      { ascending: true, column: "id" }
    ]);
  });
});
