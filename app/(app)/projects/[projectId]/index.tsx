import { ProjectFormScreen } from "@/features/projects/screens/project-form-screen";
import ProjectDetailScreen from "@/features/projects/screens/project-detail-screen";
import { useLocalSearchParams } from "expo-router";

export default function ProjectDetailRoute() {
  const params = useLocalSearchParams<{ projectId: string }>();
  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;

  if (projectId === "new") {
    return <ProjectFormScreen mode="create" />;
  }

  return <ProjectDetailScreen />;
}
