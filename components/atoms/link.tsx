import { atomPalette, atomTypeScale } from "@/components/atoms/theme";
import { getMonoFontStyle } from "@/theme/fonts";
import { Link, type LinkProps } from "expo-router";
import type { ReactNode } from "react";
import {
  Platform,
  Pressable,
  Text,
  type TextStyle,
  type ViewStyle
} from "react-native";

export function AppLink({
  asChild: _asChild,
  children,
  style,
  ...props
}: LinkProps & {
  children: ReactNode;
  style?: React.ComponentProps<typeof Text>["style"];
}) {
  const linkToken = atomTypeScale.linkMono;

  return (
    <Link {...props} asChild>
      <Pressable
        style={
          Platform.OS === "web"
            ? ({
                cursor: "pointer"
              } as ViewStyle)
            : null
        }
      >
        {({ hovered, pressed }) => (
          <Text
            style={[
              {
                color:
                  hovered || pressed
                    ? atomPalette.accentHover
                    : atomPalette.accent,
                fontSize: linkToken.fontSize,
                lineHeight: linkToken.lineHeight,
                letterSpacing: linkToken.letterSpacing,
                textDecorationLine: hovered || pressed ? "underline" : "none",
                textTransform: linkToken.textTransform,
                ...getMonoFontStyle(linkToken.fontWeight)
              } as TextStyle,
              style
            ]}
          >
            {children}
          </Text>
        )}
      </Pressable>
    </Link>
  );
}
