import { useLayoutMode } from "@/shared/hooks/use-layout-mode";
import { AdaptiveSideNavigation } from "@/features/workspaces/components/adaptive-app-navigation";
import OrganizationOnboardingScreen from "@/features/workspaces/screens/organization-onboarding-screen";
import { useWorkspace } from "@/features/workspaces/hooks/use-workspace";
import { Stack, usePathname } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { WorkspaceContextBar } from "@/features/workspaces/components/workspace-context-bar";
import { DesktopAppTopBar } from "@/shared/ui/components/desktop-app-topbar";
import { AppTopBarProvider } from "@/shared/ui/providers/app-topbar-provider";

export default function AppLayout() {
  const { isCompact, isExpanded } = useLayoutMode();
  const { hasWorkspaces, isLoading } = useWorkspace();
  const pathname = usePathname();
  const canRenderWithoutWorkspace =
    pathname === "/shared" ||
    pathname.startsWith("/invitations") ||
    (/^\/projects\/[^/]+/.test(pathname) && pathname !== "/projects/new");

  if (isLoading) {
    return (
      <View style={{ alignItems: "center", flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!hasWorkspaces && !canRenderWithoutWorkspace) {
    return <OrganizationOnboardingScreen />;
  }

  return (
    <AppTopBarProvider>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {!isCompact ? <AdaptiveSideNavigation expanded={isExpanded} /> : null}
        <View key="app-content" style={{ flex: 1, minWidth: 0 }}>
          {isExpanded ? <DesktopAppTopBar /> : null}
          {isCompact ? <WorkspaceContextBar /> : null}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="projects/new/index" />
            <Stack.Screen name="projects/[projectId]/index" />
            <Stack.Screen name="projects/[projectId]/edit" />
            <Stack.Screen name="projects/[projectId]/team" />
            <Stack.Screen name="projects/[projectId]/photos/index" />
            <Stack.Screen name="projects/[projectId]/photos/new/index" />
            <Stack.Screen name="projects/[projectId]/photos/[photoId]/index" />
            <Stack.Screen name="clients/new/index" />
            <Stack.Screen name="clients/[clientId]/index" />
            <Stack.Screen name="clients/[clientId]/edit" />
            <Stack.Screen name="contractors/new/index" />
            <Stack.Screen name="contractors/[contractorId]/index" />
            <Stack.Screen name="contractors/[contractorId]/edit" />
            <Stack.Screen name="workers/new/index" />
            <Stack.Screen name="workers/[workerId]/index" />
            <Stack.Screen name="workers/[workerId]/edit" />
            <Stack.Screen name="suppliers/new/index" />
            <Stack.Screen name="suppliers/[supplierId]/index" />
            <Stack.Screen name="suppliers/[supplierId]/edit" />
            <Stack.Screen name="invitations/index" />
            <Stack.Screen name="organization/index" />
            <Stack.Screen name="organizations/new/index" />
          </Stack>
        </View>
      </View>
    </AppTopBarProvider>
  );
}
