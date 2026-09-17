import { TabThumb } from "@/shared/ui/components/tab-thumb";
import { AppText } from "@/shared/ui/components/text";
import {
  atomPalette,
  atomRadii,
  atomSpacing
} from "@/shared/ui/components/theme";
import type { AppIconComponent } from "@/shared/ui/icons";
import { useState } from "react";
import { Platform, Pressable, View, type ViewStyle } from "react-native";

export type SegmentedTabOption<TValue extends string> = {
  disabled?: boolean;
  icon?: AppIconComponent;
  label: string;
  value: TValue;
};

type SegmentedTabsSelectedTone = "accent" | "ink";

export function SegmentedTabs<TValue extends string>({
  iconOnly = false,
  onChange,
  options,
  selectedTone = "ink",
  value
}: {
  iconOnly?: boolean;
  onChange: (value: TValue) => void;
  options: SegmentedTabOption<TValue>[];
  selectedTone?: SegmentedTabsSelectedTone;
  value: TValue;
}) {
  const [hoveredTab, setHoveredTab] = useState<TValue | null>(null);
  const [pressedTab, setPressedTab] = useState<TValue | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const selectedColor =
    selectedTone === "accent" ? atomPalette.accent : atomPalette.text;
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0
  );
  const optionGap = atomSpacing[1];
  const containerPadding = atomSpacing[1];
  const thumbWidth =
    options.length > 0
      ? Math.max(
          0,
          (containerWidth -
            containerPadding * 2 -
            optionGap * (options.length - 1)) /
            options.length
        )
      : 0;
  const thumbTranslateX =
    containerPadding + selectedIndex * (thumbWidth + optionGap);

  return (
    <View
      accessibilityRole="tablist"
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
      style={{
        backgroundColor: atomPalette.surfaceLow,
        borderColor: atomPalette.borderSubtle,
        borderRadius: atomRadii.lg,
        borderWidth: 1,
        flexDirection: "row",
        gap: atomSpacing[1],
        minHeight: 48,
        padding: atomSpacing[1],
        position: "relative",
        width: "100%"
      }}
    >
      {thumbWidth > 0 ? (
        <TabThumb
          translateX={thumbTranslateX}
          style={{
            backgroundColor: selectedColor,
            borderColor: selectedColor,
            borderRadius: atomRadii.md,
            borderWidth: 1,
            height: 40,
            left: 0,
            position: "absolute",
            top: containerPadding,
            width: thumbWidth
          }}
        />
      ) : null}
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;
        const isHovered = hoveredTab === option.value;
        const isPressed = pressedTab === option.value;
        const isDisabled = option.disabled === true;
        const isInteractive = !isDisabled && (isHovered || isPressed);

        return (
          <Pressable
            {...(Platform.OS === "web" && iconOnly
              ? { title: option.label }
              : {})}
            accessibilityLabel={option.label}
            accessibilityRole="button"
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
                  ? "transparent"
                  : isInteractive
                    ? atomPalette.surfaceRaised
                    : atomPalette.surfaceLow,
                borderColor: isSelected
                  ? "transparent"
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
                paddingVertical: 0,
                zIndex: 1
              },
              Platform.OS === "web"
                ? ({
                    cursor: isDisabled ? "not-allowed" : "pointer"
                  } as ViewStyle)
                : null
            ]}
          >
            {iconOnly && Icon ? (
              <Icon
                color={
                  isSelected ? atomPalette.textInverse : atomPalette.textMuted
                }
                size={20}
              />
            ) : (
              <AppText
                numberOfLines={1}
                style={{ textAlign: "center" }}
                tone={isSelected ? "inverse" : "muted"}
                variant="label"
              >
                {option.label}
              </AppText>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
