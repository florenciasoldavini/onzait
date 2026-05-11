// app/_layout.tsx
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { AuthContext, AuthProvider } from "@/contexts/auth";
import { navigationIntegration, Sentry } from "@/lib/sentry";
import "@/global.css";
import { Stack, useNavigationContainerRef } from "expo-router";
import { useContext, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <AuthProvider>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </AuthProvider>
    </GluestackUIProvider>
  );
}

function RootNavigator() {
  const { isLoading, session } = useContext(AuthContext);
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    navigationIntegration.registerNavigationContainer(navigationRef);
  }, [navigationRef]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={Boolean(session)}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default Sentry.wrap(RootLayout);
