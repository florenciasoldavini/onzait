import { AppText } from "@/components/atoms/text";
import { atomPalette, atomRadii, atomSpacing } from "@/components/atoms/theme";
import { FormField } from "@/components/molecules";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type LayoutRectangle,
  type ViewStyle
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

export interface SelectFieldOption<T extends string> {
  label: string;
  value: T;
}

export function SelectField<T extends string>({
  errorText,
  helperText,
  label,
  onChange,
  options,
  required = false,
  value
}: {
  errorText?: string | null;
  helperText?: string | null;
  label: ReactNode;
  onChange: (value: T) => void;
  options: SelectFieldOption<T>[];
  required?: boolean;
  value: T;
}) {
  const [optionLayouts, setOptionLayouts] = useState<
    Partial<Record<T, LayoutRectangle>>
  >({});
  const selectedLayout = optionLayouts[value];
  const thumbX = useSharedValue(0);
  const thumbY = useSharedValue(0);
  const thumbWidth = useSharedValue(0);
  const thumbHeight = useSharedValue(0);
  const thumbOpacity = useSharedValue(0);
  const thumbStyle = useAnimatedStyle(() => ({
    height: thumbHeight.value,
    opacity: thumbOpacity.value,
    transform: [{ translateX: thumbX.value }, { translateY: thumbY.value }],
    width: thumbWidth.value
  }));

  useEffect(() => {
    if (!selectedLayout) {
      thumbOpacity.value = withTiming(0, { duration: 120 });
      return;
    }

    const timingConfig = {
      duration: 220,
      easing: Easing.out(Easing.cubic)
    };

    thumbX.value = withTiming(selectedLayout.x, timingConfig);
    thumbY.value = withTiming(selectedLayout.y, timingConfig);
    thumbWidth.value = withTiming(selectedLayout.width, timingConfig);
    thumbHeight.value = withTiming(selectedLayout.height, timingConfig);
    thumbOpacity.value = withTiming(1, { duration: 140 });
  }, [selectedLayout, thumbHeight, thumbOpacity, thumbWidth, thumbX, thumbY]);

  return (
    <FormField
      errorText={errorText}
      helperText={helperText}
      label={label}
      required={required}
    >
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: atomSpacing[2],
          position: "relative"
        }}
      >
        <Animated.View
          pointerEvents="none"
          style={[styles.selectedThumb, thumbStyle]}
        />
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              key={option.value}
              onLayout={(event) => {
                const layout = event.nativeEvent.layout;

                setOptionLayouts((current) => ({
                  ...current,
                  [option.value]: layout
                }));
              }}
              onPress={() => {
                onChange(option.value);
              }}
              style={StyleSheet.flatten([
                styles.option,
                isSelected ? styles.selectedOption : styles.defaultOption,
                Platform.OS === "web" ? styles.webCursor : null
              ])}
            >
              <AppText
                tone={isSelected ? "accent" : "muted"}
                variant="formLabel"
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </FormField>
  );
}

const styles = StyleSheet.create({
  defaultOption: {
    backgroundColor: atomPalette.surface,
    borderColor: atomPalette.borderSubtle
  },
  option: {
    alignItems: "center",
    borderRadius: atomRadii.full,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 34,
    paddingHorizontal: atomSpacing[3],
    paddingVertical: atomSpacing[1],
    zIndex: 1
  },
  selectedOption: {
    backgroundColor: "transparent",
    borderColor: "transparent"
  },
  selectedThumb: {
    backgroundColor: `${atomPalette.accent}14`,
    borderColor: atomPalette.accent,
    borderRadius: atomRadii.full,
    borderWidth: 1,
    left: 0,
    position: "absolute",
    top: 0,
    zIndex: 0
  },
  webCursor: {
    cursor: "pointer"
  } as ViewStyle
});
