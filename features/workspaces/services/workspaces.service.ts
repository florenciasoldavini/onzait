import {
  createOrganizationRow,
  listMyWorkspaceRows,
  updateOrganizationRow
} from "@/features/workspaces/repositories/workspaces.repository";
import {
  getOrganizationAvatarPublicUrl,
  removeOrganizationAvatarObject,
  uploadOrganizationAvatarObject,
  type OrganizationAvatarAsset
} from "@/features/workspaces/repositories/organization-avatar.repository";
import {
  readActiveWorkspaceId,
  writeActiveWorkspaceId
} from "@/features/workspaces/repositories/workspace-preference.repository";
import type { CreateOrganizationInput } from "@/features/workspaces/types/workspace";
import { Sentry } from "@/infrastructure/monitoring/sentry";

export type { OrganizationAvatarAsset } from "@/features/workspaces/repositories/organization-avatar.repository";

export const listMyWorkspaces = listMyWorkspaceRows;
export const createOrganization = createOrganizationRow;
export const getPreferredWorkspaceId = readActiveWorkspaceId;
export const savePreferredWorkspaceId = writeActiveWorkspaceId;
export const resolveOrganizationAvatarUrl = getOrganizationAvatarPublicUrl;

export async function createOrganizationAndRememberWorkspace(
  input: CreateOrganizationInput & {
    avatarAsset?: OrganizationAvatarAsset | null;
  }
) {
  const result = await createOrganization({ name: input.name });
  let avatarUploadFailed = false;

  if (input.avatarAsset) {
    try {
      const avatar = await uploadOrganizationAvatarObject({
        asset: input.avatarAsset,
        organizationId: result.organization.id
      });

      try {
        result.organization = await updateOrganizationRow({
          expectedAvatar: null,
          input: { avatar, name: result.organization.name },
          organizationId: result.organization.id
        });
      } catch (error) {
        await removeAvatarSafely({
          organizationId: result.organization.id,
          path: avatar,
          reason: "creation-compensation"
        });
        throw error;
      }
    } catch (error) {
      avatarUploadFailed = true;
      Sentry.captureException(error, {
        tags: { workflow: "organization-avatar-creation" }
      });
    }
  }

  await savePreferredWorkspaceId(result.workspace.id);
  return { ...result, avatarUploadFailed };
}

export async function saveOrganization({
  avatarAsset,
  currentAvatar,
  name,
  organizationId
}: {
  avatarAsset?: OrganizationAvatarAsset | null;
  currentAvatar: string | null;
  name: string;
  organizationId: string;
}) {
  if (!avatarAsset) {
    return updateOrganizationRow({
      input: { avatar: currentAvatar, name },
      organizationId
    });
  }

  const avatar = await uploadOrganizationAvatarObject({
    asset: avatarAsset,
    organizationId
  });

  try {
    const organization = await updateOrganizationRow({
      expectedAvatar: currentAvatar,
      input: { avatar, name },
      organizationId
    });

    if (currentAvatar && currentAvatar !== avatar) {
      await removeAvatarSafely({
        organizationId,
        path: currentAvatar,
        reason: "replacement"
      });
    }

    return organization;
  } catch (error) {
    await removeAvatarSafely({
      organizationId,
      path: avatar,
      reason: "update-compensation"
    });
    throw error;
  }
}

async function removeAvatarSafely({
  organizationId,
  path,
  reason
}: {
  organizationId: string;
  path: string;
  reason: string;
}) {
  try {
    await removeOrganizationAvatarObject({ organizationId, path });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { storage_cleanup: `organization-avatar-${reason}` }
    });
  }
}
