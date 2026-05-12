import { atomLayout, atomPalette, atomSpacing } from "@/components/atoms/theme";
import type { ReactNode } from "react";
import {
  ScrollView,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Screen({
  centered = false,
  children,
  scrollable = true,
  style
}: {
  centered?: boolean;
  children: ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontalPadding =
    width >= atomLayout.breakpointDesktop
      ? atomLayout.marginDesktop
      : width >= atomLayout.breakpointTablet
        ? atomLayout.marginTablet
        : atomLayout.marginMobile;

  const container = (
    <View
      style={{
        alignSelf: "center",
        flex: centered ? 1 : undefined,
        justifyContent: centered ? "center" : undefined,
        maxWidth: atomLayout.maxWidthContent,
        paddingHorizontal: horizontalPadding,
        width: "100%"
      }}
    >
      {children}
    </View>
  );

  if (!scrollable) {
    return (
      <View
        style={[
          {
            backgroundColor: atomPalette.background,
            flex: 1,
            paddingBottom: insets.bottom + atomSpacing[6],
            paddingTop: insets.top + atomSpacing[6]
          },
          style
        ]}
      >
        {container}
      </View>
    );
  }

  return (
    <View style={[{ backgroundColor: atomPalette.background, flex: 1 }, style]}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: centered ? "center" : undefined,
          paddingBottom: insets.bottom + atomSpacing[12],
          paddingTop: insets.top + atomSpacing[6]
        }}
        showsVerticalScrollIndicator={false}
      >
        {container}
      </ScrollView>
    </View>
  );
}
