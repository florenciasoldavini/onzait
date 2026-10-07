import { resolveOrganizationAvatarUrl } from "@/features/workspaces/services/workspaces.service";
import { useMemo } from "react";

export function useOrganizationAvatarUrl(reference: string | null | undefined) {
  return useMemo(
    () => resolveOrganizationAvatarUrl(reference?.trim() || null),
    [reference]
  );
}
