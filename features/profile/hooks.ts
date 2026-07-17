import {
  changeProfilePassword,
  linkProfileIdentity,
  listProfileUserIdentities
} from "@/features/profile/services/profile.service";
import type { SupportedOAuthProvider } from "@/lib/auth-callback";
import { useMutation, useQuery } from "@tanstack/react-query";

const profileIdentityKey = ["profile", "identities"] as const;

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
