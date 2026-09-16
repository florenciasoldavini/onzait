import { RouteLoadingScreen } from "@/shared/route-loading-screen";
import { useRouter } from "expo-router";
import { lazy, Suspense } from "react";

const OrganizationSetupScreen = lazy(
  () => import("@/features/workspaces/screens/organization-setup-screen")
);

export default function CreateOrganizationRoute() {
  const router = useRouter();

  return (
    <Suspense fallback={<RouteLoadingScreen />}>
      <OrganizationSetupScreen
        mode="additional"
        onCreated={() => router.replace("/projects" as never)}
      />
    </Suspense>
  );
}
