import { designTokens } from "@/shared/theme/tokens";

export type LayoutMode = "compact" | "medium" | "expanded";

export function resolveLayoutMode(width: number): LayoutMode {
  if (width >= designTokens.layout.breakpointDesktop) {
    return "expanded";
  }

  if (width >= designTokens.layout.breakpointTablet) {
    return "medium";
  }

  return "compact";
}
