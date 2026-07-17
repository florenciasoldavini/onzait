import {
  changeProfilePassword,
  linkProfileIdentity,
  listProfileUserIdentities,
  resolveProfileAvatarUrl
} from "@/features/profile/services/profile.service";
import type { SupportedOAuthProvider } from "@/lib/auth-callback";
import { useMutation, useQuery } from "@tanstack/react-query";

const profileIdentityKey = ["profile", "identities"] as const;
const avatarSignedUrlRefreshMs = 50 * 60 * 1000;

export function useProfileAvatarUrl(reference: string | null | undefined) {
  const normalizedReference = reference?.trim() || null;

  return useQuery({
    enabled: Boolean(normalizedReference),
    queryFn: () => resolveProfileAvatarUrl(normalizedReference),
    queryKey: ["profile", "avatar-url", normalizedReference],
    refetchInterval: avatarSignedUrlRefreshMs,
    staleTime: avatarSignedUrlRefreshMs
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
