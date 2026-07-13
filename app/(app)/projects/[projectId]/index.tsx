import { ProjectFormScreen } from "@/screens/project-form";
import ProjectDetailScreen from "@/screens/project-detail";
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
