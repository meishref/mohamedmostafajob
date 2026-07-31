<?php

namespace App\Repositories\Contracts;

use App\Models\Task;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface TaskRepositoryInterface
{
    public function findById(string $id): ?Task;

    public function findByIdWithTrashed(string $id): ?Task;

    public function create(array $data): Task;

    public function update(Task $task, array $data): Task;

    public function delete(Task $task): bool;

    public function restore(Task $task): bool;

    public function paginate(array $filters): LengthAwarePaginator;
}
