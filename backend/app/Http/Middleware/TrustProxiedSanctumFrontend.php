<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sanctum enables session middleware on api/* only when Origin/Referer matches
 * SANCTUM_STATEFUL_DOMAINS. Reverse proxies (Next.js) often forward requests
 * without those headers on same-origin browser traffic — derive Origin from
 * X-Forwarded-Host when it matches a configured stateful domain.
 */
class TrustProxiedSanctumFrontend
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->headers->get('origin') || $request->headers->get('referer')) {
            return $next($request);
        }

        $forwardedHost = $request->headers->get('X-Forwarded-Host');
        if (! is_string($forwardedHost) || $forwardedHost === '') {
            return $next($request);
        }

        $host = strtolower(trim(explode(',', $forwardedHost)[0]));
        $stateful = array_filter(config('sanctum.stateful', []));

        foreach ($stateful as $domain) {
            if (strcasecmp(trim($domain), $host) !== 0) {
                continue;
            }

            $proto = $request->headers->get('X-Forwarded-Proto', 'http');
            $request->headers->set('Origin', "{$proto}://{$host}");

            break;
        }

        return $next($request);
    }
}
