import {
  atomControlHeights,
  atomControlRadius,
  atomPalette,
  atomSpacing,
  atomTypeScale
} from "@/components/atoms/theme";
import { FormField } from "@/components/molecules";
import {
  ClosedEyeIcon,
  OpenEyeIcon,
  type AppIconComponent,
  type AppIconSize
} from "@/components/icons";
import {
  Input,
  InputSlot,
  InputField as UIInputField
} from "@/components/ui/input";
import { getSansFontStyle } from "@/theme/fonts";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  Platform,
  Pressable,
  Text,
  View,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
  type TextStyle,
  type ViewStyle
} from "react-native";

type FieldSize = "sm" | "md" | "lg";

const sizeMap = {
  sm: {
    iconSize: "sm" as AppIconSize,
    input: "lg" as const,
    minHeight: atomControlHeights.sm,
    radius: atomSpacing[3]
  },
  md: {
    iconSize: "md" as AppIconSize,
    input: "xl" as const,
    minHeight: atomControlHeights.md,
    radius: atomSpacing[4]
  },
  lg: {
    iconSize: "md" as AppIconSize,
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
  multiline,
  numberOfLines,
  onBlur,
  onFocus,
  required = false,
  rightSlot,
  size = "lg",
  truncate = false,
  ...props
}: Omit<React.ComponentProps<typeof UIInputField>, "size"> & {
  accessory?: ReactNode;
  errorText?: string | null;
  helperText?: string | null;
  label?: ReactNode;
  leftIcon?: AppIconComponent;
  required?: boolean;
  rightSlot?: ReactNode;
  size?: FieldSize;
  truncate?: boolean;
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
  const inputLineHeight =
    Platform.OS === "web"
      ? atomTypeScale.bodyMd.lineHeight
      : atomTypeScale.bodyMd.fontSize + 4;
  const truncateStyle = truncate
    ? ({
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      } as unknown as TextStyle)
    : null;
  const inputPaddingHorizontal =
    leftIcon || rightSlot ? atomSpacing[3] : atomSpacing[4];
  const inputTextStyle = {
    color: atomPalette.text,
    fontSize: atomTypeScale.bodyMd.fontSize,
    letterSpacing: 0,
    lineHeight: inputLineHeight,
    ...getSansFontStyle(atomTypeScale.bodyMd.fontWeight)
  } satisfies TextStyle;
  const displayValue =
    typeof props.value === "string"
      ? props.value
      : typeof props.defaultValue === "string"
        ? props.defaultValue
        : "";
  const shouldRenderTruncatedText = truncate && editable === false;

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
              height: config.minHeight,
              minWidth: atomSpacing[10],
              paddingLeft: atomSpacing[4]
            }}
          >
            {(() => {
              const Icon = leftIcon;

              return <Icon color={iconColor} size={config.iconSize} />;
            })()}
          </InputSlot>
        ) : null}
        {shouldRenderTruncatedText ? (
          <View
            style={{
              flex: 1,
              height: config.minHeight,
              justifyContent: "center",
              paddingHorizontal: inputPaddingHorizontal,
              ...webRootCursorStyle
            }}
          >
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              style={{
                ...inputTextStyle,
                color: displayValue
                  ? atomPalette.text
                  : atomPalette.textPlaceholder
              }}
            >
              {displayValue || props.placeholder}
            </Text>
          </View>
        ) : (
          <UIInputField
            className="placeholder:text-typography-400"
            editable={editable}
            multiline={truncate ? false : multiline}
            numberOfLines={truncate ? 1 : numberOfLines}
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
              ...inputTextStyle,
              height: config.minHeight,
              paddingHorizontal: inputPaddingHorizontal,
              paddingVertical: 0,
              textAlignVertical: "center",
              ...truncateStyle,
              ...webInputCursorStyle
            }}
            {...props}
          />
        )}
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
        <ClosedEyeIcon color={atomPalette.accent} size="sm" />
      ) : (
        <OpenEyeIcon color={atomPalette.accent} size="sm" />
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
