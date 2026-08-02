<?php

namespace App\Services\Auth;

use App\Enums\UserStatus;
use App\Exceptions\ApiException;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\System\SystemEventService;
use App\Services\User\UserService;
use App\Support\SecureUploadValidator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class ProfileService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly SystemEventService $systemEventService,
        private readonly UserService $userService,
    ) {}

    public function updateProfile(User $user, array $data, ?UploadedFile $profileImage = null): User
    {
        $updateData = [];

        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
        }

        if (array_key_exists('phone', $data)) {
            $updateData['phone'] = $data['phone'];
        }

        if ($profileImage) {
            SecureUploadValidator::validateImage($profileImage);

            if ($user->profile_image) {
                Storage::disk('public')->delete($user->profile_image);
            }

            $updateData['profile_image'] = $profileImage->store('profile-images', 'public');
        }

        return $this->userRepository->update($user, $updateData);
    }

    public function updateAccountSettings(User $user, array $data): User
    {
        $updateData = [];

        if (isset($data['email']) && $data['email'] !== $user->email) {
            $updateData['email'] = $data['email'];
            $updateData['email_verified_at'] = null;
        }

        if (! empty($data['password'])) {
            $updateData['password'] = $data['password'];
        }

        $updated = $this->userRepository->update($user, $updateData);

        if (! empty($data['password'])) {
            $this->systemEventService->passwordChanged($updated);
        }

        return $updated;
    }

    public function handleGoogleUser(object $googleUser): User
    {
        $user = $this->userRepository->findByGoogleId($googleUser->getId());

        if ($user) {
            if (! $user->isActive()) {
                throw new ApiException(
                    message: 'Your account is not active.',
                    statusCode: Response::HTTP_FORBIDDEN,
                );
            }

            return $user;
        }

        $existingUser = $this->userRepository->findByEmail($googleUser->getEmail());

        if ($existingUser) {
            return $this->userRepository->update($existingUser, [
                'google_id' => $googleUser->getId(),
                'email_verified_at' => $existingUser->email_verified_at ?? now(),
            ]);
        }

        $user = $this->userRepository->create([
            'name' => $googleUser->getName() ?? $googleUser->getNickname() ?? 'Google User',
            'email' => $googleUser->getEmail(),
            'google_id' => $googleUser->getId(),
            'profile_image' => $this->downloadGoogleAvatar($googleUser->getAvatar()),
            'status' => UserStatus::Active,
            'email_verified_at' => now(),
        ]);

        return $this->userService->ensureEmployeeRole($user);
    }

    private function downloadGoogleAvatar(?string $avatarUrl): ?string
    {
        if (! $avatarUrl) {
            return null;
        }

        try {
            $contents = file_get_contents($avatarUrl);
            if ($contents === false) {
                return null;
            }

            $filename = 'profile-images/'.uniqid('google_', true).'.jpg';
            Storage::disk('public')->put($filename, $contents);

            return $filename;
        } catch (\Throwable) {
            return null;
        }
    }
}
