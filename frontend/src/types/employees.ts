export interface Employee {
  id: string;
  employee_number: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  profile_image: string | null;
  profile_image_url: string | null;
  department_id: string | null;
  department?: { id: string; name: string; code: string } | null;
  job_title_id: string | null;
  job_title?: { id: string; name: string; code: string } | null;
  employee_status_id: string;
  employee_status?: { id: string; name: string; code: string; color?: string | null } | null;
  hire_date: string | null;
  notes: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeListParams {
  search?: string;
  department_id?: string;
  job_title_id?: string;
  employee_status_id?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
  trashed?: "with" | "only" | "without";
}

export interface EmployeeListResponse {
  employees: Employee[];
}

export interface EmployeeResponse {
  employee: Employee;
}

export interface CreateEmployeeData {
  full_name: string;
  email: string;
  phone?: string;
  department_id?: string;
  job_title_id?: string;
  employee_status_id: string;
  hire_date?: string;
  notes?: string;
  profile_image?: File;
}

export interface UpdateEmployeeData {
  full_name?: string;
  email?: string;
  phone?: string | null;
  department_id?: string | null;
  job_title_id?: string | null;
  employee_status_id?: string;
  hire_date?: string | null;
  notes?: string | null;
  profile_image?: File;
}
