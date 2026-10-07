import { RouteLoadingScreen } from "@/shared/route-loading-screen";
import { lazy, Suspense } from "react";

const OrganizationSettingsScreen = lazy(
  () => import("@/features/workspaces/screens/organization-settings-screen")
);

export default function OrganizationSettingsRoute() {
  return (
    <Suspense fallback={<RouteLoadingScreen />}>
      <OrganizationSettingsScreen />
    </Suspense>
  );
}
