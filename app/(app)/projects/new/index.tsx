import { RouteLoadingScreen } from "@/shared/route-loading-screen";
import { lazy, Suspense } from "react";

const ProjectFormScreen = lazy(async () => {
  const module = await import(
    "@/features/projects/screens/project-form-screen"
  );
  return { default: module.ProjectFormScreen };
});

export default function NewProjectRoute() {
  return (
    <Suspense fallback={<RouteLoadingScreen />}>
      <ProjectFormScreen mode="create" />
    </Suspense>
  );
}
