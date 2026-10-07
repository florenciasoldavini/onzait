import type {
  OrganizationInvitationPage,
  OrganizationInvitationPreview,
  OrganizationMemberPage,
  PendingOrganizationInvitation,
  PendingOrganizationInvitationPage
} from "@/features/workspaces/types/organization-membership";
import { parseOrganizationInvitationPreview } from "@/features/workspaces/schemas/organization-invitation.schema";
import type { OrganizationRole } from "@/features/workspaces/types/workspace";
import {
  requireSupabase,
  toRepositoryError
} from "@/infrastructure/supabase/repository";

function toPage<T>(data: unknown): { items: T[]; nextOffset: number | null } {
  const page = data as { items?: T[]; next_offset?: number | null };
  return { items: page.items ?? [], nextOffset: page.next_offset ?? null };
}

export async function listOrganizationMemberRows(
  organizationId: string,
  offset: number
): Promise<OrganizationMemberPage> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("list_organization_members", {
    p_limit: 50,
    p_offset: offset,
    p_organization_id: organizationId
  });
  if (error) throw toRepositoryError(error);
  return toPage(data);
}

export async function listPendingOrganizationInvitationRows(
  organizationId: string,
  offset: number
): Promise<PendingOrganizationInvitationPage> {
  const client = requireSupabase();
  const { data, error } = await client.rpc(
    "list_pending_organization_invitations",
    {
      p_limit: 20,
      p_offset: offset,
      p_organization_id: organizationId
    }
  );
  if (error) throw toRepositoryError(error);
  return toPage<PendingOrganizationInvitation>(data);
}

export async function revokeOrganizationInvitationRow(invitationId: string) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("revoke_organization_invitation", {
    p_invitation_id: invitationId
  });
  if (error) throw toRepositoryError(error);
  return data as { invitation_id: string; status: "expired" | "revoked" };
}

export async function previewOrganizationInvitationRow(
  token: string
): Promise<OrganizationInvitationPreview | null> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("preview_organization_invitation", {
    p_token: token
  });
  if (error) throw toRepositoryError(error);
  return data ? parseOrganizationInvitationPreview(data) : null;
}

export async function listMyOrganizationInvitationRows(
  offset: number
): Promise<OrganizationInvitationPage> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("list_my_organization_invitations", {
    p_limit: 20,
    p_offset: offset
  });
  if (error) throw toRepositoryError(error);
  return toPage(data);
}

export async function respondOrganizationInvitationRow(
  invitationId: string,
  response: "accepted" | "declined"
) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("respond_organization_invitation", {
    p_invitation_id: invitationId,
    p_response: response
  });
  if (error) throw toRepositoryError(error);
  return data;
}

export async function respondOrganizationInvitationByTokenRow(
  token: string,
  response: "accepted" | "declined"
) {
  const client = requireSupabase();
  const { data, error } = await client.rpc(
    "respond_organization_invitation_by_token",
    {
      p_response: response,
      p_token: token
    }
  );
  if (error) throw toRepositoryError(error);
  return data;
}

export async function updateOrganizationMemberRoleRow(input: {
  membershipId: string;
  roleCode: OrganizationRole;
}) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("update_organization_member_role", {
    p_membership_id: input.membershipId,
    p_role_code: input.roleCode
  });
  if (error) throw toRepositoryError(error);
  return data;
}

export async function removeOrganizationMemberRow(membershipId: string) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("remove_organization_member", {
    p_membership_id: membershipId
  });
  if (error) throw toRepositoryError(error);
  return data;
}
