import { OrganizationGeneralSettings } from "@/features/workspaces/components/organization-general-settings";
import { OrganizationMembersSettings } from "@/features/workspaces/components/organization-members-settings";
import type { WorkspaceSummary } from "@/features/workspaces/types/workspace";
import { NavScreenHeader } from "@/shared/ui/components/nav-screen-header";
import { SegmentedTabs } from "@/shared/ui/components/tabs";
import { AppText } from "@/shared/ui/components/text";
import {
  atomPalette,
  atomRadii,
  atomSpacing
} from "@/shared/ui/components/theme";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

export type OrganizationSettingsTab = "general" | "members";

const tabs = [{ value: "general" }, { value: "members" }] satisfies {
  value: OrganizationSettingsTab;
}[];

export function OrganizationSettingsWorkspace({
  activeTab,
  canManageMembers,
  canUpdate,
  isExpanded,
  onChangeTab,
  workspace
}: {
  activeTab: OrganizationSettingsTab;
  canManageMembers: boolean;
  canUpdate: boolean;
  isExpanded: boolean;
  onChangeTab: (tab: OrganizationSettingsTab) => void;
  workspace: WorkspaceSummary;
}) {
  const { t } = useTranslation("features/workspaces");
  const localizedTabs = tabs.map((tab) => ({
    label:
      tab.value === "general"
        ? t(($) => $["features/workspaces"].settings.general)
        : t(($) => $["features/workspaces"].settings.members),
    value: tab.value
  }));

  return (
    <View style={styles.page}>
      <NavScreenHeader
        description={workspace.organization_name}
        title={t(($) => $["features/workspaces"].settings.title)}
      />

      <View
        style={[styles.workspace, isExpanded ? styles.workspaceExpanded : null]}
      >
        {isExpanded ? (
          <OrganizationSectionNavigation
            activeTab={activeTab}
            onChange={onChangeTab}
          />
        ) : (
          <SegmentedTabs
            onChange={onChangeTab}
            options={localizedTabs}
            value={activeTab}
          />
        )}

        <View style={styles.sectionContent}>
          <TabPanel active={activeTab === "general"}>
            <OrganizationGeneralSettings
              canUpdate={canUpdate}
              workspace={workspace}
            />
          </TabPanel>
          <TabPanel active={activeTab === "members"}>
            <OrganizationMembersSettings
              canManageMembers={canManageMembers}
              organizationId={workspace.organization_id}
            />
          </TabPanel>
        </View>
      </View>
    </View>
  );
}

function OrganizationSectionNavigation({
  activeTab,
  onChange
}: {
  activeTab: OrganizationSettingsTab;
  onChange: (tab: OrganizationSettingsTab) => void;
}) {
  const { t } = useTranslation("features/workspaces");
  return (
    <View accessibilityRole="tablist" style={styles.navigation}>
      {tabs.map((tab) => {
        const selected = tab.value === activeTab;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={tab.value}
            onPress={() => onChange(tab.value)}
            style={({ pressed }) => [
              styles.navigationItem,
              selected ? styles.navigationItemSelected : null,
              pressed ? styles.navigationItemPressed : null
            ]}
          >
            <AppText tone={selected ? "accent" : "muted"} variant="label">
              {tab.value === "general"
                ? t(($) => $["features/workspaces"].settings.general)
                : t(($) => $["features/workspaces"].settings.members)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function TabPanel({
  active,
  children
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <View
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? "auto" : "no-hide-descendants"}
      style={active ? null : styles.hidden}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    display: "none"
  },
  navigation: {
    gap: atomSpacing[2],
    width: 224
  },
  navigationItem: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderRadius: atomRadii.md,
    borderWidth: 1,
    paddingHorizontal: atomSpacing[4],
    paddingVertical: atomSpacing[3]
  },
  navigationItemPressed: {
    opacity: 0.72
  },
  navigationItemSelected: {
    backgroundColor: `${atomPalette.accent}14`,
    borderColor: `${atomPalette.accent}3D`
  },
  page: {
    alignSelf: "center",
    gap: atomSpacing[5],
    maxWidth: 1040,
    width: "100%"
  },
  sectionContent: {
    flex: 1,
    minWidth: 0
  },
  workspace: {
    gap: atomSpacing[5]
  },
  workspaceExpanded: {
    alignItems: "flex-start",
    flexDirection: "row"
  }
});
