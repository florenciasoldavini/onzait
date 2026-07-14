import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="preview" />
      <Stack.Screen name="projects/new/index" />
      <Stack.Screen name="projects/[projectId]/index" />
      <Stack.Screen name="projects/[projectId]/edit" />
      <Stack.Screen name="tasks/new" />
      <Stack.Screen name="tasks/[taskId]/index" />
      <Stack.Screen name="tasks/[taskId]/edit" />
    </Stack>
  );
}
