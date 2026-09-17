import { StyleSheet } from "react-native";
import {
  atomPalette,
  atomRadii,
  atomSpacing
} from "@/shared/ui/components/theme";
import { getMonoFontStyle, getSansFontStyle } from "@/shared/theme/fonts";

export const workspacePickerStyles = StyleSheet.create({
  heading: {
    paddingHorizontal: atomSpacing[4],
    paddingVertical: atomSpacing[2]
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: atomSpacing[3],
    paddingHorizontal: atomSpacing[4],
    paddingVertical: atomSpacing[2],
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: atomPalette.borderSubtle
  },
  selected: { backgroundColor: `${atomPalette.accent}10` },
  hovered: { backgroundColor: atomPalette.surfaceLow },
  highlightedHover: { backgroundColor: `${atomPalette.accent}20` },
  pressed: { backgroundColor: `${atomPalette.accent}30` },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: atomRadii.md,
    alignItems: "center",
    justifyContent: "center"
  },
  initials: { backgroundColor: atomPalette.surfaceLow },
  selectedAvatar: { backgroundColor: atomPalette.accent },
  createIcon: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: atomPalette.textPlaceholder
  },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  metadata: {
    ...getMonoFontStyle("400"),
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.65
  },
  name: { ...getSansFontStyle("500"), fontSize: 14, lineHeight: 20 }
});
