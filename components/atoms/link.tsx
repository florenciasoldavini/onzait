import { atomPalette, atomTypeScale } from "@/components/atoms/theme";
import { getMonoFontStyle } from "@/theme/fonts";
import { Link, type LinkProps } from "expo-router";
import type { ReactNode } from "react";
import { Text } from "react-native";

export function AppLink({
  children,
  style,
  ...props
}: LinkProps & {
  children: ReactNode;
  style?: React.ComponentProps<typeof Text>["style"];
}) {
  const linkToken = atomTypeScale.linkMono;

  return (
    <Link {...props}>
      <Text
        style={[
          {
            color: atomPalette.accent,
            fontSize: linkToken.fontSize,
            lineHeight: linkToken.lineHeight,
            letterSpacing: linkToken.letterSpacing,
            textTransform: linkToken.textTransform,
            ...getMonoFontStyle(linkToken.fontWeight)
          },
          style
        ]}
      >
        {children}
      </Text>
    </Link>
  );
}
