<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Controller as BaseController;
use App\Services\Dashboard\DashboardService;
use App\Services\Dashboard\EmployeeDashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends BaseController
{
    public function __construct(
        private readonly DashboardService $dashboardService,
        private readonly EmployeeDashboardService $employeeDashboardService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user, 401);

        if ($user->hasRole('admin') || $user->can('users.view') || $user->can('tasks.view')) {
            return $this->successResponse(
                array_merge($this->dashboardService->getData(), ['view' => 'admin']),
                'Dashboard data retrieved successfully.',
            );
        }

        return $this->successResponse(
            array_merge($this->employeeDashboardService->getDashboard($user), ['view' => 'employee']),
            'Employee dashboard retrieved successfully.',
        );
    }
}
