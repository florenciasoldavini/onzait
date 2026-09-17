import { useWorkspace } from "@/features/workspaces/hooks/use-workspace";
import { useWorkspaceAccess } from "@/features/workspaces/hooks/use-workspace-access";
import { useOrganizationAvatarUrl } from "@/features/workspaces/hooks/use-organization-avatar";
import { SelectMenu } from "@/shared/ui/components/select-menu";
import {
  FolderOpenIcon,
  PlusIcon,
  SettingsIcon,
  StoreIcon
} from "@/shared/ui/icons";
import { usePathname, useRouter } from "expo-router";
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
      actions={[
        {
          icon: FolderOpenIcon,
          label: sharedWithMeLabel,
          onPress: () => router.push("/shared" as never),
          selected: isSharedSelected,
          tone: "neutral"
        },
        ...(canManageMembers
          ? [
              {
                dividerBefore: true,
                icon: SettingsIcon,
                label: t(
                  ($) => $["features/workspaces"].switcher.organizationSettings
                ),
                onPress: () => router.push("/organization" as never),
                tone: "neutral" as const
              }
            ]
          : []),
        {
          dividerBefore: !canManageMembers,
          icon: PlusIcon,
          label: t(($) => $["features/workspaces"].switcher.createOrganization),
          onPress: () => router.push("/organizations/new" as never),
          tone: "accent"
        }
      ]}
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
