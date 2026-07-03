// app/_layout.tsx
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { AuthContext, AuthProvider } from "@/contexts/auth";
import { queryClient } from "@/lib/query-client";
import { navigationIntegration, Sentry } from "@/lib/sentry";
import "@/global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, useNavigationContainerRef } from "expo-router";
import { useContext, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

function RootLayout() {
  const [fontsLoaded] = useFonts({
    Geist: require("@/assets/fonts/Geist-Regular.ttf"),
    "Geist-Regular": require("@/assets/fonts/Geist-Regular.ttf"),
    "Geist-Medium": require("@/assets/fonts/Geist-Medium.ttf"),
    "Geist-SemiBold": require("@/assets/fonts/Geist-SemiBold.ttf"),
    "Geist-Bold": require("@/assets/fonts/Geist-Bold.ttf"),
    "Geist-Black": require("@/assets/fonts/Geist-Black.ttf"),
    "JetBrains Mono": require("@/assets/fonts/JetBrainsMono-Regular.ttf"),
    "JetBrainsMono-Regular": require("@/assets/fonts/JetBrainsMono-Regular.ttf"),
    "JetBrainsMono-Medium": require("@/assets/fonts/JetBrainsMono-Medium.ttf"),
    "JetBrainsMono-SemiBold": require("@/assets/fonts/JetBrainsMono-SemiBold.ttf"),
    "JetBrainsMono-Bold": require("@/assets/fonts/JetBrainsMono-Bold.ttf")
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GluestackUIProvider mode="light">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SafeAreaProvider>
            <RootNavigator />
          </SafeAreaProvider>
        </AuthProvider>
      </QueryClientProvider>
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
