import {
  getProfileAvatarPublicUrl,
  removeProfileAvatarObject,
  uploadProfileAvatarObject,
  type ProfileAvatarAsset
} from "@/features/profile/repositories/profile-avatar.repository";
import {
  updateProfileRow,
  type ProfileUpdateInput
} from "@/features/profile/repositories/profile.repository";
import {
  getProfileUserIdentities,
  linkProfileOAuthIdentity,
  updateProfilePassword
} from "@/features/profile/repositories/profile-auth.repository";
import { getProfileAvatarPathFromPublicUrl } from "@/features/profile/avatar-storage";
import { USER_AVATAR_BUCKET } from "@/features/profile/constants";
import type { SupportedOAuthProvider } from "@/lib/auth-callback";
import { Sentry } from "@/lib/sentry";

async function removeAvatarObjectSafely({
  cleanupReason,
  path,
  userId
}: {
  cleanupReason: "compensation" | "replacement";
  path: string;
  userId: string;
}) {
  try {
    await removeProfileAvatarObject({ path, userId });
  } catch (cleanupError) {
    Sentry.captureException(cleanupError, {
      tags: {
        storage_cleanup: `profile-avatar-${cleanupReason}`
      }
    });
  }
}

export async function saveProfile({
  avatarAsset,
  currentAvatarUrl,
  profile,
  userId
}: {
  avatarAsset?: ProfileAvatarAsset | null;
  currentAvatarUrl?: string | null;
  profile: ProfileUpdateInput;
  userId: string;
}) {
  if (!avatarAsset) {
    return updateProfileRow({ profile, userId });
  }

  const avatarPath = await uploadProfileAvatarObject({
    asset: avatarAsset,
    userId
  });
  const previousAvatarPath = getProfileAvatarPathFromPublicUrl({
    bucket: USER_AVATAR_BUCKET,
    publicUrl: currentAvatarUrl,
    userId
  });

  try {
    const updatedUser = await updateProfileRow({
      expectedAvatar: currentAvatarUrl ?? null,
      profile: {
        ...profile,
        avatar: getProfileAvatarPublicUrl(avatarPath)
      },
      userId
    });

    if (previousAvatarPath && previousAvatarPath !== avatarPath) {
      await removeAvatarObjectSafely({
        cleanupReason: "replacement",
        path: previousAvatarPath,
        userId
      });
    }

    return updatedUser;
  } catch (error) {
    await removeAvatarObjectSafely({
      cleanupReason: "compensation",
      path: avatarPath,
      userId
    });
    throw error;
  }
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
