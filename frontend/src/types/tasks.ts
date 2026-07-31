import type { Attachment } from "./attachments";
import type { Employee } from "./employees";

export interface TaskComment {
  id: string;
  task_id: string;
  body: string;
  user?: { id: string; name: string; email: string } | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  assignee?: Employee | null;
  created_by: string;
  creator?: { id: string; name: string; email: string } | null;
  task_status_id: string;
  task_status?: {
    id: string;
    name: string;
    code: string;
    color?: string | null;
    is_closed?: boolean;
  } | null;
  priority_id: string;
  priority?: {
    id: string;
    name: string;
    code: string;
    level: number;
    color?: string | null;
  } | null;
  start_date: string | null;
  due_date: string | null;
  notes: string | null;
  completed_at?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  attachments?: Attachment[];
  comments?: TaskComment[];
  comments_count?: number;
  is_overdue?: boolean;
}

export interface TaskListParams {
  search?: string;
  assigned_to?: string;
  task_status_id?: string;
  priority_id?: string;
  department_id?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
  trashed?: "with" | "only" | "without";
}

export interface TaskResponse {
  task: Task;
}

export interface CreateTaskData {
  title: string;
  description: string;
  assigned_to: string;
  task_status_id: string;
  priority_id: string;
  start_date?: string;
  due_date: string;
  notes?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string | null;
  assigned_to?: string | null;
  task_status_id?: string;
  priority_id?: string;
  start_date?: string | null;
  due_date?: string | null;
  notes?: string | null;
}

export interface UpdateTaskStatusData {
  task_status_id: string;
}

export interface CreateTaskCommentData {
  body: string;
}

export interface TaskCommentResponse {
  comment: TaskComment;
}

export interface EmployeeOption {
  id: string;
  name: string;
  code?: string;
  label: string;
}

/** Status codes employees may set via status-only update */
export const EMPLOYEE_TASK_STATUS_CODES = ["todo", "in_progress", "review", "done"] as const;
