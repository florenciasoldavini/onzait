import {
  AppButton,
  AppCard,
  AppHeading,
  AppText,
  Breadcrumb,
  CalendarField,
  DropdownSelectField,
  FieldMessage,
  Screen,
  SelectField,
  SkeletonBlock,
  TextAreaField,
  TextField,
  useAppToast
} from "@/components/atoms";
import { atomSpacing } from "@/components/atoms/theme";
import { useProjects } from "@/features/projects/hooks";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS
} from "@/features/tasks/constants";
import { useCreateTask, useTask, useUpdateTask } from "@/features/tasks/hooks";
import type { TaskFormValues } from "@/features/tasks/types";
import {
  taskFormSchema,
  toCreateTaskInput,
  toUpdateTaskInput
} from "@/features/tasks/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { SaveIcon } from "@/components/icons";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

const emptyValues: TaskFormValues = {
  description: "",
  due_date: "",
  priority: "medium",
  project_id: "",
  status: "to_do",
  title: ""
};

export function TaskFormScreen({
  mode,
  projectId,
  taskId
}: {
  mode: "create" | "edit";
  projectId?: string;
  taskId?: string;
}) {
  const router = useRouter();
  const toast = useAppToast();
  const [formError, setFormError] = useState<string | null>(null);
  const taskQuery = useTask(mode === "edit" ? taskId : undefined);
  const projectsQuery = useProjects({ sort: "name_asc" });
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask(taskId ?? "");
  const form = useForm<TaskFormValues>({
    defaultValues: { ...emptyValues, project_id: projectId ?? "" },
    mode: "onChange",
    resolver: zodResolver(taskFormSchema)
  });
  const {
    control,
    formState: { isDirty, isValid },
    handleSubmit,
    reset,
    watch
  } = form;
  const values = watch();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isComplete = Boolean(
    values.title.trim().length >= 2 && values.priority && values.status
  );

  useEffect(() => {
    if (mode === "edit" && taskQuery.data) {
      reset({
        description: taskQuery.data.description ?? "",
        due_date: taskQuery.data.due_date ?? "",
        priority: taskQuery.data.priority,
        project_id: taskQuery.data.project?.id ?? "",
        status: taskQuery.data.status,
        title: taskQuery.data.title
      });
    }
  }, [mode, reset, taskQuery.data]);

  const submit = handleSubmit(async (formValues) => {
    setFormError(null);
    try {
      if (mode === "create") {
        const task = await createMutation.mutateAsync(
          toCreateTaskInput(formValues)
        );
        router.replace(`/tasks/${task.id}` as never);
      } else {
        if (!taskId) throw new Error("Missing task id.");
        await updateMutation.mutateAsync(toUpdateTaskInput(formValues));
        toast.show({
          description: `${formValues.title.trim()} was updated.`,
          title: "Task updated",
          tone: "success"
        });
        router.replace(`/tasks/${taskId}` as never);
      }
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Task could not be saved."
      );
    }
  });

  if (mode === "edit" && taskQuery.isLoading) {
    return (
      <Screen>
        <View style={{ gap: atomSpacing[5] }}>
          <SkeletonBlock height={44} width="55%" />
          <SkeletonBlock height={420} />
        </View>
      </Screen>
    );
  }

  if (mode === "edit" && !taskQuery.data) {
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

  return (
    <Screen>
      <View style={{ gap: atomSpacing[6] }}>
        <View style={{ gap: atomSpacing[3] }}>
          <Breadcrumb
            items={[
              {
                label: "Tasks",
                onPress: () => router.replace("/tasks" as never)
              },
              ...(mode === "edit" && taskId
                ? [
                    {
                      label: "Task Detail",
                      onPress: () => router.replace(`/tasks/${taskId}` as never)
                    }
                  ]
                : []),
              { label: mode === "create" ? "New" : "Edit" }
            ]}
          />
          <AppHeading variant="hero">
            {mode === "create" ? "Create a task." : "Update task details."}
          </AppHeading>
          <AppText tone="muted">
            Plan standalone work or connect the task to a project.
          </AppText>
        </View>

        <AppCard padding="lg">
          <View style={{ gap: atomSpacing[5] }}>
            <Controller
              control={control}
              name="title"
              render={({ field, fieldState }) => (
                <TextField
                  errorText={fieldState.error?.message}
                  label="Title"
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  placeholder="Review foundation inspection"
                  required
                  value={field.value}
                />
              )}
            />
            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <TextAreaField
                  errorText={fieldState.error?.message}
                  label="Description"
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  placeholder="Add scope, handoff notes, or acceptance details..."
                  value={field.value}
                />
              )}
            />
            <Controller
              control={control}
              name="project_id"
              render={({ field, fieldState }) => (
                <DropdownSelectField
                  accessibilityLabel="Select a project for this task"
                  errorText={fieldState.error?.message}
                  helperText={
                    projectsQuery.isLoading
                      ? "Loading projects..."
                      : "Leave this empty for a standalone task."
                  }
                  label="Project"
                  onChange={field.onChange}
                  options={[
                    { label: "No project", value: "" },
                    ...(projectsQuery.data ?? []).map((project) => ({
                      label: project.name,
                      value: project.id
                    }))
                  ]}
                  value={field.value}
                />
              )}
            />
            <Controller
              control={control}
              name="status"
              render={({ field, fieldState }) => (
                <SelectField
                  errorText={fieldState.error?.message}
                  label="Status"
                  onChange={field.onChange}
                  options={TASK_STATUSES.map((value) => ({
                    label: TASK_STATUS_LABELS[value],
                    value
                  }))}
                  required
                  value={field.value}
                />
              )}
            />
            <Controller
              control={control}
              name="priority"
              render={({ field, fieldState }) => (
                <SelectField
                  errorText={fieldState.error?.message}
                  label="Priority"
                  onChange={field.onChange}
                  options={TASK_PRIORITIES.map((value) => ({
                    label: TASK_PRIORITY_LABELS[value],
                    value
                  }))}
                  required
                  value={field.value}
                />
              )}
            />
            <Controller
              control={control}
              name="due_date"
              render={({ field, fieldState }) => (
                <CalendarField
                  errorText={fieldState.error?.message}
                  label="Due date"
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  value={field.value}
                />
              )}
            />
            {formError ? (
              <FieldMessage tone="error">{formError}</FieldMessage>
            ) : null}
            <AppButton
              icon={SaveIcon}
              isDisabled={
                !isValid ||
                !isComplete ||
                isSubmitting ||
                (mode === "edit" && !isDirty)
              }
              loading={isSubmitting}
              onPress={() => void submit()}
            >
              {mode === "create" ? "Create task" : "Save changes"}
            </AppButton>
          </View>
        </AppCard>
      </View>
    </Screen>
  );
}
