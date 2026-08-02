<?php

namespace App\Services\Auth;

use App\DTOs\Auth\LoginDTO;
use App\DTOs\Auth\RegisterDTO;
use App\DTOs\Auth\ResetPasswordDTO;
use App\Enums\UserStatus;
use App\Exceptions\ApiException;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\Mail\MailDeliveryService;
use App\Services\System\SystemEventService;
use App\Services\User\UserService;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Throwable;
use Symfony\Component\HttpFoundation\Response;

class AuthService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly SystemEventService $systemEventService,
        private readonly UserService $userService,
        private readonly MailDeliveryService $mailDeliveryService,
    ) {}

    public function register(RegisterDTO $dto): User
    {
        if ($this->userRepository->findByEmail($dto->email)) {
            throw new ApiException(
                message: 'Registration failed.',
                statusCode: Response::HTTP_UNPROCESSABLE_ENTITY,
                errors: ['email' => ['This email is already registered.']],
            );
        }

        $user = $this->userRepository->create([
            'name' => $dto->name,
            'email' => $dto->email,
            'password' => $dto->password,
            'phone' => $dto->phone,
            'status' => UserStatus::Active,
        ]);

        $this->userService->ensureEmployeeRole($user);

        event(new Registered($user));

        $this->systemEventService->registered($user);

        return $user;
    }

    public function login(LoginDTO $dto): User
    {
        $throttleKey = 'login:'.strtolower($dto->email).'|'.request()->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            throw new ApiException(
                message: 'Too many login attempts.',
                statusCode: Response::HTTP_TOO_MANY_REQUESTS,
                errors: ['email' => ["Please try again in {$seconds} seconds."]],
            );
        }

        $user = $this->userRepository->findByEmail($dto->email);

        if (! $user || ! $user->password || ! Hash::check($dto->password, $user->password)) {
            RateLimiter::hit($throttleKey, 60);

            throw new ApiException(
                message: 'Invalid credentials.',
                statusCode: Response::HTTP_UNPROCESSABLE_ENTITY,
                errors: ['email' => ['The provided credentials are incorrect.']],
            );
        }

        RateLimiter::clear($throttleKey);

        if (! $user->isActive()) {
            throw new ApiException(
                message: 'Your account is not active.',
                statusCode: Response::HTTP_FORBIDDEN,
                errors: ['email' => ['Your account has been deactivated. Please contact support.']],
            );
        }

        Auth::login($user, $dto->remember);

        $this->systemEventService->loggedIn($user);

        return $user;
    }

    public function logout(): void
    {
        $user = Auth::user();
        Auth::guard('web')->logout();

        if ($user instanceof User) {
            $this->systemEventService->loggedOut($user);
        }
    }

    public function getAuthenticatedUser(): User
    {
        /** @var User|null $user */
        $user = Auth::user();

        if (! $user) {
            throw new ApiException(
                message: 'Unauthenticated.',
                statusCode: Response::HTTP_UNAUTHORIZED,
            );
        }

        return $user;
    }

    public function sendPasswordResetLink(string $email): string
    {
        try {
            $status = Password::sendResetLink(['email' => $email]);
        } catch (Throwable $exception) {
            Log::error('Password reset email failed', [
                'email' => $email,
                'message' => $exception->getMessage(),
                'exception' => $exception::class,
            ]);

            throw new ApiException(
                message: 'We could not send the password reset email. Please try again later.',
                statusCode: Response::HTTP_SERVICE_UNAVAILABLE,
                errors: ['email' => ['We could not send the password reset email. Please try again later.']],
            );
        }

        if ($status !== Password::RESET_LINK_SENT) {
            throw new ApiException(
                message: __($status),
                statusCode: Response::HTTP_UNPROCESSABLE_ENTITY,
                errors: ['email' => [__($status)]],
            );
        }

        return __($status);
    }

    public function resetPassword(ResetPasswordDTO $dto): string
    {
        $status = Password::reset(
            [
                'email' => $dto->email,
                'password' => $dto->password,
                'password_confirmation' => $dto->passwordConfirmation,
                'token' => $dto->token,
            ],
            function (User $user, string $password) {
                $user->forceFill(['password' => $password])->save();
                event(new PasswordReset($user));
                $this->systemEventService->passwordReset($user);
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw new ApiException(
                message: __($status),
                statusCode: Response::HTTP_UNPROCESSABLE_ENTITY,
                errors: ['email' => [__($status)]],
            );
        }

        return __($status);
    }

    public function sendVerificationEmail(User $user): string
    {
        if ($user->hasVerifiedEmail()) {
            return 'Email already verified.';
        }

        $this->mailDeliveryService->sendNotificationOrFail(
            $user,
            new VerifyEmailNotification,
            'We could not send the verification email. Please try again later.',
        );

        return 'Verification link sent to your email address.';
    }
}
