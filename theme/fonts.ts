import { designTokens } from "@/theme/tokens";
import { Platform } from "react-native";

export const fontFamilies = {
  sans:
    Platform.select({
      web: designTokens.fonts.web.sans,
      default: designTokens.fonts.native.sans
    }) ?? designTokens.fonts.native.sans,
  mono:
    Platform.select({
      web: designTokens.fonts.web.mono,
      default: designTokens.fonts.native.mono
    }) ?? designTokens.fonts.native.mono
} as const;
