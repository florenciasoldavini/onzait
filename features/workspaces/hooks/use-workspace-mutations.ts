import { useWorkspace } from "@/features/workspaces/hooks/use-workspace";
import {
  createOrganizationAndRememberWorkspace,
  saveOrganization,
  type OrganizationAvatarAsset
} from "@/features/workspaces/services/workspaces.service";
import type { CreateOrganizationInput } from "@/features/workspaces/types/workspace";
import { useMutation } from "@tanstack/react-query";

export function useCreateOrganization({
  refreshOnSuccess = true
}: { refreshOnSuccess?: boolean } = {}) {
  const { refresh } = useWorkspace();

  return useMutation({
    mutationFn: (
      input: CreateOrganizationInput & {
        avatarAsset?: OrganizationAvatarAsset | null;
      }
    ) => createOrganizationAndRememberWorkspace(input),
    onSuccess: refreshOnSuccess ? refresh : undefined
  });
}

export function useUpdateOrganization() {
  const { refresh } = useWorkspace();

  return useMutation({
    mutationFn: (input: {
      avatarAsset?: OrganizationAvatarAsset | null;
      currentAvatar: string | null;
      name: string;
      organizationId: string;
    }) => saveOrganization(input),
    onSuccess: refresh
  });
}
