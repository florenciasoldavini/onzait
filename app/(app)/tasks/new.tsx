import { TaskFormScreen } from "@/screens/task-form";
import { useLocalSearchParams } from "expo-router";

export default function NewTaskRoute() {
  const params = useLocalSearchParams<{ projectId?: string }>();
  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;
  return <TaskFormScreen mode="create" projectId={projectId} />;
}
