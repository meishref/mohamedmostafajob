<?php

namespace App\Services\Employee;

use App\Exceptions\ApiException;
use App\Models\Employee;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use App\Services\System\SystemEventService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class EmployeeService
{
    public function __construct(
        private readonly EmployeeRepositoryInterface $employeeRepository,
        private readonly SystemEventService $systemEventService,
    ) {}

    public function list(array $filters): LengthAwarePaginator
    {
        return $this->employeeRepository->paginate($filters);
    }

    public function find(string $id): Employee
    {
        $employee = $this->employeeRepository->findByIdWithTrashed($id);

        if (! $employee) {
            throw new ApiException('Employee not found.', Response::HTTP_NOT_FOUND);
        }

        return $employee->load(['department', 'jobTitle', 'employeeStatus', 'attachments']);
    }

    public function create(array $data, ?UploadedFile $profileImage = null): Employee
    {
        if ($this->employeeRepository->findByEmail($data['email'])) {
            throw new ApiException(
                message: 'Employee creation failed.',
                statusCode: Response::HTTP_UNPROCESSABLE_ENTITY,
                errors: ['email' => ['This email is already registered.']],
            );
        }

        [$firstName, $lastName] = $this->splitFullName($data['full_name']);

        $employeeData = [
            'employee_number' => $data['employee_number'] ?? $this->generateEmployeeNumber(),
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'department_id' => $data['department_id'] ?? null,
            'job_title_id' => $data['job_title_id'] ?? null,
            'employee_status_id' => $data['employee_status_id'],
            'hire_date' => $data['hire_date'] ?? null,
            'notes' => $data['notes'] ?? null,
        ];

        if ($profileImage) {
            $employeeData['profile_image'] = $profileImage->store('employee-images', 'public');
        }

        $employee = $this->employeeRepository->create($employeeData);

        $this->systemEventService->employeeCreated($employee);

        return $employee->load(['department', 'jobTitle', 'employeeStatus', 'attachments']);
    }

    public function update(Employee $employee, array $data, ?UploadedFile $profileImage = null): Employee
    {
        $updateData = [];
        $changes = [];

        if (isset($data['full_name'])) {
            [$firstName, $lastName] = $this->splitFullName($data['full_name']);
            $updateData['first_name'] = $firstName;
            $updateData['last_name'] = $lastName;
            $changes['full_name'] = $data['full_name'];
        }

        foreach (['email', 'phone', 'department_id', 'job_title_id', 'employee_status_id', 'hire_date', 'notes'] as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = $data[$field];
                $changes[$field] = $data[$field];
            }
        }

        if (isset($data['email']) && $data['email'] !== $employee->email) {
            if ($this->employeeRepository->findByEmail($data['email'])) {
                throw new ApiException(
                    message: 'Employee update failed.',
                    statusCode: Response::HTTP_UNPROCESSABLE_ENTITY,
                    errors: ['email' => ['This email is already registered.']],
                );
            }
        }

        if ($profileImage) {
            if ($employee->profile_image) {
                Storage::disk('public')->delete($employee->profile_image);
            }
            $updateData['profile_image'] = $profileImage->store('employee-images', 'public');
            $changes['profile_image'] = 'updated';
        }

        $updated = $this->employeeRepository->update($employee, $updateData);

        $this->systemEventService->employeeUpdated($updated, $changes);

        return $updated->load(['department', 'jobTitle', 'employeeStatus']);
    }

    public function delete(Employee $employee): void
    {
        $this->employeeRepository->delete($employee);

        $this->systemEventService->employeeDeleted($employee);
    }

    public function restore(Employee $employee): Employee
    {
        $this->employeeRepository->restore($employee);
        $restored = $employee->fresh()->load(['department', 'jobTitle', 'employeeStatus']);

        $this->systemEventService->employeeRestored($restored);

        return $restored;
    }

    /** @return array{0: string, 1: string} */
    private function splitFullName(string $fullName): array
    {
        $trimmed = trim($fullName);
        $spacePos = strpos($trimmed, ' ');

        if ($spacePos === false) {
            return [$trimmed, ''];
        }

        return [
            substr($trimmed, 0, $spacePos),
            trim(substr($trimmed, $spacePos + 1)),
        ];
    }

    private function generateEmployeeNumber(): string
    {
        $latest = Employee::withTrashed()
            ->where('employee_number', 'like', 'EMP-%')
            ->orderByDesc('employee_number')
            ->value('employee_number');

        if (! $latest) {
            return 'EMP-0001';
        }

        $number = (int) substr($latest, 4);
        $next = $number + 1;

        return 'EMP-'.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }
}
