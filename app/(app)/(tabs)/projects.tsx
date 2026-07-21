import { RouteLoadingScreen } from "@/components/route-loading-screen";
import { lazy, Suspense } from "react";

const ProjectsScreen = lazy(() => import("@/screens/projects"));

export default function Projects() {
  return (
    <Suspense fallback={<RouteLoadingScreen />}>
      <ProjectsScreen />
    </Suspense>
  );
}
