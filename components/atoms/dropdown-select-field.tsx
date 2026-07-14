import { SelectMenu } from "@/components/atoms/select-menu";
import { FormField } from "@/components/molecules";
import type { ReactNode } from "react";

export interface DropdownSelectFieldOption<T extends string> {
  label: string;
  value: T;
}

export function DropdownSelectField<T extends string>({
  accessibilityLabel,
  errorText,
  helperText,
  label,
  onChange,
  options,
  required = false,
  value
}: {
  accessibilityLabel?: string;
  errorText?: string | null;
  helperText?: string | null;
  label: ReactNode;
  onChange: (value: T) => void;
  options: DropdownSelectFieldOption<T>[];
  required?: boolean;
  value: T;
}) {
  return (
    <FormField
      errorText={errorText}
      helperText={helperText}
      label={label}
      required={required}
    >
      <SelectMenu
        accessibilityLabel={accessibilityLabel}
        field
        isInvalid={Boolean(errorText)}
        onChange={onChange}
        options={options}
        value={value}
      />
    </FormField>
  );
}
