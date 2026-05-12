import { AppCard, AppHeading, AppText, Screen } from "@/components/atoms";
import { atomSpacing } from "@/components/atoms/theme";
import { View } from "react-native";

export default function TasksScreen() {
  return (
    <Screen>
      <AppCard padding="lg">
        <View style={{ gap: atomSpacing[3] }}>
          <AppText variant="eyebrow">Tasks</AppText>
          <AppHeading variant="section">Task workspace coming next.</AppHeading>
          <AppText tone="muted">
            This placeholder now uses the shared design-system primitives, so
            future task UI can build on the same spacing, typography, and
            surface rules as the rest of the app.
          </AppText>
        </View>
      </AppCard>
    </Screen>
  );
}
