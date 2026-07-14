import {
  AppBadge,
  AppButton,
  AppCard,
  AppHeading,
  AppText,
  Breadcrumb,
  Screen,
  SkeletonBlock,
  useAppToast
} from "@/components/atoms";
import { atomSpacing } from "@/components/atoms/theme";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS
} from "@/features/tasks/constants";
import { useSoftDeleteTask, useTask } from "@/features/tasks/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { EditIcon, TrashIcon } from "@/components/icons";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

export default function TaskDetailScreen() {
  const router = useRouter();
  const toast = useAppToast();
  const params = useLocalSearchParams<{ taskId: string }>();
  const taskId = Array.isArray(params.taskId)
    ? params.taskId[0]
    : params.taskId;
  const taskQuery = useTask(taskId);
  const deleteMutation = useSoftDeleteTask();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (taskQuery.isLoading) {
    return (
      <Screen>
        <View style={{ gap: atomSpacing[5] }}>
          <SkeletonBlock height={44} width="58%" />
          <SkeletonBlock height={320} />
        </View>
      </Screen>
    );
  }

  const task = taskQuery.data;
  if (!task) {
    return (
      <Screen centered>
        <AppCard padding="lg">
          <View style={{ gap: atomSpacing[4] }}>
            <AppHeading variant="section">Task not found</AppHeading>
            <AppText tone="muted">
              This task was removed or you do not have access.
            </AppText>
            <AppButton onPress={() => router.replace("/tasks" as never)}>
              Back to tasks
            </AppButton>
          </View>
        </AppCard>
      </Screen>
    );
  }

  const deleteTask = async () => {
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(task.id);
      setDeleteOpen(false);
      toast.show({
        description: `${task.title} was removed from active tasks.`,
        title: "Task deleted",
        tone: "success"
      });
      router.replace("/tasks" as never);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Task could not be deleted."
      );
    }
  };

  return (
    <Screen>
      <View style={{ gap: atomSpacing[6] }}>
        <Breadcrumb
          items={[
            {
              label: "Tasks",
              onPress: () => router.replace("/tasks" as never)
            },
            { label: "Task Detail" }
          ]}
        />
        <View
          style={{
            alignItems: "flex-start",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: atomSpacing[4],
            justifyContent: "space-between"
          }}
        >
          <View style={{ flex: 1, gap: atomSpacing[2], minWidth: 240 }}>
            <AppHeading selectable variant="hero">
              {task.title}
            </AppHeading>
            <AppText tone="muted">
              {task.project?.name ?? "Standalone task"}
            </AppText>
          </View>
          <View style={{ flexDirection: "row", gap: atomSpacing[2] }}>
            <AppButton
              color="neutral"
              fullWidth={false}
              icon={EditIcon}
              onPress={() => router.push(`/tasks/${task.id}/edit` as never)}
              variant="bordered"
            >
              Edit
            </AppButton>
            <AppButton
              color="danger"
              fullWidth={false}
              icon={TrashIcon}
              onPress={() => setDeleteOpen(true)}
              variant="bordered"
            >
              Delete
            </AppButton>
          </View>
        </View>
        <AppCard padding="lg">
          <View style={{ gap: atomSpacing[5] }}>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: atomSpacing[2]
              }}
            >
              <AppBadge
                tone={
                  task.status === "completed"
                    ? "success"
                    : task.status === "blocked"
                      ? "danger"
                      : task.status === "in_progress"
                        ? "accent"
                        : "default"
                }
              >
                {TASK_STATUS_LABELS[task.status]}
              </AppBadge>
              <AppBadge>
                {TASK_PRIORITY_LABELS[task.priority]} priority
              </AppBadge>
            </View>
            <Detail
              label="Project"
              value={task.project?.name ?? "No project"}
            />
            <Detail label="Due date" value={task.due_date ?? "No due date"} />
            <Detail
              label="Description"
              value={task.description ?? "No description"}
            />
            {task.completed_at ? (
              <Detail
                label="Completed"
                value={new Date(task.completed_at).toLocaleString()}
              />
            ) : null}
          </View>
        </AppCard>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => !deleteMutation.isPending && setDeleteOpen(false)}
        transparent
        visible={deleteOpen}
      >
        <View
          style={{
            alignItems: "center",
            flex: 1,
            justifyContent: "center",
            padding: atomSpacing[5]
          }}
        >
          <Pressable
            accessibilityLabel="Cancel deleting task"
            onPress={() => !deleteMutation.isPending && setDeleteOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(18,18,18,0.28)" }
            ]}
          />
          <AppCard padding="lg" style={{ maxWidth: 460, width: "100%" }}>
            <View style={{ gap: atomSpacing[5] }}>
              <View style={{ gap: atomSpacing[2] }}>
                <AppHeading variant="section">Delete task?</AppHeading>
                <AppText selectable tone="muted">
                  {task.title} will be removed from active task views. This
                  cannot currently be undone in the app.
                </AppText>
                {deleteError ? (
                  <AppText selectable tone="danger">
                    {deleteError}
                  </AppText>
                ) : null}
              </View>
              <View style={{ flexDirection: "row", gap: atomSpacing[3] }}>
                <View style={{ flex: 1 }}>
                  <AppButton
                    color="neutral"
                    isDisabled={deleteMutation.isPending}
                    onPress={() => setDeleteOpen(false)}
                    variant="bordered"
                  >
                    Cancel
                  </AppButton>
                </View>
                <View style={{ flex: 1 }}>
                  <AppButton
                    color="danger"
                    loading={deleteMutation.isPending}
                    onPress={() => void deleteTask()}
                  >
                    Delete
                  </AppButton>
                </View>
              </View>
            </View>
          </AppCard>
        </View>
      </Modal>
    </Screen>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: atomSpacing[1] }}>
      <AppText tone="subtle" variant="meta">
        {label.toUpperCase()}
      </AppText>
      <AppText selectable>{value}</AppText>
    </View>
  );
}
