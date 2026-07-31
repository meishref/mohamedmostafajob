<?php

namespace App\Repositories\Contracts;

use App\Models\Employee;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface EmployeeRepositoryInterface
{
    public function findByEmail(string $email): ?Employee;

    public function findById(string $id): ?Employee;

    public function findByIdWithTrashed(string $id): ?Employee;

    public function create(array $data): Employee;

    public function update(Employee $employee, array $data): Employee;

    public function delete(Employee $employee): bool;

    public function restore(Employee $employee): bool;

    public function paginate(array $filters): LengthAwarePaginator;
}
