<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Response;

/**
 * Cross-origin SPAs cannot read the XSRF-TOKEN cookie (it belongs to the API host).
 * Laravel expects X-XSRF-TOKEN to carry the same encrypted value as the cookie.
 */
class ExposeCsrfTokenForSpa
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        if (! $request->is('sanctum/csrf-cookie')) {
            return $response;
        }

        $encryptedToken = $this->resolveXsrfCookieValue($request, $response);

        if ($encryptedToken !== null) {
            $response->headers->set('X-XSRF-TOKEN', $encryptedToken);
        }

        return $response;
    }

    private function resolveXsrfCookieValue(Request $request, Response $response): ?string
    {
        /** @var Cookie[] $cookies */
        $cookies = $response->headers->getCookies();

        foreach ($cookies as $cookie) {
            if ($cookie->getName() === 'XSRF-TOKEN') {
                return $cookie->getValue();
            }
        }

        return $request->cookies->get('XSRF-TOKEN');
    }
}
