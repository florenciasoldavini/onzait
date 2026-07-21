import { resolveLayoutMode } from "@/shared/utils/layout-mode";
import { useWindowDimensions } from "react-native";

export type { LayoutMode } from "@/shared/utils/layout-mode";

export function useLayoutMode() {
  const { height, width } = useWindowDimensions();
  const mode = resolveLayoutMode(width);

  return {
    height,
    isCompact: mode === "compact",
    isExpanded: mode === "expanded",
    isMedium: mode === "medium",
    mode,
    width
  };
}
