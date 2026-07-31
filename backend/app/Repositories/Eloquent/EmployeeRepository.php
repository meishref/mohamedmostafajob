<?php

namespace App\Repositories\Eloquent;

use App\Models\Employee;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EmployeeRepository implements EmployeeRepositoryInterface
{
    public function findByEmail(string $email): ?Employee
    {
        return Employee::query()->where('email', $email)->first();
    }

    public function findById(string $id): ?Employee
    {
        return Employee::query()->find($id);
    }

    public function findByIdWithTrashed(string $id): ?Employee
    {
        return Employee::query()->withTrashed()->find($id);
    }

    public function create(array $data): Employee
    {
        return Employee::query()->create($data);
    }

    public function update(Employee $employee, array $data): Employee
    {
        $employee->update($data);

        return $employee->fresh();
    }

    public function delete(Employee $employee): bool
    {
        return (bool) $employee->delete();
    }

    public function restore(Employee $employee): bool
    {
        return (bool) $employee->restore();
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Employee::query()->with(['department', 'jobTitle', 'employeeStatus']);

        if ($filters['trashed'] === 'only') {
            $query->onlyTrashed();
        } elseif ($filters['trashed'] === 'with') {
            $query->withTrashed();
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('employee_number', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        if (! empty($filters['job_title_id'])) {
            $query->where('job_title_id', $filters['job_title_id']);
        }

        if (! empty($filters['employee_status_id'])) {
            $query->where('employee_status_id', $filters['employee_status_id']);
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('hire_date', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('hire_date', '<=', $filters['date_to']);
        }

        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';
        $allowedSorts = [
            'first_name', 'last_name', 'email', 'employee_number',
            'hire_date', 'created_at', 'updated_at',
        ];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        }

        return $query->paginate(
            perPage: $filters['per_page'] ?? 15,
            page: $filters['page'] ?? 1,
        );
    }
}
