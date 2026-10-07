import { WorkspaceSwitcher } from "@/features/workspaces/components/workspace-switcher";
import {
  atomPalette,
  atomRadii,
  atomSpacing
} from "@/shared/ui/components/theme";
import { BellIcon } from "@/shared/ui/icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable, View } from "react-native";

export function WorkspaceContextBar() {
  const { t } = useTranslation("shared");
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: atomPalette.surfaceLow,
        borderBottomColor: atomPalette.borderSubtle,
        borderBottomWidth: 1,
        flexDirection: "row",
        gap: atomSpacing[2],
        justifyContent: "space-between",
        paddingHorizontal: atomSpacing[4],
        paddingTop: Math.max(insets.top, atomSpacing[3]),
        paddingBottom: atomSpacing[3]
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <WorkspaceSwitcher presentation="mobile" />
      </View>
      <Pressable
        accessibilityLabel={t(($) => $.shared.accessibility.notifications)}
        accessibilityHint={t(
          ($) => $.shared.accessibility.notificationsComingSoon
        )}
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        disabled
        style={{
          width: 52,
          height: 52,
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: atomPalette.surface,
          borderColor: atomPalette.borderSubtle,
          borderWidth: 1,
          borderRadius: atomRadii.md
        }}
      >
        <BellIcon color={atomPalette.text} size="md" />
        <View
          style={{
            position: "absolute",
            top: 13,
            right: 14,
            width: 8,
            height: 8,
            borderRadius: atomRadii.full,
            backgroundColor: atomPalette.accent,
            borderColor: atomPalette.surface,
            borderWidth: 1
          }}
        />
      </Pressable>
    </View>
  );
}
