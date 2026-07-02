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
  InputSlot,
  InputField as UIInputField
} from "@/components/ui/input";
import { getSansFontStyle } from "@/theme/fonts";
import { Eye, EyeOff } from "lucide-react-native";
import type { ComponentType, ReactNode } from "react";
import { useState } from "react";
import {
  Platform,
  Pressable,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
  type TextStyle,
  type ViewStyle
} from "react-native";

type FieldSize = "sm" | "md" | "lg";

const sizeMap = {
  sm: {
    iconSize: 18,
    input: "lg" as const,
    minHeight: atomControlHeights.sm,
    radius: atomSpacing[3]
  },
  md: {
    iconSize: 20,
    input: "xl" as const,
    minHeight: atomControlHeights.md,
    radius: atomSpacing[4]
  },
  lg: {
    iconSize: 20,
    input: "xl" as const,
    minHeight: atomControlHeights.lg,
    radius: atomControlRadius
  }
};

export function TextField({
  accessory,
  editable = true,
  errorText,
  helperText,
  label,
  leftIcon,
  onBlur,
  onFocus,
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
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isDisabled = editable === false;
  const borderColor = getFieldBorderColor({
    errorText,
    isDisabled,
    isFocused,
    isHovered
  });
  const iconColor = getFieldIconColor({
    errorText,
    isDisabled,
    isFocused,
    isHovered
  });
  const webRootCursorStyle =
    Platform.OS === "web"
      ? ({
          cursor: isDisabled ? "not-allowed" : "text"
        } as unknown as ViewStyle)
      : null;
  const webInputCursorStyle =
    Platform.OS === "web"
      ? ({
          cursor: isDisabled ? "not-allowed" : "text"
        } as unknown as TextStyle)
      : null;
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
        onPointerEnter={() => {
          setIsHovered(true);
        }}
        onPointerLeave={() => {
          setIsHovered(false);
        }}
        size={config.input}
        style={{
          backgroundColor: isDisabled
            ? atomPalette.surfaceLow
            : atomPalette.surface,
          borderColor,
          borderRadius: config.radius,
          minHeight: config.minHeight,
          ...webRootCursorStyle
        }}
      >
        {leftIcon ? (
          <InputSlot
            style={{
              minWidth: atomSpacing[10],
              paddingLeft: atomSpacing[4]
            }}
          >
            {(() => {
              const Icon = leftIcon;

              return (
                <Icon
                  color={iconColor}
                  size={config.iconSize}
                  strokeWidth={1.8}
                />
              );
            })()}
          </InputSlot>
        ) : null}
        <UIInputField
          className="placeholder:text-typography-400"
          editable={editable}
          onBlur={(event: NativeSyntheticEvent<TextInputFocusEventData>) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event: NativeSyntheticEvent<TextInputFocusEventData>) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={atomPalette.textPlaceholder}
          style={{
            color: atomPalette.text,
            fontSize: atomTypeScale.bodyMd.fontSize,
            letterSpacing: 0,
            lineHeight: atomTypeScale.bodyMd.lineHeight,
            paddingHorizontal:
              leftIcon || rightSlot ? atomSpacing[3] : atomSpacing[4],
            ...webInputCursorStyle,
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
      style={
        Platform.OS === "web"
          ? ({
              cursor: "pointer"
            } as ViewStyle)
          : null
      }
    >
      {visible ? (
        <EyeOff color={atomPalette.accent} size={18} strokeWidth={1.8} />
      ) : (
        <Eye color={atomPalette.accent} size={18} strokeWidth={1.8} />
      )}
    </Pressable>
  );
}

function getFieldBorderColor({
  errorText,
  isDisabled,
  isFocused,
  isHovered
}: {
  errorText?: string | null;
  isDisabled: boolean;
  isFocused: boolean;
  isHovered: boolean;
}) {
  if (isDisabled) {
    return atomPalette.borderSubtle;
  }

  if (errorText) {
    return isHovered ? atomPalette.errorText : atomPalette.error;
  }

  if (isFocused) {
    return atomPalette.accent;
  }

  if (isHovered) {
    return atomPalette.border;
  }

  return atomPalette.borderSubtle;
}

function getFieldIconColor({
  errorText,
  isDisabled,
  isFocused,
  isHovered
}: {
  errorText?: string | null;
  isDisabled: boolean;
  isFocused: boolean;
  isHovered: boolean;
}) {
  if (isDisabled) {
    return atomPalette.textSubtle;
  }

  if (errorText) {
    return atomPalette.error;
  }

  if (isFocused) {
    return atomPalette.accent;
  }

  if (isHovered) {
    return atomPalette.textMuted;
  }

  return atomPalette.textSubtle;
}
