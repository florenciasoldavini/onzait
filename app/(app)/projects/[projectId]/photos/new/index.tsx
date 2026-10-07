import { RouteLoadingScreen } from "@/shared/route-loading-screen";
import { parseRequiredUuidRouteParam } from "@/shared/utils/route-params";
import { useLocalSearchParams } from "expo-router";
import { lazy, Suspense } from "react";

const ProjectPhotoUploadScreen = lazy(
  () => import("@/features/photos/screens/project-photo-upload-screen")
);

export default function ProjectPhotoUploadRoute() {
  const params = useLocalSearchParams<{ projectId: string | string[] }>();
  const projectId = parseRequiredUuidRouteParam(params.projectId);

  return (
    <Suspense fallback={<RouteLoadingScreen />}>
      <ProjectPhotoUploadScreen projectId={projectId ?? undefined} />
    </Suspense>
  );
}
