<?php

namespace App\Http\Controllers\Api\Auth;

use App\DTOs\Auth\LoginDTO;
use App\DTOs\Auth\RegisterDTO;
use App\DTOs\Auth\ResetPasswordDTO;
use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register(
            RegisterDTO::fromArray($request->validated())
        );

        return $this->createdResponse([
            'user' => new UserResource($user->load('roles')),
        ], 'Registration successful. Please verify your email address.');
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->authService->login(
            LoginDTO::fromArray($request->validated())
        );

        $request->session()->regenerate();

        return $this->successResponse([
            'user' => new UserResource($user->load('roles', 'permissions')),
        ], 'Logged in successfully');
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $this->successResponse(null, 'Logged out successfully');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $this->authService->getAuthenticatedUser();

        return $this->successResponse([
            'user' => new UserResource($user->load('roles', 'permissions')),
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $message = $this->authService->sendPasswordResetLink($request->validated('email'));

        return $this->successResponse(null, $message);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $message = $this->authService->resetPassword(
            ResetPasswordDTO::fromArray($request->validated())
        );

        return $this->successResponse(null, $message);
    }

    public function sendVerificationEmail(Request $request): JsonResponse
    {
        $user = $this->authService->getAuthenticatedUser();

        if ($user->hasVerifiedEmail()) {
            return $this->successResponse(null, 'Email already verified.');
        }

        $user->sendEmailVerificationNotification();

        return $this->successResponse(null, 'Verification link sent to your email address.');
    }

    public function verifyEmail(Request $request, string $id, string $hash): JsonResponse
    {
        $user = User::query()->findOrFail($id);

        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return $this->errorResponse('Invalid verification link.', 403);
        }

        if ($user->hasVerifiedEmail()) {
            return $this->successResponse([
                'user' => new UserResource($user->load('roles', 'permissions')),
            ], 'Email already verified.');
        }

        if ($user->markEmailAsVerified()) {
            event(new \Illuminate\Auth\Events\Verified($user));
        }

        return $this->successResponse([
            'user' => new UserResource($user->fresh()->load('roles', 'permissions')),
        ], 'Email verified successfully.');
    }
}
