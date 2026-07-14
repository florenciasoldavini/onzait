import {
  requireSupabase,
  toRepositoryError
} from "@/features/projects/repositories/supabase.repository";
import { buildTaskListQueryPlan } from "@/features/tasks/query-builders";
import type {
  CreateTaskInput,
  Task,
  TaskFilters,
  UpdateTaskInput
} from "@/features/tasks/types";

type TaskRow = Omit<Task, "project"> & {
  project_id: string | null;
  projects: { name: string } | { name: string }[] | null;
};

export async function listTaskRows({
  filters,
  userId,
  userRole
}: {
  filters?: TaskFilters;
  userId: string;
  userRole: "admin" | "user";
}) {
  const client = requireSupabase();
  const plan = buildTaskListQueryPlan({ filters, userId, userRole });
  let query = client.from("tasks").select("*, projects(name)");

  for (const filter of plan.filters) {
    if (filter.operator === "eq")
      query = query.eq(filter.column, filter.value as string);
    if (filter.operator === "in")
      query = query.in(filter.column, filter.value as string[]);
    if (filter.operator === "is")
      query = query.is(filter.column, filter.value as null);
    if (filter.operator === "ilike")
      query = query.ilike(filter.column, filter.value as string);
  }

  const { data, error } = await query.order(plan.order.column, {
    ascending: plan.order.ascending,
    nullsFirst: plan.order.nullsFirst
  });

  if (error) throw toRepositoryError(error);
  return ((data ?? []) as TaskRow[]).map(mapTaskRow);
}

export async function getTaskRow(taskId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("tasks")
    .select("*, projects(name)")
    .eq("id", taskId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw toRepositoryError(error);
  return data ? mapTaskRow(data as TaskRow) : null;
}

export async function insertTaskRow(input: CreateTaskInput) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("tasks")
    .insert(input)
    .select("*, projects(name)")
    .single();

  if (error) throw toRepositoryError(error);
  return mapTaskRow(data as TaskRow);
}

export async function updateTaskRow(taskId: string, input: UpdateTaskInput) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("tasks")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .is("deleted_at", null)
    .select("*, projects(name)")
    .single();

  if (error) throw toRepositoryError(error);
  return mapTaskRow(data as TaskRow);
}

export async function softDeleteTaskRow(taskId: string) {
  const client = requireSupabase();
  const { error } = await client
    .from("tasks")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", taskId)
    .is("deleted_at", null);

  if (error) throw toRepositoryError(error);
}

function mapTaskRow(row: TaskRow): Task {
  const project = Array.isArray(row.projects) ? row.projects[0] : row.projects;
  const { project_id, projects: _projects, ...task } = row;
  return {
    ...task,
    project: project_id
      ? {
          id: project_id,
          name: project?.name ?? "Unknown project"
        }
      : null
  };
}
