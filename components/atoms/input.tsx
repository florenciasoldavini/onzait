import {
  atomControlHeights,
  atomControlRadius,
  atomPalette,
  atomSpacing,
  atomTypeScale
} from "@/components/atoms/theme";
import { FormField } from "@/components/molecules";
import {
  Input,
  InputIcon,
  InputSlot,
  InputField as UIInputField
} from "@/components/ui/input";
import { getSansFontStyle } from "@/theme/fonts";
import { Eye, EyeOff } from "lucide-react-native";
import type { ComponentType, ReactNode } from "react";
import { Pressable } from "react-native";

type FieldSize = "sm" | "md" | "lg";

const sizeMap = {
  sm: { input: "lg" as const, minHeight: atomControlHeights.sm },
  md: { input: "xl" as const, minHeight: atomControlHeights.md },
  lg: { input: "xl" as const, minHeight: atomControlHeights.lg }
};

export function TextField({
  accessory,
  errorText,
  helperText,
  label,
  leftIcon,
  required = false,
  rightSlot,
  size = "lg",
  ...props
}: Omit<React.ComponentProps<typeof UIInputField>, "size"> & {
  accessory?: ReactNode;
  errorText?: string | null;
  helperText?: string | null;
  label?: ReactNode;
  leftIcon?: ComponentType<any>;
  required?: boolean;
  rightSlot?: ReactNode;
  size?: FieldSize;
}) {
  const config = sizeMap[size];

  return (
    <FormField
      accessory={accessory}
      errorText={errorText}
      helperText={helperText}
      label={label}
      required={required}
    >
      <Input
        isInvalid={Boolean(errorText)}
        size={config.input}
        style={{
          backgroundColor: atomPalette.surface,
          borderColor: errorText ? atomPalette.error : atomPalette.border,
          borderRadius: atomControlRadius,
          minHeight: config.minHeight
        }}
      >
        {leftIcon ? (
          <InputSlot style={{ paddingLeft: atomSpacing[4] }}>
            <InputIcon
              as={leftIcon}
              className={errorText ? "text-error-500" : "text-typography-400"}
              size="lg"
            />
          </InputSlot>
        ) : null}
        <UIInputField
          placeholderTextColor={atomPalette.textSubtle}
          style={{
            color: atomPalette.text,
            fontSize: atomTypeScale.bodyMd.fontSize,
            lineHeight: atomTypeScale.bodyMd.lineHeight,
            paddingHorizontal:
              leftIcon || rightSlot ? atomSpacing[3] : atomSpacing[4],
            ...getSansFontStyle(atomTypeScale.bodyMd.fontWeight)
          }}
          {...props}
        />
        {rightSlot ? (
          <InputSlot style={{ paddingRight: atomSpacing[4] }}>
            {rightSlot}
          </InputSlot>
        ) : null}
      </Input>
    </FormField>
  );
}

export function PasswordVisibilityToggle({
  onPress,
  visible
}: {
  onPress: () => void;
  visible: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={visible ? "Hide password" : "Show password"}
      onPress={onPress}
    >
      {visible ? (
        <EyeOff color={atomPalette.accent} size={18} strokeWidth={1.8} />
      ) : (
        <Eye color={atomPalette.accent} size={18} strokeWidth={1.8} />
      )}
    </Pressable>
  );
}
