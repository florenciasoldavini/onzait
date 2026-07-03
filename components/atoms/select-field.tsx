import { AppText } from "@/components/atoms/text";
import {
  atomControlHeights,
  atomPalette,
  atomRadii,
  atomSpacing
} from "@/components/atoms/theme";
import { FormField } from "@/components/molecules";
import type { ReactNode } from "react";
import { Platform, Pressable, View, type ViewStyle } from "react-native";

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
  value
}: {
  errorText?: string | null;
  helperText?: string | null;
  label: ReactNode;
  onChange: (value: T) => void;
  options: SelectFieldOption<T>[];
  value: T;
}) {
  return (
    <FormField errorText={errorText} helperText={helperText} label={label}>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: atomSpacing[2]
        }}
      >
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              key={option.value}
              onPress={() => {
                onChange(option.value);
              }}
              style={({ pressed }) =>
                [
                  {
                    alignItems: "center",
                    backgroundColor: isSelected
                      ? `${atomPalette.accent}14`
                      : atomPalette.surface,
                    borderColor: isSelected
                      ? atomPalette.accent
                      : atomPalette.borderSubtle,
                    borderRadius: atomRadii.full,
                    borderWidth: 1,
                    justifyContent: "center",
                    minHeight: atomControlHeights.sm,
                    opacity: pressed ? 0.78 : 1,
                    paddingHorizontal: atomSpacing[3]
                  },
                  Platform.OS === "web"
                    ? ({ cursor: "pointer" } as ViewStyle)
                    : null
                ] as ViewStyle[]
              }
            >
              <AppText tone={isSelected ? "accent" : "muted"} variant="label">
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </FormField>
  );
}
