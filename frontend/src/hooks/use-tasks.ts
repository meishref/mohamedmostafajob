"use client";

import { taskService } from "@/services/task.service";
import type {
  CreateTaskCommentData,
  CreateTaskData,
  TaskListParams,
  UpdateTaskData,
} from "@/types/tasks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (params: TaskListParams) => [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  comments: (id: string) => [...taskKeys.detail(id), "comments"] as const,
  employeeOptions: () => [...taskKeys.all, "employee-options"] as const,
};

export function useTasks(params: TaskListParams = {}) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => taskService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useTask(id: string, enabled = true) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => taskService.get(id),
    enabled: enabled && id.length > 0,
    select: (data) => data.task,
  });
}

export function useTaskComments(id: string, enabled = true) {
  return useQuery({
    queryKey: taskKeys.comments(id),
    queryFn: () => taskService.listComments(id),
    enabled: enabled && id.length > 0,
  });
}

export function useEmployeeOptions(enabled = true) {
  return useQuery({
    queryKey: taskKeys.employeeOptions(),
    queryFn: () => taskService.getEmployeeOptions(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskData) => taskService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.lists() }),
  });
}

export function useUpdateTask(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTaskData) => taskService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
    },
  });
}

export function useUpdateTaskStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task_status_id: string) => taskService.updateStatus(id, task_status_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAddTaskComment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskCommentData) => taskService.addComment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.comments(id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.lists() }),
  });
}

export function useRestoreTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskService.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.lists() }),
  });
}
