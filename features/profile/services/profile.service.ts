import {
  getProfileAvatarPublicUrl,
  uploadProfileAvatarObject,
  type ProfileAvatarAsset
} from "@/features/profile/repositories/profile-avatar.repository";
import {
  getProfileUserIdentities,
  linkProfileOAuthIdentity,
  updateProfilePassword
} from "@/features/profile/repositories/profile-auth.repository";
import type { SupportedOAuthProvider } from "@/lib/auth-callback";

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

export function listProfileUserIdentities() {
  return getProfileUserIdentities();
}

export function linkProfileIdentity(provider: SupportedOAuthProvider) {
  return linkProfileOAuthIdentity(provider);
}

export function changeProfilePassword(password: string) {
  return updateProfilePassword(password);
}
