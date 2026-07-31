<?php

namespace App\Support;

class UserAgentParser
{
    /** @return array{browser: string|null, operating_system: string|null} */
    public static function parse(?string $userAgent): array
    {
        if (! $userAgent) {
            return ['browser' => null, 'operating_system' => null];
        }

        $browser = 'Unknown Browser';
        if (preg_match('/Firefox\/[\d.]+/i', $userAgent)) {
            $browser = 'Firefox';
        } elseif (preg_match('/Edg\/[\d.]+/i', $userAgent)) {
            $browser = 'Edge';
        } elseif (preg_match('/Chrome\/[\d.]+/i', $userAgent)) {
            $browser = 'Chrome';
        } elseif (preg_match('/Safari\/[\d.]+/i', $userAgent) && ! preg_match('/Chrome/i', $userAgent)) {
            $browser = 'Safari';
        } elseif (preg_match('/MSIE|Trident/i', $userAgent)) {
            $browser = 'Internet Explorer';
        }

        $os = 'Unknown OS';
        if (preg_match('/Windows NT/i', $userAgent)) {
            $os = 'Windows';
        } elseif (preg_match('/Mac OS X/i', $userAgent)) {
            $os = 'macOS';
        } elseif (preg_match('/Linux/i', $userAgent)) {
            $os = 'Linux';
        } elseif (preg_match('/Android/i', $userAgent)) {
            $os = 'Android';
        } elseif (preg_match('/iPhone|iPad/i', $userAgent)) {
            $os = 'iOS';
        }

        return ['browser' => $browser, 'operating_system' => $os];
    }
}
