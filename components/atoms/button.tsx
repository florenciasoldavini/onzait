import {
  atomControlHeights,
  atomControlRadius,
  atomPalette,
  atomRadii,
  atomTypeScale
} from "@/components/atoms/theme";
import {
  Button,
  ButtonIcon,
  ButtonSpinner,
  ButtonText
} from "@/components/ui/button";
import { getSansFontStyle } from "@/theme/fonts";
import type { ComponentType, ReactNode } from "react";
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
    iconVisualSize: 18,
    radius: atomRadii.md,
    textToken: atomTypeScale.buttonSm
  },
  md: {
    button: "lg" as const,
    height: atomControlHeights.md,
    iconVisualSize: 18,
    radius: atomRadii.lg,
    textToken: atomTypeScale.buttonMd
  },
  lg: {
    button: "xl" as const,
    height: atomControlHeights.lg,
    iconVisualSize: 20,
    radius: atomControlRadius,
    textToken: atomTypeScale.buttonLg
  },
  iconLg: {
    button: "xl" as const,
    height: atomControlHeights.iconLg,
    iconVisualSize: 22,
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
    iconClassName: string;
    textColor: string;
  }
> = {
  primary: {
    action: "primary",
    buttonVariant: "solid",
    className: "",
    iconClassName: "text-white",
    textColor: atomPalette.accentText
  },
  secondary: {
    action: "secondary",
    buttonVariant: "outline",
    className:
      "bg-white border-outline-300 data-[hover=true]:bg-background-50 data-[hover=true]:border-outline-400 data-[active=true]:bg-background-100",
    iconClassName: "text-typography-900",
    textColor: atomPalette.text
  },
  ghost: {
    action: "default",
    buttonVariant: "outline",
    className:
      "bg-transparent border-outline-200 data-[hover=true]:bg-background-50 data-[hover=true]:border-outline-300 data-[active=true]:bg-background-100",
    iconClassName: "text-primary-500",
    textColor: atomPalette.accent
  },
  destructive: {
    action: "negative",
    buttonVariant: "solid",
    className: "",
    iconClassName: "text-white",
    textColor: atomPalette.accentText
  }
};

const disabledVisualStyle = {
  backgroundColor: atomPalette.surfaceStrong,
  borderColor: atomPalette.borderStrong,
  iconClassName: "text-typography-600",
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
  icon?: ComponentType<any>;
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
  const resolvedIconClassName = isVisuallyDisabled
    ? disabledVisualStyle.iconClassName
    : config.iconClassName;
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
            height: sizeConfig.iconVisualSize,
            resizeMode: "contain",
            width: sizeConfig.iconVisualSize
          }}
        />
      ) : null}
      {icon && !iconAfter && !imageSource && !loading ? (
        <ButtonIcon as={icon} className={resolvedIconClassName} size="lg" />
      ) : null}
      {children && layout !== "icon" ? (
        <ButtonText style={buttonTextStyle}>{children}</ButtonText>
      ) : null}
      {loading ? <ButtonSpinner color={resolvedTextColor} /> : null}
      {icon && iconAfter && !imageSource && !loading ? (
        <ButtonIcon as={icon} className={resolvedIconClassName} size="lg" />
      ) : null}
    </Button>
  );
}
