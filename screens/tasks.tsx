import {
  AppButton,
  AppCard,
  AppHeading,
  AppText,
  EmptyState,
  NavScreenHeader,
  Screen,
  SelectMenu,
  SkeletonBlock,
  TextField
} from "@/components/atoms";
import { atomPalette, atomRadii, atomSpacing } from "@/components/atoms/theme";
import { useProjects } from "@/features/projects/hooks";
import { TaskListItem } from "@/features/tasks/components/task-list-item";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS
} from "@/features/tasks/constants";
import { useTasks } from "@/features/tasks/hooks";
import type {
  Task,
  TaskPriority,
  TaskSort,
  TaskStatus
} from "@/features/tasks/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  FilterIcon,
  RefreshIcon,
  SearchIcon,
  SortIcon,
  TaskAddIcon
} from "@/components/icons";
import { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle
} from "react-native";

type StatusFilter = TaskStatus | "all";
type PriorityFilter = TaskPriority | "all";

const sortOptions = [
  { label: "Newest", value: "created_desc" },
  { label: "Due date", value: "due_asc" },
  { label: "Priority", value: "priority_desc" },
  { label: "A-Z", value: "title_asc" }
] satisfies { label: string; value: TaskSort }[];

export default function TasksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ projectId?: string }>();
  const initialProjectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;
  const [query, setQuery] = useState("");
  const [projectId, setProjectId] = useState(initialProjectId ?? "all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [sort, setSort] = useState<TaskSort>("created_desc");
  const projectsQuery = useProjects({ sort: "name_asc" });
  const tasksQuery = useTasks({
    priorities: priority === "all" ? [] : [priority],
    projectId,
    query,
    sort,
    statuses: status === "all" ? [] : [status]
  });
  const projectOptions = useMemo(
    () => [
      { label: "All projects", value: "all" },
      { label: "No project", value: "unassigned" },
      ...(projectsQuery.data ?? []).map((project) => ({
        label: project.name,
        value: project.id
      }))
    ],
    [projectsQuery.data]
  );
  const hasFilters = Boolean(
    query.trim() ||
      projectId !== "all" ||
      status !== "all" ||
      priority !== "all"
  );
  const openTasks = (tasksQuery.data ?? []).filter(
    (task) => task.status !== "completed"
  );
  const completedTasks = (tasksQuery.data ?? []).filter(
    (task) => task.status === "completed"
  );

  useEffect(() => {
    if (initialProjectId) setProjectId(initialProjectId);
  }, [initialProjectId]);

  const reset = () => {
    setQuery("");
    setProjectId("all");
    setStatus("all");
    setPriority("all");
    setSort("created_desc");
  };

  return (
    <Screen
      floatingAction={
        <AppButton
          accessibilityLabel="New task"
          icon={TaskAddIcon}
          layout="icon"
          onPress={() => router.push(createTaskHref(projectId) as never)}
          shape="pill"
          size="iconLg"
        />
      }
    >
      <View style={{ gap: atomSpacing[6] }}>
        <NavScreenHeader
          description={
            tasksQuery.data
              ? `${openTasks.length} open · ${completedTasks.length} completed`
              : "Keep site work moving, one task at a time."
          }
          title="Tasks"
        />
        <TextField
          leftIcon={SearchIcon}
          onChangeText={setQuery}
          placeholder="Search tasks"
          value={query}
        />

        <StatusTabs onChange={setStatus} value={status} />

        <View style={styles.filters}>
          <SelectMenu
            accessibilityLabel="Filter by project"
            icon={FilterIcon}
            labelPrefix="Project"
            onChange={setProjectId}
            options={projectOptions}
            value={projectId}
          />
          <SelectMenu
            accessibilityLabel="Filter by priority"
            labelPrefix="Priority"
            onChange={setPriority}
            options={[
              { label: "All", value: "all" },
              ...TASK_PRIORITIES.map((value) => ({
                label: TASK_PRIORITY_LABELS[value],
                value
              }))
            ]}
            value={priority}
          />
          <SelectMenu
            accessibilityLabel="Sort tasks"
            icon={SortIcon}
            labelPrefix="Sort"
            onChange={setSort}
            options={sortOptions}
            value={sort}
          />
        </View>

        {tasksQuery.isLoading ? (
          <AppCard padding="sm" style={styles.listCard}>
            {[0, 1, 2, 3].map((item) => (
              <SkeletonBlock
                height={78}
                key={item}
                radius={0}
                style={item < 3 ? styles.skeletonDivider : undefined}
              />
            ))}
          </AppCard>
        ) : tasksQuery.isError ? (
          <EmptyState
            action={{
              icon: RefreshIcon,
              label: "Retry",
              onPress: () => void tasksQuery.refetch()
            }}
            description={
              tasksQuery.error instanceof Error
                ? tasksQuery.error.message
                : "Tasks could not be loaded."
            }
            title="Tasks unavailable"
          />
        ) : tasksQuery.data?.length ? (
          <View style={styles.sections}>
            {status === "all" ? (
              <>
                <TaskSection
                  onOpen={(task) => router.push(`/tasks/${task.id}` as never)}
                  tasks={openTasks}
                  title="Open"
                />
                <TaskSection
                  onOpen={(task) => router.push(`/tasks/${task.id}` as never)}
                  tasks={completedTasks}
                  title="Completed"
                />
              </>
            ) : (
              <TaskSection
                onOpen={(task) => router.push(`/tasks/${task.id}` as never)}
                tasks={tasksQuery.data}
                title={TASK_STATUS_LABELS[status]}
              />
            )}
          </View>
        ) : (
          <EmptyState
            action={
              hasFilters
                ? { icon: RefreshIcon, label: "Reset filters", onPress: reset }
                : undefined
            }
            description={
              hasFilters
                ? "Adjust or clear the filters to find more tasks."
                : "Create the first task. You can connect it to a project later."
            }
            icon={hasFilters ? FilterIcon : TaskAddIcon}
            title={hasFilters ? "No matching tasks" : "No tasks yet"}
          />
        )}
      </View>
    </Screen>
  );
}

function StatusTabs({
  onChange,
  value
}: {
  onChange: (status: StatusFilter) => void;
  value: StatusFilter;
}) {
  const options = [
    { label: "All", value: "all" },
    ...TASK_STATUSES.map((status) => ({
      label: TASK_STATUS_LABELS[status],
      value: status
    }))
  ] satisfies { label: string; value: StatusFilter }[];

  return (
    <ScrollView
      contentContainerStyle={styles.statusTabs}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.statusTab,
              selected ? styles.statusTabSelected : null,
              pressed ? styles.statusTabPressed : null,
              Platform.OS === "web" ? styles.webCursor : null
            ]}
          >
            <AppText tone={selected ? "inverse" : "muted"} variant="bodySm">
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function TaskSection({
  onOpen,
  tasks,
  title
}: {
  onOpen: (task: Task) => void;
  tasks: Task[];
  title: string;
}) {
  if (!tasks.length) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppHeading variant="section">{title}</AppHeading>
        <AppText tone="muted" variant="meta">
          {tasks.length}
        </AppText>
      </View>
      <AppCard padding="sm" style={styles.listCard}>
        {tasks.map((task, index) => (
          <TaskListItem
            key={task.id}
            onPress={() => onOpen(task)}
            showDivider={index < tasks.length - 1}
            task={task}
          />
        ))}
      </AppCard>
    </View>
  );
}

function createTaskHref(projectId: string) {
  return projectId === "all" || projectId === "unassigned"
    ? "/tasks/new"
    : `/tasks/new?projectId=${projectId}`;
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: atomSpacing[2]
  },
  listCard: {
    padding: 0
  },
  section: {
    gap: atomSpacing[3]
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: atomSpacing[2],
    justifyContent: "space-between"
  },
  sections: {
    gap: atomSpacing[6]
  },
  skeletonDivider: {
    borderBottomColor: atomPalette.borderSubtle,
    borderBottomWidth: 1
  },
  statusTab: {
    backgroundColor: atomPalette.surface,
    borderColor: atomPalette.border,
    borderRadius: atomRadii.full,
    borderWidth: 1,
    paddingHorizontal: atomSpacing[4],
    paddingVertical: atomSpacing[2]
  },
  statusTabPressed: {
    opacity: 0.78
  },
  statusTabSelected: {
    backgroundColor: atomPalette.text,
    borderColor: atomPalette.text
  },
  statusTabs: {
    gap: atomSpacing[2]
  },
  webCursor: {
    cursor: "pointer"
  } as ViewStyle
});
