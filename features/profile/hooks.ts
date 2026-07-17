import type { ProfileAvatarAsset } from "@/features/profile/repositories/profile-avatar.repository";
import {
  changeProfilePassword,
  linkProfileIdentity,
  listProfileUserIdentities,
  uploadProfileAvatar
} from "@/features/profile/services/profile.service";
import type { SupportedOAuthProvider } from "@/lib/auth-callback";
import { useMutation, useQuery } from "@tanstack/react-query";

const profileIdentityKey = ["profile", "identities"] as const;

export function useUploadProfileAvatar() {
  return useMutation({
    mutationFn: ({
      asset,
      userId
    }: {
      asset: ProfileAvatarAsset;
      userId: string;
    }) => uploadProfileAvatar({ asset, userId })
  });
}

export function useProfileUserIdentities(enabled: boolean) {
  return useQuery({
    enabled,
    queryFn: listProfileUserIdentities,
    queryKey: profileIdentityKey
  });
}

export function useLinkProfileIdentity() {
  return useMutation({
    mutationFn: (provider: SupportedOAuthProvider) =>
      linkProfileIdentity(provider)
  });
}

export function useChangeProfilePassword() {
  return useMutation({
    mutationFn: (password: string) => changeProfilePassword(password)
  });
}
