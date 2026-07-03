import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="preview" />
      <Stack.Screen name="projects/new" />
      <Stack.Screen name="projects/[projectId]/index" />
      <Stack.Screen name="projects/[projectId]/edit" />
    </Stack>
  );
}
