import { designTokens } from "@/theme/tokens";
import { Platform } from "react-native";

export const fontFamilies = {
  sans:
    Platform.select({
      web: designTokens.fonts.web.sans,
      default: designTokens.fonts.nativeFallback.sans
    }) ?? designTokens.fonts.nativeFallback.sans,
  mono:
    Platform.select({
      web: designTokens.fonts.web.mono,
      default: designTokens.fonts.nativeFallback.mono
    }) ?? designTokens.fonts.nativeFallback.mono
} as const;
