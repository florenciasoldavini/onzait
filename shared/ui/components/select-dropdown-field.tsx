import {
  SelectMenu,
  type SelectMenuOption
} from "@/shared/ui/components/select-menu";
import { FormField } from "@/shared/ui/forms";

export function SelectDropdownField<TValue extends string>({
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
  label: string;
  onChange: (value: TValue) => void;
  options: SelectMenuOption<TValue>[];
  required?: boolean;
  value: TValue;
}) {
  return (
    <FormField
      errorText={errorText}
      helperText={helperText}
      label={label}
      required={required}
    >
      <SelectMenu
        accessibilityLabel={accessibilityLabel ?? label}
        fullWidth
        onChange={onChange}
        options={options}
        value={value}
      />
    </FormField>
  );
}
