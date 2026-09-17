import { useWorkspaceProjectCount } from "@/features/projects/hooks/use-workspace-project-count";
import { useOrganizationAvatarUrl } from "@/features/workspaces/hooks/use-organization-avatar";
import type { WorkspaceSummary } from "@/features/workspaces/types/workspace";
import { AppText } from "@/shared/ui/components/text";
import { atomPalette } from "@/shared/ui/components/theme";
import {
  CheckIcon,
  ChevronRightIcon,
  SettingsIcon,
  UsersIcon,
  PlusIcon
} from "@/shared/ui/icons";
import { Image } from "expo-image";
import { Fragment, useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { WorkspacePickerRow } from "./workspace-picker-row";
import { workspacePickerStyles as styles } from "./workspace-picker-menu.styles";

export function WorkspacePickerMenu({
  workspaces,
  activeId,
  sharedSelected,
  onSelect,
  onManage,
  onShared,
  onCreate
}: {
  workspaces: WorkspaceSummary[];
  activeId: string;
  sharedSelected: boolean;
  onSelect: (id: string) => void;
  onManage?: () => void;
  onShared: () => void;
  onCreate: () => void;
}) {
  const { t } = useTranslation("features/workspaces");
  return (
    <View>
      <View style={styles.heading}>
        <AppText tone="muted" variant="eyebrow">
          {t(($) => $["features/workspaces"].switcher.yourWorkspaces)}
        </AppText>
      </View>
      {workspaces.map((workspace) => (
        <Fragment key={workspace.id}>
          <WorkspacePickerOption
            workspace={workspace}
            selected={!sharedSelected && workspace.id === activeId}
            onPress={() => onSelect(workspace.id)}
          />
          {workspace.id === activeId && !sharedSelected && onManage ? (
            <WorkspacePickerRow onPress={onManage} highlighted>
              <View style={styles.avatar}>
                <SettingsIcon color={atomPalette.accent} size={20} />
              </View>
              <View style={styles.copy}>
                <AppText tone="accent" style={styles.name}>
                  {t(
                    ($) =>
                      $["features/workspaces"].switcher.organizationSettings
                  )}
                </AppText>
                <AppText tone="accent" variant="meta" style={styles.metadata}>
                  {t(
                    ($) => $["features/workspaces"].switcher.manageDescription
                  )}
                </AppText>
              </View>
              <ChevronRightIcon color={atomPalette.accent} size={18} />
            </WorkspacePickerRow>
          ) : null}
        </Fragment>
      ))}
      <WorkspacePickerRow
        accessibilityState={{ selected: sharedSelected }}
        onPress={onShared}
        highlighted={sharedSelected}
      >
        <View style={styles.avatar}>
          <UsersIcon color={atomPalette.textMuted} size={20} />
        </View>
        <AppText style={[styles.copy, styles.name]}>
          {t(($) => $["features/workspaces"].switcher.sharedWithMe)}
        </AppText>
        <ChevronRightIcon color={atomPalette.textMuted} size={18} />
      </WorkspacePickerRow>
      <WorkspacePickerRow onPress={onCreate}>
        <View style={[styles.avatar, styles.createIcon]}>
          <PlusIcon color={atomPalette.textMuted} size={18} />
        </View>
        <AppText style={[styles.copy, styles.name]}>
          {t(($) => $["features/workspaces"].switcher.createOrganization)}
        </AppText>
      </WorkspacePickerRow>
    </View>
  );
}

function WorkspacePickerOption({
  workspace,
  selected,
  onPress
}: {
  workspace: WorkspaceSummary;
  selected: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation("features/workspaces");
  const projectCount = useWorkspaceProjectCount(workspace.id);
  const avatar = useOrganizationAvatarUrl(workspace.display_avatar);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const initials = workspace.display_name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return (
    <WorkspacePickerRow
      accessibilityLabel={workspace.display_name}
      accessibilityState={{ selected }}
      onPress={onPress}
      highlighted={selected}
    >
      {avatar && failedUrl !== avatar ? (
        <Image
          source={{ uri: avatar }}
          onError={() => setFailedUrl(avatar)}
          contentFit="cover"
          style={styles.avatar}
        />
      ) : (
        <View
          style={[
            styles.avatar,
            styles.initials,
            selected && styles.selectedAvatar
          ]}
        >
          <AppText tone={selected ? "inverse" : "muted"} variant="label">
            {initials}
          </AppText>
        </View>
      )}
      <View style={styles.copy}>
        <AppText
          numberOfLines={1}
          style={styles.name}
          tone={selected ? "accent" : "default"}
        >
          {workspace.display_name}
        </AppText>
        <AppText
          variant="meta"
          tone={selected ? "accent" : "subtle"}
          style={styles.metadata}
        >
          {projectCount.data !== undefined
            ? t(($) => $["features/workspaces"].switcher.projectCount, {
                count: projectCount.data
              })
            : projectCount.isError
              ? t(($) => $["features/workspaces"].switcher.projectCountError)
              : t(($) => $["features/workspaces"].switcher.projectCountLoading)}
        </AppText>
      </View>
      {selected ? <CheckIcon color={atomPalette.accent} size={18} /> : null}
    </WorkspacePickerRow>
  );
}
