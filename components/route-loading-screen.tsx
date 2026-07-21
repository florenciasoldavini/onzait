import { AppText, Screen } from "@/components/atoms";
import { atomPalette, atomSpacing } from "@/components/atoms/theme";
import { ActivityIndicator, View } from "react-native";

export function RouteLoadingScreen() {
  return (
    <Screen centered scrollable={false}>
      <View
        accessibilityLabel="Loading screen"
        accessibilityRole="progressbar"
        style={{ alignItems: "center", gap: atomSpacing[3] }}
      >
        <ActivityIndicator color={atomPalette.accent} size="large" />
        <AppText tone="muted">Loading…</AppText>
      </View>
    </Screen>
  );
}
