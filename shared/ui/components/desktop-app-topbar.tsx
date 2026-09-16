import { useAppTopBar } from "@/shared/hooks/use-app-topbar";
import { SearchField } from "@/shared/ui/components/input";
import {
  atomPalette,
  atomRadii,
  atomSpacing
} from "@/shared/ui/components/theme";
import { BellIcon } from "@/shared/ui/icons";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

export function DesktopAppTopBar() {
  const { search } = useAppTopBar();
  const { t } = useTranslation("shared");

  return (
    <View
      accessibilityRole="toolbar"
      style={{
        alignItems: "center",
        backgroundColor: atomPalette.surface,
        borderBottomColor: atomPalette.borderSubtle,
        borderBottomWidth: 1,
        flexDirection: "row",
        gap: atomSpacing[5],
        minHeight: 72,
        paddingHorizontal: atomSpacing[6]
      }}
    >
      <View style={{ flex: 1, maxWidth: 560, minWidth: 0 }}>
        {search ? (
          <SearchField
            onChangeText={search.onChangeText}
            placeholder={search.placeholder}
            size="md"
            value={search.value}
          />
        ) : null}
      </View>

      <Pressable
        accessibilityHint={t(
          ($) => $.shared.accessibility.notificationsComingSoon
        )}
        accessibilityLabel={t(($) => $.shared.accessibility.notifications)}
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        disabled
        style={{
          alignItems: "center",
          borderRadius: atomRadii.full,
          height: 44,
          justifyContent: "center",
          marginLeft: "auto",
          position: "relative",
          width: 44
        }}
      >
        <BellIcon color={atomPalette.text} size="md" />
        <View
          style={{
            backgroundColor: atomPalette.accent,
            borderColor: atomPalette.surface,
            borderRadius: atomRadii.full,
            borderWidth: 2,
            height: 9,
            position: "absolute",
            right: 9,
            top: 8,
            width: 9
          }}
        />
      </Pressable>
    </View>
  );
}
