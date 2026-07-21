import {
  getProfileAvatarPublicUrl,
  uploadProfileAvatarObject
} from "@/features/profile/repositories/profile-avatar.repository";
import type { ProfileAvatarAsset } from "@/features/profile/types";

export async function uploadProfileAvatar({
  asset,
  userId
}: {
  asset: ProfileAvatarAsset;
  userId: string;
}) {
  const avatarPath = await uploadProfileAvatarObject({ asset, userId });
  return getProfileAvatarPublicUrl(avatarPath);
}
