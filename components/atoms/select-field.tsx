import { AppText } from "@/components/atoms/text";
import { atomPalette, atomRadii, atomSpacing } from "@/components/atoms/theme";
import { FormField } from "@/components/molecules";
import type { ReactNode } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle
} from "react-native";

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
    paddingVertical: atomSpacing[1]
  },
  selectedOption: {
    backgroundColor: `${atomPalette.accent}14`,
    borderColor: atomPalette.accent
  },
  webCursor: {
    cursor: "pointer"
  } as ViewStyle
});
