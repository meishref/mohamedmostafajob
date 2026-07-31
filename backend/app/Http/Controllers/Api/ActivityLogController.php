<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Controller as BaseController;
use App\Http\Requests\ActivityLog\IndexActivityLogRequest;
use App\Http\Resources\ActivityLogResource;
use App\Models\ActivityLog;
use App\Repositories\Eloquent\ActivityLogRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends BaseController
{
    public function __construct(
        private readonly ActivityLogRepository $activityLogRepository,
    ) {}

    public function index(IndexActivityLogRequest $request): JsonResponse
    {
        $paginator = $this->activityLogRepository->paginate($request->filters());

        return $this->successResponse(
            ActivityLogResource::collection($paginator->items())->resolve(),
            'Activity logs retrieved successfully.',
            meta: [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        );
    }

    public function show(Request $request, string $activityLog): JsonResponse
    {
        $this->authorize('view', ActivityLog::class);

        $log = $this->activityLogRepository->find($activityLog);

        abort_if(! $log, 404, 'Activity log not found.');

        return $this->successResponse([
            'activity_log' => new ActivityLogResource($log),
        ]);
    }

    public function filters(Request $request): JsonResponse
    {
        $this->authorize('viewAny', ActivityLog::class);

        return $this->successResponse([
            'modules' => ['auth', 'users', 'employees', 'tasks', 'payments', 'expenses', 'settings'],
            'actions' => [
                'login', 'logout', 'register', 'password_reset', 'password_changed',
                'created', 'updated', 'deleted', 'restored', 'completed',
            ],
        ]);
    }
}
