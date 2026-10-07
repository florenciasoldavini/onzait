import { ORGANIZATION_AVATAR_BUCKET } from "@/features/workspaces/constants/organization.constants";
import {
  buildOrganizationAvatarPath,
  getOrganizationAvatarMimeType,
  isOrganizationAvatarPath
} from "@/features/workspaces/utils/organization-avatar";
import {
  requireSupabase,
  toRepositoryError
} from "@/infrastructure/supabase/repository";

export type OrganizationAvatarAsset = {
  fileName?: string | null;
  mimeType?: string | null;
  uri: string;
};

export async function uploadOrganizationAvatarObject({
  asset,
  organizationId
}: {
  asset: OrganizationAvatarAsset;
  organizationId: string;
}) {
  const client = requireSupabase();
  const path = buildOrganizationAvatarPath({ asset, organizationId });
  const extension = path.split(".").pop() ?? "jpg";
  const response = await fetch(asset.uri);
  const blob = await response.blob();
  const { error } = await client.storage
    .from(ORGANIZATION_AVATAR_BUCKET)
    .upload(path, blob, {
      cacheControl: "3600",
      contentType: asset.mimeType ?? getOrganizationAvatarMimeType(extension),
      upsert: false
    });

  if (error) throw toRepositoryError(error);
  return path;
}

export async function removeOrganizationAvatarObject({
  organizationId,
  path
}: {
  organizationId: string;
  path: string;
}) {
  if (!isOrganizationAvatarPath(path, organizationId)) {
    throw new Error(
      "Refusing to remove an avatar outside the current organization path."
    );
  }

  const client = requireSupabase();
  const { error } = await client.storage
    .from(ORGANIZATION_AVATAR_BUCKET)
    .remove([path]);

  if (error) throw toRepositoryError(error);
}

export function getOrganizationAvatarPublicUrl(path: string | null) {
  if (!path || !isOrganizationAvatarPath(path)) return null;

  return requireSupabase()
    .storage.from(ORGANIZATION_AVATAR_BUCKET)
    .getPublicUrl(path).data.publicUrl;
}
