<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Controller as BaseController;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeOptionsController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        abort_unless(
            $request->user()?->can('employees.view') || $request->user()?->can('tasks.view'),
            403,
        );

        $query = Employee::query()->orderBy('first_name')->orderBy('last_name');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('employee_number', 'like', "%{$search}%");
            });
        }

        $employees = $query->limit(500)->get()
            ->sortByDesc(fn (Employee $employee) => $employee->user_id ? 1 : 0)
            ->values()
            ->map(function (Employee $employee) {
                $label = "{$employee->full_name} ({$employee->employee_number})";
                if ($employee->user_id) {
                    $label .= ' · account';
                }

                return [
                    'id' => $employee->id,
                    'name' => $employee->full_name,
                    'code' => $employee->employee_number,
                    'has_user' => (bool) $employee->user_id,
                    'label' => $label,
                ];
            });

        return $this->successResponse($employees, 'Employee options retrieved successfully.');
    }
}
