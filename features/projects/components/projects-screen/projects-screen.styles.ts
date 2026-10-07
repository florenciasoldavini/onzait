import { atomPalette, atomSpacing } from "@/shared/ui/components/theme";
import { StyleSheet } from "react-native";

export const projectsScreenStyles = StyleSheet.create({
  splitScreenContainer: { paddingTop: 0, paddingBottom: 0, minHeight: 0 },
  splitScreenContent: { paddingHorizontal: 0, maxWidth: "100%", minHeight: 0 },
  splitSidebarHeader: { gap: atomSpacing[3], padding: atomSpacing[4] },
  controlsRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: atomSpacing[2]
  },
  expandedList: {
    flex: 1,
    gap: atomSpacing[4],
    minHeight: 0
  },
  filterControl: {
    flexShrink: 0
  },
  listHeader: {
    gap: atomSpacing[6],
    marginBottom: atomSpacing[6]
  },
  mapBody: {
    flex: 1,
    gap: atomSpacing[4],
    minHeight: 0
  },
  mapScreenContainer: {
    paddingBottom: atomSpacing[5]
  },
  mapScreenStack: {
    flex: 1,
    minHeight: 0
  },
  mapFloatingControls: {
    position: "absolute",
    top: atomSpacing[4],
    left: atomSpacing[4],
    zIndex: 3
  },
  mapFloatingViewSwitcher: {
    position: "absolute",
    top: atomSpacing[3],
    right: atomSpacing[3],
    zIndex: 3
  },
  mapFloatingFeedback: {
    position: "absolute",
    top: 80,
    left: atomSpacing[4],
    width: 320,
    maxHeight: "65%"
  },
  mapFloatingPagination: {
    position: "absolute",
    bottom: atomSpacing[8],
    alignSelf: "center"
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20, 22, 28, 0.18)"
  },
  modalBody: {
    gap: atomSpacing[5],
    paddingBottom: atomSpacing[1]
  },
  modalCard: {
    borderColor: atomPalette.borderSubtle,
    maxHeight: "86%",
    width: "100%"
  },
  modalContent: {
    maxWidth: 560,
    width: "100%"
  },
  modalFooter: {
    flexDirection: "row",
    gap: atomSpacing[3],
    paddingTop: atomSpacing[5]
  },
  modalFooterAction: {
    flex: 1
  },
  modalHeader: {
    borderBottomColor: atomPalette.borderSubtle,
    borderBottomWidth: 1,
    marginBottom: atomSpacing[5],
    paddingBottom: atomSpacing[4]
  },
  modalRoot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: atomSpacing[4]
  },
  paginationFooter: {
    alignItems: "center",
    paddingVertical: atomSpacing[5]
  },
  projectListContent: {
    flexGrow: 1,
    paddingBottom: atomSpacing[6]
  },
  projectRow: {
    gap: atomSpacing[4]
  },
  projectRowSeparator: {
    height: atomSpacing[4]
  },
  screenContent: {
    flex: 1,
    minWidth: 0
  },
  searchFluid: {
    width: "100%"
  },
  toolbar: {
    gap: atomSpacing[3]
  },
  toolbarExpanded: {
    alignItems: "center",
    flexDirection: "row"
  },
  viewTabs: {
    alignSelf: "flex-start",
    width: 152
  },
  viewTabsExpanded: {
    marginLeft: "auto",
    width: 152
  }
});
