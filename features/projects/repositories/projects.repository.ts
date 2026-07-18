import { buildProjectListQueryPlan } from "@/features/projects/query-builders";
import {
  requireSupabase,
  toRepositoryError
} from "@/features/projects/repositories/supabase.repository";
import type {
  CreateProjectInput,
  Project,
  ProjectFilters,
  UpdateProjectInput
} from "@/features/projects/types";

export async function listProjectRows({
  filters,
  userId,
  userRole
}: {
  filters?: ProjectFilters;
  userId: string;
  userRole: "admin" | "user";
}) {
  const client = requireSupabase();
  const plan = buildProjectListQueryPlan({ filters, userId, userRole });
  let query = client.from("projects").select("*");

  for (const filter of plan.filters) {
    if (filter.operator === "eq") {
      query = query.eq(filter.column, filter.value as string);
    } else if (filter.operator === "in") {
      query = query.in(filter.column, filter.value as string[]);
    } else if (filter.operator === "is") {
      query = query.is(filter.column, filter.value as null);
    } else if (filter.operator === "ilike") {
      query = query.ilike(filter.column, filter.value as string);
    }
  }

  const { data, error } = await query.order(plan.order.column, {
    ascending: plan.order.ascending
  });

  if (error) {
    throw toRepositoryError(error);
  }

  return (data ?? []) as Project[];
}

export async function getProjectRow(projectId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw toRepositoryError(error);
  }

  return data ? (data as Project) : null;
}

export async function insertProjectRow(input: CreateProjectInput) {
  const client = requireSupabase();
  const {
    data: { user },
    error: authError
  } = await client.auth.getUser();

  if (authError) {
    throw toRepositoryError(authError);
  }

  if (!user) {
    throw new Error("You must be signed in to save projects.");
  }

  const { data, error } = await client
    .from("projects")
    .insert({ ...input, owner_id: user.id })
    .select()
    .single();

  if (error) {
    throw toRepositoryError(error);
  }

  return data as Project;
}

export async function updateProjectRow(
  projectId: string,
  input: UpdateProjectInput
) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("projects")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    throw toRepositoryError(error);
  }

  return data as Project;
}

export async function replaceProjectCoverPath({
  expectedCurrentPath,
  newPath,
  projectId
}: {
  expectedCurrentPath: string | null;
  newPath: string;
  projectId: string;
}) {
  const client = requireSupabase();
  let query = client
    .from("projects")
    .update({
      cover_image_path: newPath,
      updated_at: new Date().toISOString()
    })
    .eq("id", projectId)
    .is("deleted_at", null);

  query = expectedCurrentPath
    ? query.eq("cover_image_path", expectedCurrentPath)
    : query.is("cover_image_path", null);

  const { data, error } = await query.select().maybeSingle();

  if (error) {
    throw toRepositoryError(error);
  }

  if (!data) {
    throw new Error(
      "The project cover changed while this upload was in progress. Refresh and try again."
    );
  }

  return data as Project;
}

export async function softDeleteProjectRow(projectId: string) {
  const client = requireSupabase();
  const { error } = await client
    .from("projects")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", projectId)
    .is("deleted_at", null);

  if (error) {
    throw toRepositoryError(error);
  }
}
