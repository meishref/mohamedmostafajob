<?php

namespace App\Repositories\Contracts;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface UserRepositoryInterface
{
    public function findByEmail(string $email): ?User;

    public function findById(string $id): ?User;

    public function findByGoogleId(string $googleId): ?User;

    public function findByIdWithTrashed(string $id): ?User;

    public function create(array $data): User;

    public function update(User $user, array $data): User;

    public function delete(User $user): bool;

    public function restore(User $user): bool;

    public function forceDelete(User $user): bool;

    public function paginate(array $filters): LengthAwarePaginator;
}
