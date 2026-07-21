import { RouteLoadingScreen } from "@/shared/route-loading-screen";
import { useLocalSearchParams } from "expo-router";
import { lazy, Suspense } from "react";

const ProjectDetailScreen = lazy(
  () => import("@/features/projects/screens/project-detail-screen")
);
const ProjectFormScreen = lazy(async () => {
  const module = await import(
    "@/features/projects/screens/project-form-screen"
  );
  return { default: module.ProjectFormScreen };
});

export default function ProjectDetailRoute() {
  const params = useLocalSearchParams<{ projectId: string }>();
  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;

  if (projectId === "new") {
    return (
      <Suspense fallback={<RouteLoadingScreen />}>
        <ProjectFormScreen mode="create" />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<RouteLoadingScreen />}>
      <ProjectDetailScreen />
    </Suspense>
  );
}
