<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Cross-origin SPAs cannot read the XSRF-TOKEN cookie (it belongs to the API host).
 * Expose the plain token in a response header so the frontend can send X-XSRF-TOKEN.
 */
class ExposeCsrfTokenForSpa
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        if ($request->is('sanctum/csrf-cookie') && $request->session()->isStarted()) {
            $response->headers->set('X-XSRF-TOKEN', $request->session()->token());
        }

        return $response;
    }
}
