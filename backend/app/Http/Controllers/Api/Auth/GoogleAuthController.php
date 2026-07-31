<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Api\Controller;
use App\Services\Auth\AuthService;
use App\Services\Auth\ProfileService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function __construct(
        private readonly ProfileService $profileService,
        private readonly AuthService $authService,
    ) {}

    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            $user = $this->profileService->handleGoogleUser($googleUser);

            Auth::login($user, remember: true);
            request()->session()->regenerate();

            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');

            return redirect($frontendUrl.'/profile?google_auth=success');
        } catch (\Throwable $e) {
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');

            return redirect($frontendUrl.'/login?error='.urlencode($e->getMessage()));
        }
    }
}
