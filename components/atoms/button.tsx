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
    textToken: atomTypeScale.buttonSm
  },
  md: {
    button: "lg" as const,
    height: atomControlHeights.md,
    iconVisualSize: 18,
    textToken: atomTypeScale.buttonMd
  },
  lg: {
    button: "xl" as const,
    height: atomControlHeights.lg,
    iconVisualSize: 20,
    textToken: atomTypeScale.buttonLg
  },
  iconLg: {
    button: "xl" as const,
    height: atomControlHeights.iconLg,
    iconVisualSize: 22,
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

export function AppButton({
  children,
  fullWidth = true,
  icon,
  iconAfter = true,
  imageSource,
  layout = "default",
  loading = false,
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
  shape?: ButtonShape;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
}) {
  const sizeConfig = sizeMap[size];
  const config = variantConfig[variant];
  const buttonWidth =
    layout === "icon" ? sizeConfig.height : fullWidth ? "100%" : undefined;
  const buttonTextStyle = {
    color: config.textColor,
    fontSize: sizeConfig.textToken.fontSize,
    letterSpacing: sizeConfig.textToken.letterSpacing,
    lineHeight: sizeConfig.textToken.lineHeight,
    textTransform: sizeConfig.textToken.textTransform,
    ...getSansFontStyle(sizeConfig.textToken.fontWeight)
  };

  return (
    <Button
      action={config.action}
      className={config.className}
      size={sizeConfig.button}
      style={StyleSheet.flatten([
        {
          borderRadius: shape === "pill" ? atomRadii.full : atomControlRadius,
          minHeight: sizeConfig.height,
          paddingHorizontal: layout === "icon" ? 0 : undefined,
          width: buttonWidth
        },
        style
      ])}
      variant={config.buttonVariant}
      {...props}
    >
      {loading ? <ButtonSpinner color={config.textColor} /> : null}
      {imageSource ? (
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
        <ButtonIcon as={icon} className={config.iconClassName} size="lg" />
      ) : null}
      {children && layout !== "icon" ? (
        <ButtonText style={buttonTextStyle}>
          {loading ? "Working..." : children}
        </ButtonText>
      ) : null}
      {icon && iconAfter && !imageSource && !loading ? (
        <ButtonIcon as={icon} className={config.iconClassName} size="lg" />
      ) : null}
    </Button>
  );
}
