export interface DashboardStatistics {
  total_employees: number;
  total_departments: number;
  total_tasks: number;
  total_payments: number;
  total_expenses: number;
}

export interface MonthlyChartPoint {
  month: string;
  label: string;
  total: number;
}

export interface TaskStatusChartPoint {
  id: string;
  name: string;
  code: string;
  color: string | null;
  count: number;
}

export interface DepartmentChartPoint {
  id: string;
  name: string;
  count: number;
}

export interface RecentEmployee {
  id: string;
  full_name: string;
  employee_number: string;
  email: string;
  department: string | null;
  status: string | null;
  created_at: string;
}

export interface RecentTask {
  id: string;
  title: string;
  status: string | null;
  status_color: string | null;
  priority: string | null;
  assignee: string | null;
  due_date: string | null;
  created_at: string;
}

export interface RecentPayment {
  id: string;
  payment_number: string;
  employee: string | null;
  amount: string | number;
  currency: string;
  payment_date: string | null;
  status: string | null;
  status_color: string | null;
  type: string | null;
  created_at: string;
}

export interface RecentExpense {
  id: string;
  expense_number: string;
  category: string | null;
  platform: string | null;
  amount: string | number;
  currency: string;
  expense_date: string | null;
  created_at: string;
}

export interface RecentActivity {
  id: string;
  action: string;
  description: string | null;
  user: string | null;
  subject_type: string | null;
  created_at: string;
}

export interface DashboardCharts {
  monthly_expenses: MonthlyChartPoint[];
  monthly_payments: MonthlyChartPoint[];
  tasks_by_status: TaskStatusChartPoint[];
  employees_by_department: DepartmentChartPoint[];
}

export interface DashboardRecent {
  employees: RecentEmployee[];
  tasks: RecentTask[];
  payments: RecentPayment[];
  expenses: RecentExpense[];
  activities: RecentActivity[];
}

export interface AdminDashboardData {
  view: "admin";
  statistics: DashboardStatistics;
  charts: DashboardCharts;
  recent: DashboardRecent;
}

export interface EmployeeDashboardEmployee {
  id: string;
  full_name: string;
  employee_number: string;
}

export interface EmployeeDashboardStatistics {
  my_tasks: number;
  new_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  due_today_tasks: number;
  upcoming_tasks: number;
}

export interface EmployeeDashboardTask {
  id: string;
  title: string;
  due_date: string | null;
  task_status: {
    id: string;
    name: string;
    code: string;
    color: string | null;
  } | null;
  priority: {
    id: string;
    name: string;
    code: string;
    color: string | null;
  } | null;
  creator: {
    id: string;
    name: string;
  } | null;
  updated_at: string | null;
}

export interface EmployeeDashboardNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  data: Record<string, unknown> | null;
  created_at: string | null;
}

export interface EmployeeDashboardData {
  view: "employee";
  employee: EmployeeDashboardEmployee | null;
  statistics: EmployeeDashboardStatistics;
  tasks: {
    due_today: EmployeeDashboardTask[];
    overdue: EmployeeDashboardTask[];
    upcoming: EmployeeDashboardTask[];
    recent: EmployeeDashboardTask[];
  };
  notifications: EmployeeDashboardNotification[];
}

export type DashboardData = AdminDashboardData | EmployeeDashboardData;
