import { designTokens } from "@/theme/tokens";

const { semantic } = designTokens.colors;

export const Colors = {
  light: {
    text: semantic.text.primary,
    background: semantic.bg.canvas,
    tint: semantic.text.accent,
    icon: semantic.icon.default,
    tabIconDefault: semantic.icon.default,
    tabIconSelected: semantic.icon.active
  },
  dark: {
    text: semantic.text.primary,
    background: semantic.bg.canvas,
    tint: semantic.text.accent,
    icon: semantic.icon.default,
    tabIconDefault: semantic.icon.default,
    tabIconSelected: semantic.icon.active
  }
};
