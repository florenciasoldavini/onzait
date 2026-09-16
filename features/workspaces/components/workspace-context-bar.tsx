import { WorkspaceSwitcher } from "@/features/workspaces/components/workspace-switcher";
import { atomPalette, atomSpacing } from "@/shared/ui/components/theme";
import { View } from "react-native";

export function WorkspaceContextBar() {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: atomPalette.surface,
        borderBottomColor: atomPalette.borderSubtle,
        borderBottomWidth: 1,
        flexDirection: "row",
        gap: atomSpacing[2],
        justifyContent: "space-between",
        paddingHorizontal: atomSpacing[4],
        paddingVertical: atomSpacing[2]
      }}
    >
      <WorkspaceSwitcher />
    </View>
  );
}
