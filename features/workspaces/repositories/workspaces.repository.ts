import {
  requireSupabase,
  toRepositoryError
} from "@/infrastructure/supabase/repository";
import type {
  CreateOrganizationInput,
  CreateOrganizationResult,
  UpdateOrganizationInput,
  WorkspacePage
} from "@/features/workspaces/types/workspace";

export async function listMyWorkspaceRows(): Promise<WorkspacePage> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("list_my_workspaces", {
    p_limit: 50,
    p_offset: 0
  });

  if (error) {
    throw toRepositoryError(error);
  }

  return data as WorkspacePage;
}

export async function updateOrganizationRow({
  expectedAvatar,
  input,
  organizationId
}: {
  expectedAvatar?: string | null;
  input: UpdateOrganizationInput;
  organizationId: string;
}) {
  const client = requireSupabase();
  let query = client
    .from("organizations")
    .update({
      avatar: input.avatar?.trim() || null,
      name: input.name.trim(),
      updated_at: new Date().toISOString()
    })
    .eq("id", organizationId);

  if (expectedAvatar !== undefined) {
    query = expectedAvatar
      ? query.eq("avatar", expectedAvatar)
      : query.is("avatar", null);
  }

  const { data, error } = await query
    .select("id, name, avatar, owner_user_id")
    .maybeSingle();

  if (error) throw toRepositoryError(error);
  if (!data) throw new Error("The organization changed while it was saved.");
  return data;
}

export async function createOrganizationRow(
  input: CreateOrganizationInput
): Promise<CreateOrganizationResult> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("create_organization", {
    p_avatar: input.avatar ?? null,
    p_name: input.name.trim()
  });

  if (error) {
    throw toRepositoryError(error);
  }

  return data as CreateOrganizationResult;
}
