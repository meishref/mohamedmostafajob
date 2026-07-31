<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserRepository implements UserRepositoryInterface
{
    public function findByEmail(string $email): ?User
    {
        return User::query()->where('email', $email)->first();
    }

    public function findById(string $id): ?User
    {
        return User::query()->find($id);
    }

    public function findByGoogleId(string $googleId): ?User
    {
        return User::query()->where('google_id', $googleId)->first();
    }

    public function findByIdWithTrashed(string $id): ?User
    {
        return User::query()->withTrashed()->find($id);
    }

    public function create(array $data): User
    {
        return User::query()->create($data);
    }

    public function update(User $user, array $data): User
    {
        $user->update($data);

        return $user->fresh();
    }

    public function delete(User $user): bool
    {
        return (bool) $user->delete();
    }

    public function restore(User $user): bool
    {
        return (bool) $user->restore();
    }

    public function forceDelete(User $user): bool
    {
        return (bool) $user->forceDelete();
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = User::query()->with('roles');

        if ($filters['trashed'] === 'only') {
            $query->onlyTrashed();
        } elseif ($filters['trashed'] === 'with') {
            $query->withTrashed();
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['role'])) {
            $query->role($filters['role']);
        }

        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';
        $allowedSorts = ['name', 'email', 'status', 'created_at', 'updated_at'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        }

        return $query->paginate(
            perPage: $filters['per_page'] ?? 15,
            page: $filters['page'] ?? 1,
        );
    }
}
