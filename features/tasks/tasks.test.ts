import { buildTaskListQueryPlan } from "@/features/tasks/query-builders";
import {
  buildTaskCompletionInput,
  getTaskDueLabel
} from "@/features/tasks/presentation";
import type { Task, TaskFormValues } from "@/features/tasks/types";
import {
  normalizeTaskFilters,
  taskFormSchema,
  toCreateTaskInput
} from "@/features/tasks/validation";
import { describe, expect, it } from "vitest";

const validValues: TaskFormValues = {
  description: "Confirm the reinforcement before the pour.",
  due_date: "2026-08-15",
  priority: "high",
  project_id: "10000000-0000-4000-8000-000000000001",
  status: "in_progress",
  title: "Review foundation inspection"
};

const task: Task = {
  completed_at: null,
  created_at: "2026-07-13T12:00:00",
  deleted_at: null,
  description: "Check the reinforcement.",
  due_date: "2026-07-14",
  id: "20000000-0000-4000-8000-000000000001",
  owner_id: "30000000-0000-4000-8000-000000000001",
  priority: "high",
  project: {
    id: "10000000-0000-4000-8000-000000000001",
    name: "North tower"
  },
  status: "in_progress",
  title: "Review foundation inspection",
  updated_at: null
};

describe("task validation", () => {
  it("normalizes optional values for persistence", () => {
    expect(
      toCreateTaskInput({ ...validValues, description: "  ", due_date: "" })
    ).toMatchObject({
      description: null,
      due_date: null,
      title: "Review foundation inspection"
    });
  });

  it("requires a valid title", () => {
    const result = taskFormSchema.safeParse({
      ...validValues,
      title: " "
    });

    expect(result.success).toBe(false);
  });

  it("allows standalone tasks without a project", () => {
    const values = { ...validValues, project_id: "" };
    const result = taskFormSchema.safeParse(values);

    expect(result.success).toBe(true);
    expect(toCreateTaskInput(values).project_id).toBeNull();
  });

  it("rejects malformed due dates", () => {
    const result = taskFormSchema.safeParse({
      ...validValues,
      due_date: "15/08/2026"
    });

    expect(result.success).toBe(false);
  });
});

describe("task checklist presentation", () => {
  it("builds a complete update without losing editable task data", () => {
    expect(buildTaskCompletionInput(task, true)).toEqual({
      description: task.description,
      due_date: task.due_date,
      priority: task.priority,
      project_id: task.project?.id,
      status: "completed",
      title: task.title
    });
  });

  it("returns a completed task to the to-do state", () => {
    expect(
      buildTaskCompletionInput({ ...task, status: "completed" }, false)
    ).toMatchObject({ status: "to_do" });
  });

  it("uses useful relative due-date labels", () => {
    expect(getTaskDueLabel("2026-07-12", "2026-07-13")).toContain("Overdue");
    expect(getTaskDueLabel("2026-07-13", "2026-07-13")).toBe("Due today");
    expect(getTaskDueLabel("2026-07-14", "2026-07-13")).toBe("Due tomorrow");
  });
});

describe("task filters and query planning", () => {
  it("normalizes empty filters", () => {
    expect(normalizeTaskFilters({ projectId: "all", query: "  " })).toEqual({
      priorities: null,
      projectId: null,
      query: null,
      sort: "created_desc",
      statuses: null
    });
  });

  it("adds owner and soft-delete filters for normal users", () => {
    const plan = buildTaskListQueryPlan({
      filters: { statuses: ["to_do"] },
      userId: "user-id",
      userRole: "user"
    });

    expect(plan.filters).toContainEqual({
      column: "owner_id",
      operator: "eq",
      value: "user-id"
    });
    expect(plan.filters).toContainEqual({
      column: "deleted_at",
      operator: "is",
      value: null
    });
  });

  it("does not add owner filtering for admins", () => {
    const plan = buildTaskListQueryPlan({
      filters: {},
      userId: "admin-id",
      userRole: "admin"
    });

    expect(plan.filters).not.toContainEqual({
      column: "owner_id",
      operator: "eq",
      value: "admin-id"
    });
  });

  it("plans project, status, priority, and search filters", () => {
    const plan = buildTaskListQueryPlan({
      filters: {
        priorities: ["urgent"],
        projectId: "project-id",
        query: "inspection",
        statuses: ["blocked", "in_progress"]
      },
      userId: "user-id",
      userRole: "user"
    });

    expect(plan.filters).toEqual(
      expect.arrayContaining([
        { column: "project_id", operator: "eq", value: "project-id" },
        {
          column: "status",
          operator: "in",
          value: ["blocked", "in_progress"]
        },
        { column: "priority", operator: "in", value: ["urgent"] },
        { column: "title", operator: "ilike", value: "%inspection%" }
      ])
    );
  });

  it("filters standalone tasks by a null project", () => {
    const plan = buildTaskListQueryPlan({
      filters: { projectId: "unassigned" },
      userId: "user-id",
      userRole: "user"
    });

    expect(plan.filters).toContainEqual({
      column: "project_id",
      operator: "is",
      value: null
    });
  });
});
