import { RouteLoadingScreen } from "@/components/route-loading-screen";
import { useLocalSearchParams } from "expo-router";
import { lazy, Suspense } from "react";

const ProjectFormScreen = lazy(async () => {
  const module = await import("@/screens/project-form");
  return { default: module.ProjectFormScreen };
});

export default function EditProjectRoute() {
  const params = useLocalSearchParams<{ projectId: string }>();
  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;

  return (
    <Suspense fallback={<RouteLoadingScreen />}>
      <ProjectFormScreen mode="edit" projectId={projectId} />
    </Suspense>
  );
}
