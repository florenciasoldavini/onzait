import { useAuth } from "@/features/auth/hooks/use-auth";
import { useWorkspace } from "@/features/workspaces/hooks/use-workspace";

export function useWorkspaceAccess() {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const isGlobalAdmin = user?.role === "admin";
  const isOrganizationOwner = activeWorkspace?.owner_user_id === user?.id;
  const isOrganizationAdmin = activeWorkspace?.role_code === "admin";

  return {
    canDeleteDirectory: Boolean(
      isGlobalAdmin || isOrganizationOwner || isOrganizationAdmin
    ),
    canManageMembers: Boolean(
      isGlobalAdmin || isOrganizationOwner || isOrganizationAdmin
    ),
    canUpdateWorkspace: Boolean(
      isGlobalAdmin || isOrganizationOwner || isOrganizationAdmin
    ),
    canWriteDirectory: Boolean(activeWorkspace || isGlobalAdmin),
    isGlobalAdmin,
    isOrganizationAdmin,
    isOrganizationOwner
  };
}
