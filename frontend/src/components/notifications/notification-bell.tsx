"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function taskHref(data: Record<string, unknown> | null | undefined): string | null {
  const taskId = data?.task_id;
  return typeof taskId === "string" && taskId.length > 0 ? `/tasks/${taskId}` : null;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: count = 0 } = useUnreadNotificationCount();
  const { data, isLoading, isFetching } = useNotifications(
    { per_page: 8 },
    { enabled: open },
  );
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = data?.notifications ?? [];

  const handleMarkRead = async (id: string, event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    try {
      await markRead.mutateAsync(id);
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await deleteNotification.mutateAsync(id);
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const handleOpenNotification = async (id: string, isRead: boolean) => {
    setOpen(false);
    if (!isRead) {
      try {
        await markRead.mutateAsync(id);
      } catch {
        // Navigation still proceeds; unread count will catch up on next poll.
      }
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="outline"
        size="icon"
        className="relative"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>

      {open && (
        <Card className="absolute end-0 top-full z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Notifications</p>
              {count > 0 && (
                <p className="text-xs text-muted-foreground">{count} unread</p>
              )}
            </div>
            {count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
              >
                <CheckCheck className="me-1 h-3 w-3" />
                Mark all read
              </Button>
            )}
          </div>

          <CardContent className="max-h-96 overflow-y-auto p-0">
            {isLoading || (isFetching && notifications.length === 0) ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications yet
              </p>
            ) : (
              <ul className="divide-y">
                {notifications.map((notification) => {
                  const href = taskHref(notification.data);
                  const body = (
                    <div
                      className={cn(
                        "group flex gap-3 px-4 py-3 transition-colors hover:bg-accent/50",
                        !notification.is_read && "bg-accent/20",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <Badge variant="secondary" className="shrink-0 text-[10px]">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => handleMarkRead(notification.id, e)}
                            disabled={markRead.isPending}
                            aria-label="Mark as read"
                          >
                            <CheckCheck className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => handleDelete(notification.id, e)}
                          disabled={deleteNotification.isPending}
                          aria-label="Delete notification"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );

                  return (
                    <li key={notification.id}>
                      {href ? (
                        <Link
                          href={href}
                          onClick={() =>
                            handleOpenNotification(notification.id, notification.is_read)
                          }
                        >
                          {body}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="w-full text-start"
                          onClick={() =>
                            handleOpenNotification(notification.id, notification.is_read)
                          }
                        >
                          {body}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>

          <div className="border-t px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              asChild
              onClick={() => setOpen(false)}
            >
              <Link href="/notifications">View all notifications</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
