import { AppText } from "@/components/atoms/text";
import { atomPalette, atomRadii, atomSpacing } from "@/components/atoms/theme";
import { useState } from "react";
import { Platform, Pressable, View, type ViewStyle } from "react-native";

export type SegmentedTabOption<TValue extends string> = {
  disabled?: boolean;
  label: string;
  value: TValue;
};

type SegmentedTabsSelectedTone = "accent" | "ink";

export function SegmentedTabs<TValue extends string>({
  onChange,
  options,
  selectedTone = "ink",
  value
}: {
  onChange: (value: TValue) => void;
  options: SegmentedTabOption<TValue>[];
  selectedTone?: SegmentedTabsSelectedTone;
  value: TValue;
}) {
  const [hoveredTab, setHoveredTab] = useState<TValue | null>(null);
  const [pressedTab, setPressedTab] = useState<TValue | null>(null);
  const selectedColor =
    selectedTone === "accent" ? atomPalette.accent : atomPalette.text;

  return (
    <View
      accessibilityRole="tablist"
      style={{
        backgroundColor: atomPalette.surfaceLow,
        borderColor: atomPalette.borderSubtle,
        borderRadius: atomRadii.lg,
        borderWidth: 1,
        flexDirection: "row",
        gap: atomSpacing[1],
        minHeight: 48,
        padding: atomSpacing[1],
        width: "100%"
      }}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        const isHovered = hoveredTab === option.value;
        const isPressed = pressedTab === option.value;
        const isDisabled = option.disabled === true;
        const isInteractive = !isDisabled && (isHovered || isPressed);

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{
              disabled: isDisabled,
              selected: isSelected
            }}
            disabled={isDisabled}
            key={option.value}
            onHoverIn={() => {
              if (!isDisabled) {
                setHoveredTab(option.value);
              }
            }}
            onHoverOut={() => {
              setHoveredTab((current) =>
                current === option.value ? null : current
              );
            }}
            onPress={() => {
              onChange(option.value);
            }}
            onPressIn={() => {
              if (!isDisabled) {
                setPressedTab(option.value);
              }
            }}
            onPressOut={() => {
              setPressedTab((current) =>
                current === option.value ? null : current
              );
            }}
            style={[
              {
                alignItems: "center",
                backgroundColor: isSelected
                  ? selectedColor
                  : isInteractive
                    ? atomPalette.surfaceRaised
                    : atomPalette.surfaceLow,
                borderColor: isSelected
                  ? selectedColor
                  : isInteractive
                    ? atomPalette.border
                    : "transparent",
                borderRadius: atomRadii.md,
                borderWidth: 1,
                flexBasis: 0,
                flexGrow: 1,
                flexShrink: 1,
                height: 40,
                justifyContent: "center",
                opacity: isDisabled ? 0.56 : 1,
                paddingHorizontal: atomSpacing[2],
                paddingVertical: 0
              },
              Platform.OS === "web"
                ? ({
                    cursor: isDisabled ? "not-allowed" : "pointer"
                  } as ViewStyle)
                : null
            ]}
          >
            <AppText
              numberOfLines={1}
              style={{ textAlign: "center" }}
              tone={isSelected ? "inverse" : "muted"}
              variant="label"
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
