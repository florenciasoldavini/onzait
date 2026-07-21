import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="projects/new/index" />
      <Stack.Screen name="projects/[projectId]/index" />
      <Stack.Screen name="projects/[projectId]/edit" />
    </Stack>
  );
}
