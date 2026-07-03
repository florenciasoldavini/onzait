import { atomPalette, atomRadii } from "@/components/atoms/theme";
import { View, type ViewStyle } from "react-native";

export function SkeletonBlock({
  height,
  radius = atomRadii.md,
  style,
  width = "100%"
}: {
  height: number;
  radius?: number;
  style?: ViewStyle;
  width?: ViewStyle["width"];
}) {
  return (
    <View
      accessibilityLabel="Loading"
      style={{
        backgroundColor: atomPalette.surfaceStrong,
        borderRadius: radius,
        height,
        overflow: "hidden",
        width,
        ...style
      }}
    />
  );
}
