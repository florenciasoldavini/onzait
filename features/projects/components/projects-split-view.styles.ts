import {
  atomPalette,
  atomRadii,
  atomSpacing
} from "@/shared/ui/components/theme";
import { StyleSheet } from "react-native";

export const projectsSplitStyles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row", minHeight: 0 },
  listPane: {
    width: "38%",
    maxWidth: 420,
    minWidth: 300,
    minHeight: 0,
    backgroundColor: atomPalette.surface,
    borderColor: atomPalette.borderSubtle,
    borderRightWidth: 1,
    overflow: "hidden"
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: atomSpacing[4],
    borderBottomWidth: 1,
    borderBottomColor: atomPalette.borderSubtle
  },
  floatingAction: {
    position: "absolute",
    bottom: atomSpacing[4],
    right: atomSpacing[4],
    zIndex: 10
  },
  listContent: { paddingBottom: atomSpacing[24] },
  emptyContent: { padding: atomSpacing[4] },
  list: { flex: 1, minHeight: 0 },
  mapPane: { flex: 1, minWidth: 0 },
  viewSwitcher: {
    position: "absolute",
    top: atomSpacing[3],
    right: atomSpacing[3],
    zIndex: 2
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: atomSpacing[1],
    borderBottomColor: atomPalette.borderSubtle,
    borderBottomWidth: 1
  },
  selectedRow: { backgroundColor: `${atomPalette.accent}12` },
  hoveredRow: { backgroundColor: atomPalette.surfaceLow },
  rowSelect: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: atomSpacing[3],
    padding: atomSpacing[3],
    minHeight: 110
  },
  thumbnail: {
    width: 52,
    height: 64,
    borderRadius: atomRadii.md,
    overflow: "hidden",
    backgroundColor: atomPalette.surfaceLow,
    alignItems: "center",
    justifyContent: "center"
  },
  cover: { width: "100%", height: "100%" },
  rowContent: { flex: 1, minWidth: 0, gap: atomSpacing[1] },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: atomSpacing[2]
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: atomRadii.full,
    backgroundColor: atomPalette.borderSubtle,
    overflow: "hidden"
  },
  progressFill: { height: "100%", borderRadius: atomRadii.full }
});
