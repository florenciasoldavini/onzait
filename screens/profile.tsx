import { AppButton, AppCard, AppText, Screen } from "@/components/atoms";
import { atomSpacing } from "@/components/atoms/theme";
import { AuthContext } from "@/contexts/auth";
import { useContext } from "react";
import { View } from "react-native";

export default function ProfileScreen() {
  const { logOut, user } = useContext(AuthContext);

  return (
    <Screen centered>
      <AppCard padding="lg" style={{ alignSelf: "center", maxWidth: 480 }}>
        <View style={{ gap: atomSpacing[5] }}>
          <View style={{ gap: atomSpacing[2] }}>
            <AppText variant="eyebrow">Account</AppText>
            <AppText
              style={{ fontSize: 20, lineHeight: 27 }}
              variant="body"
            >
              {user?.email ?? "Profile"}
            </AppText>
            <AppText tone="muted">
              This screen is now using the shared atom layer instead of raw
              UI primitives.
            </AppText>
          </View>
          <AppButton
            onPress={() => {
              void logOut();
            }}
          >
            Log out
          </AppButton>
        </View>
      </AppCard>
    </Screen>
  );
}
