<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPassword
{
    protected function resetUrl($notifiable): string
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');

        return $frontendUrl.'/reset-password?token='.$this->token.'&email='.urlencode($notifiable->getEmailForPasswordReset());
    }

    public function toMail($notifiable): MailMessage
    {
        $url = $this->resetUrl($notifiable);

        return (new MailMessage)
            ->subject('Reset Password Notification')
            ->line('You are receiving this email because we received a password reset request for your account.')
            ->action('Reset Password', $url)
            ->line('This password reset link will expire in '.config('auth.passwords.'.config('auth.defaults.passwords').'.expire').' minutes.')
            ->line('If you did not request a password reset, no further action is required.');
    }
}
