import { apiClient } from "@/lib/api/client";
import type { ApiResponse, PaginatedMeta } from "@/types/api";
import type {
  CreateTaskCommentData,
  CreateTaskData,
  EmployeeOption,
  Task,
  TaskComment,
  TaskCommentResponse,
  TaskListParams,
  TaskResponse,
  UpdateTaskData,
  UpdateTaskStatusData,
} from "@/types/tasks";

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export const taskService = {
  async list(params: TaskListParams = {}): Promise<{ tasks: Task[]; meta: PaginatedMeta }> {
    const { data } = await apiClient.get<ApiResponse<Task[]>>(
      `/tasks${buildQueryString(params as Record<string, unknown>)}`,
    );
    const meta = (data.meta ?? {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    }) as unknown as PaginatedMeta;
    return { tasks: data.data, meta };
  },

  async get(id: string): Promise<TaskResponse> {
    const { data } = await apiClient.get<ApiResponse<TaskResponse>>(`/tasks/${id}`);
    return data.data;
  },

  async create(payload: CreateTaskData): Promise<TaskResponse> {
    const { data } = await apiClient.post<ApiResponse<TaskResponse>>("/tasks", payload);
    return data.data;
  },

  async update(id: string, payload: UpdateTaskData): Promise<TaskResponse> {
    const { data } = await apiClient.put<ApiResponse<TaskResponse>>(`/tasks/${id}`, payload);
    return data.data;
  },

  async updateStatus(id: string, task_status_id: string): Promise<TaskResponse> {
    const payload: UpdateTaskStatusData = { task_status_id };
    const { data } = await apiClient.patch<ApiResponse<TaskResponse>>(
      `/tasks/${id}/status`,
      payload,
    );
    return data.data;
  },

  async listComments(id: string): Promise<TaskComment[]> {
    const { data } = await apiClient.get<ApiResponse<TaskComment[]>>(`/tasks/${id}/comments`);
    return data.data;
  },

  async addComment(id: string, payload: CreateTaskCommentData): Promise<TaskCommentResponse> {
    const { data } = await apiClient.post<ApiResponse<TaskCommentResponse>>(
      `/tasks/${id}/comments`,
      payload,
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },

  async restore(id: string): Promise<TaskResponse> {
    const { data } = await apiClient.post<ApiResponse<TaskResponse>>(`/tasks/${id}/restore`);
    return data.data;
  },

  async getEmployeeOptions(search?: string): Promise<EmployeeOption[]> {
    const { data } = await apiClient.get<ApiResponse<EmployeeOption[]>>(
      `/lookups/employees${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    );
    return data.data;
  },
};
