import { USER_AVATAR_BUCKET } from "@/features/profile/constants";
import {
  buildProfileAvatarPath,
  getMimeTypeFromExtension
} from "@/features/profile/avatar-storage";
import {
  requireSupabase,
  toRepositoryError
} from "@/features/projects/repositories/supabase.repository";

export type ProfileAvatarAsset = {
  fileName?: string | null;
  mimeType?: string | null;
  uri: string;
};

export async function uploadProfileAvatarObject({
  asset,
  userId
}: {
  asset: ProfileAvatarAsset;
  userId: string;
}) {
  const client = requireSupabase();
  const path = buildProfileAvatarPath({ asset, userId });
  const extension = path.split(".").pop() ?? "jpg";
  const response = await fetch(asset.uri);
  const blob = await response.blob();
  const { error } = await client.storage
    .from(USER_AVATAR_BUCKET)
    .upload(path, blob, {
      cacheControl: "3600",
      contentType: asset.mimeType ?? getMimeTypeFromExtension(extension),
      upsert: false
    });

  if (error) {
    throw toRepositoryError(error);
  }

  return path;
}

export async function removeProfileAvatarObject({
  path,
  userId
}: {
  path: string;
  userId: string;
}) {
  if (!path.startsWith(`users/${userId}/avatar/`)) {
    throw new Error("Refusing to remove an avatar outside the current user path.");
  }

  const client = requireSupabase();
  const { error } = await client.storage
    .from(USER_AVATAR_BUCKET)
    .remove([path]);

  if (error) {
    throw toRepositoryError(error);
  }
}

export function getProfileAvatarPublicUrl(path: string) {
  const client = requireSupabase();
  return client.storage.from(USER_AVATAR_BUCKET).getPublicUrl(path).data
    .publicUrl;
}
