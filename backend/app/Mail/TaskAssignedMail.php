<?php

namespace App\Mail;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TaskAssignedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Task $task,
        public readonly User $recipient,
        public readonly string $action = 'assigned',
    ) {}

    public function envelope(): Envelope
    {
        $subject = match ($this->action) {
            'updated' => 'Task Updated: '.$this->task->title,
            'due_date_changed' => 'Task Due Date Changed: '.$this->task->title,
            default => 'New Task Assigned: '.$this->task->title,
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');

        return new Content(
            markdown: 'emails.tasks.assigned',
            with: [
                'employeeName' => $this->recipient->name,
                'task' => $this->task,
                'action' => $this->action,
                'taskUrl' => $frontendUrl.'/tasks/'.$this->task->id,
            ],
        );
    }
}
