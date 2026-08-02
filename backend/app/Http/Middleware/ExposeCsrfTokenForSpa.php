<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Encryption\Encrypter;
use Illuminate\Cookie\CookieValuePrefix;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Cross-origin SPAs cannot read the XSRF-TOKEN cookie (it belongs to the API host).
 * Laravel decrypts X-XSRF-TOKEN — it must be the same encrypted value as the cookie.
 */
class ExposeCsrfTokenForSpa
{
    public function __construct(private Encrypter $encrypter) {}

    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        if ($request->is('sanctum/csrf-cookie') && $request->hasSession() && $request->session()->isStarted()) {
            $plain = $request->session()->token();

            $encrypted = $this->encrypter->encrypt(
                CookieValuePrefix::create('XSRF-TOKEN', $this->encrypter->getKey()).$plain,
                EncryptCookies::serialized('XSRF-TOKEN'),
            );

            $response->headers->set('X-XSRF-TOKEN', $encrypted);
        }

        return $response;
    }
}
