import {
  atomControlHeights,
  atomControlRadius,
  atomPalette,
  atomRadii,
  atomTypeScale
} from "@/components/atoms/theme";
import type { AppIconComponent, AppIconSize } from "@/components/icons";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { getSansFontStyle } from "@/theme/fonts";
import type { ReactNode } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "iconLg";
type ButtonLayout = "default" | "icon";
type ButtonShape = "default" | "pill";

const sizeMap = {
  sm: {
    button: "md" as const,
    height: atomControlHeights.sm,
    iconSize: "sm" as AppIconSize,
    imageVisualSize: 18,
    radius: atomRadii.md,
    textToken: atomTypeScale.buttonSm
  },
  md: {
    button: "lg" as const,
    height: atomControlHeights.md,
    iconSize: "sm" as AppIconSize,
    imageVisualSize: 18,
    radius: atomRadii.lg,
    textToken: atomTypeScale.buttonMd
  },
  lg: {
    button: "xl" as const,
    height: atomControlHeights.lg,
    iconSize: "md" as AppIconSize,
    imageVisualSize: 20,
    radius: atomControlRadius,
    textToken: atomTypeScale.buttonLg
  },
  iconLg: {
    button: "xl" as const,
    height: atomControlHeights.iconLg,
    iconSize: "lg" as AppIconSize,
    imageVisualSize: 22,
    radius: atomControlRadius,
    textToken: atomTypeScale.buttonLg
  }
};

const variantConfig: Record<
  ButtonVariant,
  {
    action: "default" | "negative" | "primary" | "secondary";
    buttonVariant: "outline" | "solid";
    className: string;
    iconColor: string;
    textColor: string;
  }
> = {
  primary: {
    action: "primary",
    buttonVariant: "solid",
    className: "",
    iconColor: atomPalette.accentText,
    textColor: atomPalette.accentText
  },
  secondary: {
    action: "secondary",
    buttonVariant: "outline",
    className:
      "bg-white border-outline-300 data-[hover=true]:bg-background-50 data-[hover=true]:border-outline-400 data-[active=true]:bg-background-100",
    iconColor: atomPalette.text,
    textColor: atomPalette.text
  },
  ghost: {
    action: "default",
    buttonVariant: "outline",
    className:
      "bg-transparent border-outline-200 data-[hover=true]:bg-background-50 data-[hover=true]:border-outline-300 data-[active=true]:bg-background-100",
    iconColor: atomPalette.accent,
    textColor: atomPalette.accent
  },
  destructive: {
    action: "negative",
    buttonVariant: "solid",
    className: "",
    iconColor: atomPalette.accentText,
    textColor: atomPalette.accentText
  }
};

const disabledVisualStyle = {
  backgroundColor: atomPalette.surfaceStrong,
  borderColor: atomPalette.borderStrong,
  iconColor: atomPalette.textMuted,
  opacity: 0.72,
  textColor: atomPalette.textMuted
} as const;

export function AppButton({
  children,
  fullWidth = true,
  icon,
  iconAfter = true,
  imageSource,
  isDisabled = false,
  layout = "default",
  loading = false,
  onDisabledPress,
  onLongPress,
  onPress,
  onPressIn,
  onPressOut,
  shape = "default",
  size = "lg",
  style,
  variant = "primary",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "action" | "size" | "variant"> & {
  children?: ReactNode;
  fullWidth?: boolean;
  icon?: AppIconComponent;
  iconAfter?: boolean;
  imageSource?: ImageSourcePropType;
  layout?: ButtonLayout;
  loading?: boolean;
  onDisabledPress?: () => void;
  shape?: ButtonShape;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
}) {
  const sizeConfig = sizeMap[size];
  const config = variantConfig[variant];
  const isVisuallyDisabled = Boolean(isDisabled || loading);
  const isInteractionDisabled = Boolean(
    loading || (isDisabled && !onDisabledPress)
  );
  const buttonWidth =
    layout === "icon" ? sizeConfig.height : fullWidth ? "100%" : undefined;
  const resolvedTextColor = isVisuallyDisabled
    ? disabledVisualStyle.textColor
    : config.textColor;
  const resolvedIconColor = isVisuallyDisabled
    ? disabledVisualStyle.iconColor
    : config.iconColor;
  const Icon = icon;
  const buttonTextStyle = {
    color: resolvedTextColor,
    fontSize: sizeConfig.textToken.fontSize,
    letterSpacing: sizeConfig.textToken.letterSpacing,
    lineHeight: sizeConfig.textToken.lineHeight,
    textTransform: sizeConfig.textToken.textTransform,
    ...getSansFontStyle(sizeConfig.textToken.fontWeight)
  };
  const webCursorStyle =
    Platform.OS === "web"
      ? ({
          cursor: isVisuallyDisabled ? "not-allowed" : "pointer"
        } as ViewStyle)
      : null;

  return (
    <Button
      action={config.action}
      className={config.className}
      isDisabled={isInteractionDisabled}
      onLongPress={isInteractionDisabled ? undefined : onLongPress}
      onPress={(event) => {
        if (loading) {
          return;
        }

        if (isDisabled) {
          onDisabledPress?.();
          return;
        }

        onPress?.(event);
      }}
      onPressIn={isInteractionDisabled ? undefined : onPressIn}
      onPressOut={isInteractionDisabled ? undefined : onPressOut}
      size={sizeConfig.button}
      style={StyleSheet.flatten([
        {
          borderRadius: shape === "pill" ? atomRadii.full : sizeConfig.radius,
          minHeight: sizeConfig.height,
          paddingHorizontal: layout === "icon" ? 0 : undefined,
          width: buttonWidth
        },
        isVisuallyDisabled
          ? {
              backgroundColor: disabledVisualStyle.backgroundColor,
              borderColor: disabledVisualStyle.borderColor,
              opacity: disabledVisualStyle.opacity
            }
          : null,
        webCursorStyle,
        style
      ])}
      variant={config.buttonVariant}
      {...props}
    >
      {imageSource && !loading ? (
        <Image
          source={imageSource}
          style={{
            height: sizeConfig.imageVisualSize,
            resizeMode: "contain",
            width: sizeConfig.imageVisualSize
          }}
        />
      ) : null}
      {Icon && !iconAfter && !imageSource && !loading ? (
        <Icon color={resolvedIconColor} size={sizeConfig.iconSize} />
      ) : null}
      {children && layout !== "icon" ? (
        <ButtonText style={buttonTextStyle}>{children}</ButtonText>
      ) : null}
      {loading ? <ButtonSpinner color={resolvedTextColor} /> : null}
      {Icon && iconAfter && !imageSource && !loading ? (
        <Icon color={resolvedIconColor} size={sizeConfig.iconSize} />
      ) : null}
    </Button>
  );
}
