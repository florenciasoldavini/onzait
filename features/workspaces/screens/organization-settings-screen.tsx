import {
  OrganizationSettingsWorkspace,
  type OrganizationSettingsTab
} from "@/features/workspaces/components/organization-settings-workspace";
import { useWorkspace } from "@/features/workspaces/hooks/use-workspace";
import { useWorkspaceAccess } from "@/features/workspaces/hooks/use-workspace-access";
import { useLayoutMode } from "@/shared/hooks/use-layout-mode";
import { Screen } from "@/shared/ui/components/screen";
import { useState } from "react";
import { View } from "react-native";

export default function OrganizationSettingsScreen() {
  const { activeWorkspace } = useWorkspace();
  const { canManageMembers, canUpdateWorkspace } = useWorkspaceAccess();
  const { isExpanded } = useLayoutMode();
  const [activeTab, setActiveTab] =
    useState<OrganizationSettingsTab>("general");

  if (!activeWorkspace) {
    return (
      <Screen>
        <View />
      </Screen>
    );
  }

  return (
    <Screen>
      <OrganizationSettingsWorkspace
        activeTab={activeTab}
        canManageMembers={canManageMembers}
        canUpdate={canUpdateWorkspace}
        isExpanded={isExpanded}
        onChangeTab={setActiveTab}
        workspace={activeWorkspace}
      />
    </Screen>
  );
}
