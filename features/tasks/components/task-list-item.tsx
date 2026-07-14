import { AppBadge, AppText } from "@/components/atoms";
import { atomPalette, atomRadii, atomSpacing } from "@/components/atoms/theme";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS
} from "@/features/tasks/constants";
import { useUpdateTask } from "@/features/tasks/hooks";
import {
  buildTaskCompletionInput,
  getTaskDueLabel
} from "@/features/tasks/presentation";
import type { Task } from "@/features/tasks/types";
import {
  CalendarIcon,
  CheckIcon,
  ChevronRightIcon,
  ProjectsIcon,
  type AppIconComponent
} from "@/components/icons";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type ViewStyle
} from "react-native";

export function TaskListItem({
  onPress,
  showDivider,
  task
}: {
  onPress: () => void;
  showDivider: boolean;
  task: Task;
}) {
  const updateTask = useUpdateTask(task.id);
  const isCompleted = task.status === "completed";
  const dueLabel = getTaskDueLabel(task.due_date);
  const isOverdue = Boolean(dueLabel?.startsWith("Overdue"));

  const toggleCompleted = (event: GestureResponderEvent) => {
    event.stopPropagation();
    updateTask.mutate(buildTaskCompletionInput(task, !isCompleted));
  };

  return (
    <View style={showDivider ? styles.divider : undefined}>
      <Pressable
        accessibilityHint="Opens task details"
        accessibilityLabel={task.title}
        accessibilityRole="button"
        disabled={updateTask.isPending}
        onPress={onPress}
        style={({ hovered, pressed }) => [
          styles.row,
          hovered ? styles.rowHovered : null,
          pressed ? styles.rowPressed : null,
          Platform.OS === "web" ? styles.webCursor : null
        ]}
      >
        <Pressable
          accessibilityLabel={
            isCompleted
              ? `Mark ${task.title} as not completed`
              : `Complete ${task.title}`
          }
          accessibilityRole="checkbox"
          accessibilityState={{
            busy: updateTask.isPending,
            checked: isCompleted,
            disabled: updateTask.isPending
          }}
          disabled={updateTask.isPending}
          hitSlop={8}
          onPress={toggleCompleted}
          style={({ pressed }) => [
            styles.checkbox,
            isCompleted ? styles.checkboxCompleted : null,
            pressed ? styles.checkboxPressed : null,
            Platform.OS === "web" ? styles.webCursor : null
          ]}
        >
          {updateTask.isPending ? (
            <ActivityIndicator color={atomPalette.accent} size="small" />
          ) : isCompleted ? (
            <CheckIcon
              color={atomPalette.accentText}
              size={16}
              strokeWidth={2.6}
            />
          ) : null}
        </Pressable>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <AppText
              numberOfLines={2}
              style={isCompleted ? styles.completedTitle : styles.title}
            >
              {task.title}
            </AppText>
            {task.status !== "to_do" && task.status !== "completed" ? (
              <AppBadge tone={task.status === "blocked" ? "danger" : "accent"}>
                {TASK_STATUS_LABELS[task.status]}
              </AppBadge>
            ) : null}
          </View>

          <View style={styles.metadata}>
            {task.project ? (
              <Metadata icon={ProjectsIcon} text={task.project.name} />
            ) : null}
            {dueLabel ? (
              <Metadata
                danger={isOverdue}
                icon={CalendarIcon}
                text={dueLabel}
              />
            ) : null}
            <View style={styles.priority}>
              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: priorityColor(task.priority) }
                ]}
              />
              <AppText
                tone={task.priority === "urgent" ? "danger" : "subtle"}
                variant="caption"
              >
                {TASK_PRIORITY_LABELS[task.priority]}
              </AppText>
            </View>
          </View>

          {updateTask.isError ? (
            <AppText tone="danger" variant="caption">
              {updateTask.error instanceof Error
                ? updateTask.error.message
                : "Task could not be updated."}
            </AppText>
          ) : null}
        </View>

        <ChevronRightIcon color={atomPalette.textSubtle} size={18} />
      </Pressable>
    </View>
  );
}

function Metadata({
  danger = false,
  icon: Icon,
  text
}: {
  danger?: boolean;
  icon: AppIconComponent;
  text: string;
}) {
  const color = danger ? atomPalette.errorText : atomPalette.textMuted;
  return (
    <View style={styles.metadataItem}>
      <Icon color={color} size={14} />
      <AppText
        numberOfLines={1}
        tone={danger ? "danger" : "muted"}
        variant="caption"
      >
        {text}
      </AppText>
    </View>
  );
}

function priorityColor(priority: Task["priority"]) {
  if (priority === "urgent") return atomPalette.error;
  if (priority === "high") return atomPalette.warning;
  if (priority === "medium") return atomPalette.accent;
  return atomPalette.textSubtle;
}

const styles = StyleSheet.create({
  checkbox: {
    alignItems: "center",
    borderColor: atomPalette.borderStrong,
    borderRadius: atomRadii.full,
    borderWidth: 2,
    height: 26,
    justifyContent: "center",
    marginTop: 2,
    width: 26
  },
  checkboxCompleted: {
    backgroundColor: atomPalette.accent,
    borderColor: atomPalette.accent
  },
  checkboxPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.94 }]
  },
  completedTitle: {
    color: atomPalette.textMuted,
    flex: 1,
    textDecorationLine: "line-through"
  },
  content: {
    flex: 1,
    gap: atomSpacing[2],
    minWidth: 0
  },
  divider: {
    borderBottomColor: atomPalette.borderSubtle,
    borderBottomWidth: 1
  },
  metadata: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: atomSpacing[3]
  },
  metadataItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: atomSpacing[1],
    maxWidth: 220
  },
  priority: {
    alignItems: "center",
    flexDirection: "row",
    gap: atomSpacing[1]
  },
  priorityDot: {
    borderRadius: atomRadii.full,
    height: 7,
    width: 7
  },
  row: {
    alignItems: "flex-start",
    backgroundColor: atomPalette.surface,
    flexDirection: "row",
    gap: atomSpacing[3],
    minHeight: 78,
    paddingHorizontal: atomSpacing[4],
    paddingVertical: atomSpacing[4]
  },
  rowHovered: {
    backgroundColor: atomPalette.surfaceLow
  },
  rowPressed: {
    backgroundColor: atomPalette.surfaceStrong
  },
  title: {
    flex: 1
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: atomSpacing[2]
  },
  webCursor: {
    cursor: "pointer"
  } as ViewStyle
});
