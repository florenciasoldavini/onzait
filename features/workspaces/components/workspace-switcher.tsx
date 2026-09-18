import { WorkspacePickerMenu } from "@/features/workspaces/components/workspace-picker-menu";
import { useWorkspace } from "@/features/workspaces/hooks/use-workspace";
import { useWorkspaceAccess } from "@/features/workspaces/hooks/use-workspace-access";
import { useOrganizationAvatarUrl } from "@/features/workspaces/hooks/use-organization-avatar";
import { SelectMenu } from "@/shared/ui/components/select-menu";
import { StoreIcon } from "@/shared/ui/icons";
import { usePathname, useRouter } from "expo-router";
import { useOrganizationCreation } from "@/features/workspaces/hooks/use-organization-creation";
import { useTranslation } from "react-i18next";

export function WorkspaceSwitcher({
  presentation = "default"
}: {
  presentation?: "default" | "sidebar" | "rail" | "mobile";
}) {
  const { activeWorkspace, activeWorkspaceId, selectWorkspace, workspaces } =
    useWorkspace();
  const { canManageMembers } = useWorkspaceAccess();
  const { t } = useTranslation("features/workspaces");
  const router = useRouter();
  const openOrganizationCreation = useOrganizationCreation();
  const pathname = usePathname();
  const isSharedSelected =
    pathname === "/shared" || pathname.startsWith("/shared/");
  const sharedWithMeLabel = t(
    ($) => $["features/workspaces"].switcher.sharedWithMe
  );
  const organizationAvatarUrl = useOrganizationAvatarUrl(
    activeWorkspace?.display_avatar
  );

  const handleWorkspaceChange = (workspaceId: string) => {
    void selectWorkspace(workspaceId);
    if (isSharedSelected) {
      router.replace("/projects" as never);
    }
  };

  if (!activeWorkspaceId || workspaces.length === 0) {
    return null;
  }

  return (
    <SelectMenu
      minWidth={300}
      renderMenu={(close) => (
        <WorkspacePickerMenu
          workspaces={workspaces}
          activeId={activeWorkspaceId}
          sharedSelected={isSharedSelected}
          onSelect={(id) => {
            handleWorkspaceChange(id);
            close();
          }}
          onManage={
            canManageMembers
              ? () => {
                  close();
                  router.push("/organization" as never);
                }
              : undefined
          }
          onShared={() => {
            close();
            router.push("/shared" as never);
          }}
          onCreate={() => {
            close();
            openOrganizationCreation();
          }}
        />
      )}
      accessibilityLabel={t(
        ($) => $["features/workspaces"].switcher.accessibilityLabel
      )}
      displayValue={isSharedSelected ? sharedWithMeLabel : undefined}
      eyebrow={
        presentation === "sidebar"
          ? t(($) => $["features/workspaces"].switcher.label)
          : undefined
      }
      icon={presentation !== "default" ? StoreIcon : undefined}
      iconOnly={presentation === "rail"}
      imageUri={
        presentation !== "default" && !isSharedSelected
          ? organizationAvatarUrl
          : null
      }
      onChange={handleWorkspaceChange}
      options={workspaces.map((workspace) => ({
        label: workspace.display_name,
        value: workspace.id
      }))}
      presentation={
        presentation === "mobile"
          ? "workspace-mobile"
          : presentation !== "default"
            ? "workspace"
            : "default"
      }
      value={activeWorkspaceId}
      valueSelected={!isSharedSelected}
    />
  );
}
