import {
  AppCard,
  AppHeading,
  AppText,
  NavScreenHeader,
  Screen
} from "@/shared/ui/components";
import { atomSpacing } from "@/shared/ui/components/theme";
import { View } from "react-native";

export default function TasksScreen() {
  return (
    <Screen>
      <View style={{ gap: atomSpacing[6] }}>
        <NavScreenHeader title="Tasks" />

        <AppCard padding="lg">
          <View style={{ gap: atomSpacing[3] }}>
            <AppHeading variant="section">Task workspace coming next.</AppHeading>
            <AppText tone="muted">
              This placeholder now uses the shared design-system primitives, so
              future task UI can build on the same spacing, typography, and
              surface rules as the rest of the app.
            </AppText>
          </View>
        </AppCard>
      </View>
    </Screen>
  );
}
