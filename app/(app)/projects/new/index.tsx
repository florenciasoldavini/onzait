import { RouteLoadingScreen } from "@/components/route-loading-screen";
import { lazy, Suspense } from "react";

const ProjectFormScreen = lazy(async () => {
  const module = await import("@/screens/project-form");
  return { default: module.ProjectFormScreen };
});

export default function NewProjectRoute() {
  return (
    <Suspense fallback={<RouteLoadingScreen />}>
      <ProjectFormScreen mode="create" />
    </Suspense>
  );
}
