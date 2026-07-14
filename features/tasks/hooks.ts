import { AuthContext } from "@/contexts/auth";
import {
  createTask,
  getTask,
  listTasks,
  softDeleteTask,
  updateTask
} from "@/features/tasks/services/tasks.service";
import type {
  CreateTaskInput,
  TaskFilters,
  UpdateTaskInput
} from "@/features/tasks/types";
import { normalizeTaskFilters } from "@/features/tasks/validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useMemo } from "react";

const tasksKey = ["tasks"] as const;

export function useTasks(filters: TaskFilters) {
  const { user } = useContext(AuthContext);
  const normalizedFilters = useMemo(
    () => normalizeTaskFilters(filters),
    [filters]
  );

  return useQuery({
    enabled: Boolean(user),
    queryFn: () =>
      listTasks({
        filters,
        userId: user!.id,
        userRole: user!.role
      }),
    queryKey: [...tasksKey, user?.id, user?.role, normalizedFilters]
  });
}

export function useTask(taskId?: string) {
  return useQuery({
    enabled: Boolean(taskId),
    queryFn: () => getTask(taskId!),
    queryKey: [...tasksKey, "detail", taskId]
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: async (task) => {
      await queryClient.invalidateQueries({ queryKey: tasksKey });
      queryClient.setQueryData([...tasksKey, "detail", task.id], task);
    }
  });
}

export function useUpdateTask(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTaskInput) => updateTask(taskId, input),
    onSuccess: async (task) => {
      await queryClient.invalidateQueries({ queryKey: tasksKey });
      queryClient.setQueryData([...tasksKey, "detail", task.id], task);
    }
  });
}

export function useSoftDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => softDeleteTask(taskId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksKey });
    }
  });
}
