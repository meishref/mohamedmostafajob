<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return $this->successResponse([
            'status' => 'ok',
            'timestamp' => now()->toISOString(),
            'service' => config('app.name'),
        ], 'Service is healthy');
    }
}
