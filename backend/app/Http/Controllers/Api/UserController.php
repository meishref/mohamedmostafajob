<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Controller as BaseController;
use App\Http\Requests\User\AssignRoleRequest;
use App\Http\Requests\User\IndexUserRequest;
use App\Http\Requests\User\ResetUserPasswordRequest;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\User\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends BaseController
{
    public function __construct(
        private readonly UserService $userService,
    ) {}

    public function index(IndexUserRequest $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $paginator = $this->userService->list($request->filters());

        return $this->successResponse(
            UserResource::collection($paginator->items())->resolve(),
            'Users retrieved successfully.',
            meta: [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        );
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $user = $this->userService->create(
            $request->validated(),
            $request->file('profile_image'),
        );

        return $this->createdResponse([
            'user' => new UserResource($user),
        ], 'User created successfully.');
    }

    public function show(string $user): JsonResponse
    {
        $model = $this->userService->find($user);
        $this->authorize('view', $model);

        return $this->successResponse([
            'user' => new UserResource($model->load('roles', 'permissions')),
        ]);
    }

    public function update(UpdateUserRequest $request, string $user): JsonResponse
    {
        $model = $this->userService->find($user);
        $this->authorize('update', $model);

        $updated = $this->userService->update(
            $model,
            $request->validated(),
            $request->file('profile_image'),
        );

        return $this->successResponse([
            'user' => new UserResource($updated),
        ], 'User updated successfully.');
    }

    public function destroy(string $user): JsonResponse
    {
        $model = $this->userService->find($user);
        $this->authorize('delete', $model);

        $this->userService->delete($model);

        return $this->successResponse(null, 'User deleted successfully.');
    }

    public function restore(string $user): JsonResponse
    {
        $model = $this->userService->find($user);
        $this->authorize('restore', $model);

        $restored = $this->userService->restore($model);

        return $this->successResponse([
            'user' => new UserResource($restored),
        ], 'User restored successfully.');
    }

    public function suspend(string $user): JsonResponse
    {
        $model = $this->userService->find($user);
        $this->authorize('suspend', $model);

        $suspended = $this->userService->suspend($model);

        return $this->successResponse([
            'user' => new UserResource($suspended),
        ], 'User suspended successfully.');
    }

    public function activate(string $user): JsonResponse
    {
        $model = $this->userService->find($user);
        $this->authorize('update', $model);

        $activated = $this->userService->activate($model);

        return $this->successResponse([
            'user' => new UserResource($activated),
        ], 'User activated successfully.');
    }

    public function resetPassword(ResetUserPasswordRequest $request, string $user): JsonResponse
    {
        $model = $this->userService->find($user);
        $this->authorize('resetPassword', $model);

        $this->userService->resetPassword($model, $request->validated('password'));

        return $this->successResponse(null, 'Password reset successfully.');
    }

    public function assignRole(AssignRoleRequest $request, string $user): JsonResponse
    {
        $model = $this->userService->find($user);
        $this->authorize('assignRole', $model);

        $updated = $this->userService->assignRole($model, $request->validated('role'));

        return $this->successResponse([
            'user' => new UserResource($updated),
        ], 'Role assigned successfully.');
    }

    public function roles(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $roles = \Spatie\Permission\Models\Role::query()
            ->where('guard_name', 'web')
            ->pluck('name');

        return $this->successResponse(['roles' => $roles]);
    }
}
