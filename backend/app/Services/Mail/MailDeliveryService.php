<?php

namespace App\Services\Mail;

use App\Exceptions\ApiException;
use Illuminate\Mail\Mailable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class MailDeliveryService
{
    public function send(Mailable $mailable, string|array $recipients): bool
    {
        try {
            Mail::to($recipients)->send($mailable);

            return true;
        } catch (Throwable $exception) {
            $this->logFailure('mailable', $mailable::class, $recipients, $exception);

            return false;
        }
    }

    public function sendNotification(object $notifiable, Notification $notification): bool
    {
        try {
            $notifiable->notify($notification);

            return true;
        } catch (Throwable $exception) {
            $this->logFailure('notification', $notification::class, $this->recipientLabel($notifiable), $exception);

            return false;
        }
    }

    public function sendNotificationOrFail(object $notifiable, Notification $notification, string $userMessage): void
    {
        if ($this->sendNotification($notifiable, $notification)) {
            return;
        }

        throw new ApiException(
            message: $userMessage,
            statusCode: Response::HTTP_SERVICE_UNAVAILABLE,
        );
    }

    private function logFailure(
        string $type,
        string $class,
        string|array $recipients,
        Throwable $exception,
    ): void {
        Log::error('Mail delivery failed', [
            'type' => $type,
            'class' => $class,
            'recipients' => is_array($recipients) ? $recipients : [$recipients],
            'message' => $exception->getMessage(),
            'exception' => $exception::class,
        ]);
    }

    private function recipientLabel(object $notifiable): string|array
    {
        if (method_exists($notifiable, 'getEmailForPasswordReset')) {
            return $notifiable->getEmailForPasswordReset();
        }

        if (property_exists($notifiable, 'email') && is_string($notifiable->email)) {
            return $notifiable->email;
        }

        return $notifiable::class;
    }
}
