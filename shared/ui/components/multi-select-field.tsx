import { SelectableChip } from "@/shared/ui/components/selectable-chip";
import { atomSpacing } from "@/shared/ui/components/theme";
import { FormField } from "@/shared/ui/forms";
import type { ReactNode } from "react";
import { View } from "react-native";

export interface MultiSelectFieldOption<T extends string> {
  label: string;
  value: T;
}

export function MultiSelectField<T extends string>({
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
  onChange: (value: T[]) => void;
  options: MultiSelectFieldOption<T>[];
  required?: boolean;
  value: T[];
}) {
  const toggleOption = (optionValue: T) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((selectedValue) => selectedValue !== optionValue));
      return;
    }

    onChange([...value, optionValue]);
  };

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
          gap: atomSpacing[2]
        }}
      >
        {options.map((option) => {
          const isSelected = value.includes(option.value);

          return (
            <SelectableChip
              key={option.value}
              onPress={() => toggleOption(option.value)}
              selected={isSelected}
              variant="bordered"
            >
              {option.label}
            </SelectableChip>
          );
        })}
      </View>
    </FormField>
  );
}
