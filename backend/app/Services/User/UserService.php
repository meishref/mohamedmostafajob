<?php

namespace App\Services\User;

use App\Enums\UserStatus;
use App\Exceptions\ApiException;
use App\Models\Employee;
use App\Models\EmployeeStatus;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\System\SystemEventService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class UserService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly SystemEventService $systemEventService,
    ) {}

    public function list(array $filters): LengthAwarePaginator
    {
        return $this->userRepository->paginate($filters);
    }

    public function find(string $id): User
    {
        $user = $this->userRepository->findByIdWithTrashed($id);

        if (! $user) {
            throw new ApiException('User not found.', Response::HTTP_NOT_FOUND);
        }

        return $user;
    }

    public function create(array $data, ?UploadedFile $profileImage = null): User
    {
        if ($this->userRepository->findByEmail($data['email'])) {
            throw new ApiException(
                message: 'User creation failed.',
                statusCode: Response::HTTP_UNPROCESSABLE_ENTITY,
                errors: ['email' => ['This email is already registered.']],
            );
        }

        $userData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'phone' => $data['phone'] ?? null,
            'status' => $data['status'] ?? UserStatus::Active,
        ];

        if ($profileImage) {
            $userData['profile_image'] = $profileImage->store('profile-images', 'public');
        }

        $user = $this->userRepository->create($userData);
        $user->syncRoles([$data['role']]);
        $this->ensureEmployeeProfile($user, $data['role']);

        $this->systemEventService->userCreated($user->load('roles'));

        return $user;
    }

    public function update(User $user, array $data, ?UploadedFile $profileImage = null): User
    {
        $updateData = [];
        $changes = [];

        foreach (['name', 'email', 'phone', 'status'] as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = $data[$field];
                $changes[$field] = $data[$field];
            }
        }

        if (isset($data['email']) && $data['email'] !== $user->email) {
            $updateData['email_verified_at'] = null;
        }

        if ($profileImage) {
            if ($user->profile_image) {
                Storage::disk('public')->delete($user->profile_image);
            }
            $updateData['profile_image'] = $profileImage->store('profile-images', 'public');
        }

        $updatedUser = $this->userRepository->update($user, $updateData);

        if (isset($data['role'])) {
            $updatedUser->syncRoles([$data['role']]);
            $changes['role'] = $data['role'];
            $this->ensureEmployeeProfile($updatedUser, $data['role']);
        }

        $this->systemEventService->userUpdated($updatedUser->load('roles'), $changes);

        return $updatedUser->load('roles');
    }

    public function delete(User $user): void
    {
        if ($user->profile_image) {
            Storage::disk('public')->delete($user->profile_image);
        }

        $this->userRepository->delete($user);

        $this->systemEventService->userDeleted($user);
    }

    public function restore(User $user): User
    {
        $this->userRepository->restore($user);

        $restored = $user->fresh()->load('roles');
        $this->systemEventService->userRestored($restored);

        return $restored;
    }

    public function suspend(User $user): User
    {
        return $this->userRepository->update($user, [
            'status' => UserStatus::Suspended,
        ])->load('roles');
    }

    public function activate(User $user): User
    {
        return $this->userRepository->update($user, [
            'status' => UserStatus::Active,
        ])->load('roles');
    }

    public function resetPassword(User $user, string $password): User
    {
        $updated = $this->userRepository->update($user, [
            'password' => Hash::make($password),
        ])->load('roles');

        $this->systemEventService->passwordChanged($updated);

        return $updated;
    }

    public function assignRole(User $user, string $role): User
    {
        $user->syncRoles([$role]);
        $this->ensureEmployeeProfile($user, $role);

        return $user->load('roles');
    }

    public function ensureEmployeeRole(User $user): User
    {
        return $this->assignRole($user, 'employee');
    }

    /**
     * Employee role users must have a linked Employee record to receive/see assigned tasks.
     */
    private function ensureEmployeeProfile(User $user, string $role): void
    {
        if ($role !== 'employee') {
            return;
        }

        $user->loadMissing('employee');

        if ($user->employee) {
            return;
        }

        $existing = Employee::query()
            ->where('email', $user->email)
            ->whereNull('user_id')
            ->first();

        if ($existing) {
            $existing->update([
                'user_id' => $user->id,
                'phone' => $existing->phone ?: $user->phone,
            ]);

            return;
        }

        $parts = preg_split('/\s+/', trim($user->name), 2) ?: [];
        $firstName = $parts[0] ?: 'Employee';
        $lastName = $parts[1] ?? '';

        $activeStatusId = EmployeeStatus::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->value('id')
            ?? EmployeeStatus::query()->value('id');

        if (! $activeStatusId) {
            throw new ApiException(
                'Cannot create employee profile: no employee status is configured.',
                Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        }

        $linkedElsewhere = Employee::query()
            ->where('email', $user->email)
            ->whereNotNull('user_id')
            ->where('user_id', '!=', $user->id)
            ->exists();

        if ($linkedElsewhere) {
            throw new ApiException(
                'An employee record with this email is already linked to another user.',
                Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        }

        Employee::query()->create([
            'user_id' => $user->id,
            'employee_number' => $this->nextEmployeeNumber(),
            'first_name' => $firstName,
            'last_name' => $lastName !== '' ? $lastName : $firstName,
            'email' => $user->email,
            'phone' => $user->phone,
            'employee_status_id' => $activeStatusId,
            'hire_date' => now()->toDateString(),
        ]);
    }

    private function nextEmployeeNumber(): string
    {
        $latest = Employee::query()
            ->withTrashed()
            ->where('employee_number', 'like', 'EMP-%')
            ->orderByDesc('employee_number')
            ->value('employee_number');

        $sequence = 1;
        if (is_string($latest) && preg_match('/EMP-(\d+)/', $latest, $matches)) {
            $sequence = ((int) $matches[1]) + 1;
        }

        return sprintf('EMP-%04d', $sequence);
    }
}
