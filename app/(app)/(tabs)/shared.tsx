import { RouteLoadingScreen } from "@/shared/route-loading-screen";
import { lazy, Suspense } from "react";

const SharedProjectsScreen = lazy(
  () => import("@/features/projects/screens/shared-projects-screen")
);

export default function SharedProjectsRoute() {
  return (
    <Suspense fallback={<RouteLoadingScreen />}>
      <SharedProjectsScreen />
    </Suspense>
  );
}
