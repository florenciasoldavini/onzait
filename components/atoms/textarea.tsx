import {
  atomControlHeights,
  atomControlRadius,
  atomPalette,
  atomSpacing,
  atomTypeScale
} from "@/components/atoms/theme";
import { FormField } from "@/components/molecules";
import {
  Textarea,
  TextareaInput as UITextareaInput
} from "@/components/ui/textarea";
import { getSansFontStyle } from "@/theme/fonts";
import type { ReactNode } from "react";

export function TextAreaField({
  accessory,
  errorText,
  helperText,
  label,
  required = false,
  ...props
}: React.ComponentProps<typeof UITextareaInput> & {
  accessory?: ReactNode;
  errorText?: string | null;
  helperText?: string | null;
  label?: ReactNode;
  required?: boolean;
}) {
  return (
    <FormField
      accessory={accessory}
      errorText={errorText}
      helperText={helperText}
      label={label}
      required={required}
    >
      <Textarea
        isInvalid={Boolean(errorText)}
        size="md"
        style={{
          backgroundColor: atomPalette.surface,
          borderColor: errorText ? atomPalette.error : atomPalette.border,
          borderRadius: atomControlRadius,
          minHeight: atomControlHeights.lg * 2 + atomSpacing[6]
        }}
      >
        <UITextareaInput
          placeholderTextColor={atomPalette.textSubtle}
          style={{
            color: atomPalette.text,
            fontSize: atomTypeScale.bodyMd.fontSize,
            lineHeight: atomTypeScale.bodyMd.lineHeight,
            paddingHorizontal: atomSpacing[4],
            paddingVertical: atomSpacing[3],
            ...getSansFontStyle(atomTypeScale.bodyMd.fontWeight)
          }}
          {...props}
        />
      </Textarea>
    </FormField>
  );
}
