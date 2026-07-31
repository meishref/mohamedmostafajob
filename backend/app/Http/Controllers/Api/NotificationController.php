<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Controller as BaseController;
use App\Http\Requests\Notification\IndexNotificationRequest;
use App\Http\Resources\NotificationResource;
use App\Services\Notification\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends BaseController
{
    public function __construct(
        private readonly NotificationService $notificationService,
    ) {}

    public function index(IndexNotificationRequest $request): JsonResponse
    {
        $paginator = $this->notificationService->paginate(
            Auth::id(),
            $request->filters(),
        );

        return $this->successResponse(
            NotificationResource::collection($paginator->items())->resolve(),
            'Notifications retrieved successfully.',
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

    public function unreadCount(Request $request): JsonResponse
    {
        return $this->successResponse([
            'count' => $this->notificationService->unreadCount(Auth::id()),
        ]);
    }

    public function show(Request $request, string $notification): JsonResponse
    {
        $item = $this->notificationService->find(Auth::id(), $notification);

        return $this->successResponse([
            'notification' => new NotificationResource($item),
        ]);
    }

    public function markRead(Request $request, string $notification): JsonResponse
    {
        $item = $this->notificationService->markAsRead(Auth::id(), $notification);

        return $this->successResponse([
            'notification' => new NotificationResource($item),
        ], 'Notification marked as read.');
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $count = $this->notificationService->markAllAsRead(Auth::id());

        return $this->successResponse([
            'updated' => $count,
        ], 'All notifications marked as read.');
    }

    public function destroy(Request $request, string $notification): JsonResponse
    {
        $this->notificationService->delete(Auth::id(), $notification);

        return $this->successResponse(null, 'Notification deleted successfully.');
    }

    public function types(Request $request): JsonResponse
    {
        return $this->successResponse([
            'types' => collect(\App\Enums\NotificationType::cases())->map(fn ($type) => [
                'value' => $type->value,
                'label' => str($type->value)->replace('.', ' ')->title()->toString(),
            ])->values(),
        ]);
    }
}
