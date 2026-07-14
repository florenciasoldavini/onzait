import { TaskFormScreen } from "@/screens/task-form";
import { useLocalSearchParams } from "expo-router";

export default function EditTaskRoute() {
  const params = useLocalSearchParams<{ taskId: string }>();
  const taskId = Array.isArray(params.taskId)
    ? params.taskId[0]
    : params.taskId;
  return <TaskFormScreen mode="edit" taskId={taskId} />;
}
