import { FieldMessage } from "@/shared/ui/components/field-message";
import { FieldLabel } from "@/shared/ui/components/label";
import { atomSpacing } from "@/shared/ui/components/theme";
import type { ReactNode } from "react";
import { View } from "react-native";

export function FormField({
  accessory,
  children,
  errorText,
  helperText,
  label,
  required = false
}: {
  accessory?: ReactNode;
  children: ReactNode;
  errorText?: string | null;
  helperText?: string | null;
  label?: ReactNode;
  required?: boolean;
}) {
  return (
    <View style={{ gap: atomSpacing[2] }}>
      {label ? (
        <FieldLabel accessory={accessory} required={required}>
          {label}
        </FieldLabel>
      ) : null}
      {children}
      {errorText ? <FieldMessage tone="error">{errorText}</FieldMessage> : null}
      {!errorText && helperText ? (
        <FieldMessage>{helperText}</FieldMessage>
      ) : null}
    </View>
  );
}
