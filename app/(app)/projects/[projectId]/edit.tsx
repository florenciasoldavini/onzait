import { ProjectFormScreen } from "@/features/projects/screens/project-form-screen";
import { useLocalSearchParams } from "expo-router";

export default function EditProjectRoute() {
  const params = useLocalSearchParams<{ projectId: string }>();
  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;

  return <ProjectFormScreen mode="edit" projectId={projectId} />;
}
