<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Controller as BaseController;
use App\Http\Requests\Profile\UpdateAccountSettingsRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\AuthService;
use App\Services\Auth\ProfileService;
use Illuminate\Http\JsonResponse;

class ProfileController extends BaseController
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly ProfileService $profileService,
    ) {}

    public function show(): JsonResponse
    {
        $user = $this->authService->getAuthenticatedUser();

        return $this->successResponse([
            'user' => new UserResource($user->load('roles', 'permissions')),
        ]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->authService->getAuthenticatedUser();

        $updatedUser = $this->profileService->updateProfile(
            $user,
            $request->validated(),
            $request->file('profile_image'),
        );

        return $this->successResponse([
            'user' => new UserResource($updatedUser->load('roles', 'permissions')),
        ], 'Profile updated successfully.');
    }

    public function updateAccountSettings(UpdateAccountSettingsRequest $request): JsonResponse
    {
        $user = $this->authService->getAuthenticatedUser();

        $updatedUser = $this->profileService->updateAccountSettings(
            $user,
            $request->validated(),
        );

        return $this->successResponse([
            'user' => new UserResource($updatedUser->load('roles', 'permissions')),
        ], 'Account settings updated successfully.');
    }
}
