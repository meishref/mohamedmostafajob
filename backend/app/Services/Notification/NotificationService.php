<?php

namespace App\Services\Notification;

use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class NotificationService
{
    public function create(
        string $userId,
        string $type,
        string $title,
        string $message,
        ?array $data = null,
    ): UserNotification {
        return UserNotification::query()->create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /** @param array<int, string> $userIds */
    public function notifyMany(
        array $userIds,
        string $type,
        string $title,
        string $message,
        ?array $data = null,
    ): void {
        foreach (array_unique($userIds) as $userId) {
            $this->create($userId, $type, $title, $message, $data);
        }
    }

    public function notifyAdmins(
        string $type,
        string $title,
        string $message,
        ?array $data = null,
        ?string $excludeUserId = null,
    ): void {
        $adminIds = User::role('admin')->pluck('id')->all();

        if ($excludeUserId) {
            $adminIds = array_values(array_filter($adminIds, fn ($id) => $id !== $excludeUserId));
        }

        $this->notifyMany($adminIds, $type, $title, $message, $data);
    }

    public function unreadCount(?string $userId = null): int
    {
        $userId = $userId ?? Auth::id();

        return UserNotification::query()
            ->where('user_id', $userId)
            ->whereNull('read_at')
            ->count();
    }

    public function paginate(string $userId, array $filters): LengthAwarePaginator
    {
        $query = UserNotification::query()->where('user_id', $userId);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (($filters['read'] ?? '') === 'read') {
            $query->whereNotNull('read_at');
        } elseif (($filters['read'] ?? '') === 'unread') {
            $query->whereNull('read_at');
        }

        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';

        if (in_array($sortField, ['created_at', 'read_at', 'type', 'title'], true)) {
            $query->orderBy($sortField, $sortDirection);
        }

        return $query->paginate(
            perPage: $filters['per_page'] ?? 15,
            page: $filters['page'] ?? 1,
        );
    }

    public function markAsRead(string $userId, string $notificationId): UserNotification
    {
        $notification = UserNotification::query()
            ->where('user_id', $userId)
            ->findOrFail($notificationId);

        if (! $notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return $notification->fresh();
    }

    public function markAllAsRead(string $userId): int
    {
        return UserNotification::query()
            ->where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function delete(string $userId, string $notificationId): void
    {
        UserNotification::query()
            ->where('user_id', $userId)
            ->findOrFail($notificationId)
            ->delete();
    }

    public function find(string $userId, string $notificationId): UserNotification
    {
        return UserNotification::query()
            ->where('user_id', $userId)
            ->findOrFail($notificationId);
    }
}
