<?php

namespace App\Services\System;

use App\Enums\NotificationType;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskStatus;
use App\Models\User;
use App\Services\ActivityLog\ActivityLogService;
use App\Services\Notification\NotificationService;
use Illuminate\Database\Eloquent\Model;

class SystemEventService
{
    public function __construct(
        private readonly ActivityLogService $activityLogService,
        private readonly NotificationService $notificationService,
    ) {}

    public function loggedIn(User $user): void
    {
        $this->activityLogService->record(
            action: 'login',
            description: "User {$user->name} logged in.",
            module: 'auth',
            userId: $user->id,
        );

        $this->notificationService->create(
            $user->id,
            NotificationType::Login->value,
            'New Login',
            "You logged in to your account.",
            ['user_id' => $user->id],
        );
    }

    public function loggedOut(?User $user): void
    {
        if (! $user) {
            return;
        }

        $this->activityLogService->record(
            action: 'logout',
            description: "User {$user->name} logged out.",
            module: 'auth',
            userId: $user->id,
        );
    }

    public function registered(User $user): void
    {
        $this->activityLogService->log(
            $user,
            'register',
            "User {$user->name} registered.",
            module: 'auth',
        );

        $this->notificationService->notifyAdmins(
            NotificationType::UserCreated->value,
            'New User Registered',
            "{$user->name} ({$user->email}) registered.",
            ['user_id' => $user->id],
            $user->id,
        );
    }

    public function passwordReset(User $user): void
    {
        $this->activityLogService->record(
            action: 'password_reset',
            description: "Password was reset for {$user->email}.",
            module: 'auth',
            subject: $user,
            userId: $user->id,
        );

        $this->notificationService->create(
            $user->id,
            NotificationType::PasswordChanged->value,
            'Password Changed',
            'Your password was reset successfully.',
            ['user_id' => $user->id],
        );
    }

    public function passwordChanged(User $user): void
    {
        $this->activityLogService->record(
            action: 'password_changed',
            description: "Password was changed for {$user->name}.",
            module: 'auth',
            subject: $user,
            userId: $user->id,
        );

        $this->notificationService->create(
            $user->id,
            NotificationType::PasswordChanged->value,
            'Password Changed',
            'Your password was changed successfully.',
            ['user_id' => $user->id],
        );
    }

    public function userCreated(User $user): void
    {
        $this->activityLogService->log(
            $user,
            'created',
            "User {$user->name} was created.",
            module: 'users',
        );

        $this->notificationService->notifyAdmins(
            NotificationType::UserCreated->value,
            'New User Created',
            "User {$user->name} ({$user->email}) was created.",
            ['user_id' => $user->id],
        );
    }

    public function userUpdated(User $user, array $changes = []): void
    {
        $this->activityLogService->log(
            $user,
            'updated',
            "User {$user->name} was updated.",
            ['changes' => $changes],
            module: 'users',
        );
    }

    public function userDeleted(User $user): void
    {
        $this->activityLogService->log(
            $user,
            'deleted',
            "User {$user->name} was deleted.",
            module: 'users',
        );
    }

    public function userRestored(User $user): void
    {
        $this->activityLogService->log(
            $user,
            'restored',
            "User {$user->name} was restored.",
            module: 'users',
        );
    }

    public function employeeCreated(Employee $employee): void
    {
        $this->activityLogService->log(
            $employee,
            'created',
            "Employee {$employee->full_name} was created.",
            ['employee_number' => $employee->employee_number],
            module: 'employees',
        );

        $this->notificationService->notifyAdmins(
            NotificationType::EmployeeAdded->value,
            'Employee Added',
            "Employee {$employee->full_name} was added.",
            ['employee_id' => $employee->id],
        );
    }

    public function employeeUpdated(Employee $employee, array $changes = []): void
    {
        $this->activityLogService->log(
            $employee,
            'updated',
            "Employee {$employee->full_name} was updated.",
            ['changes' => $changes],
            module: 'employees',
        );

        $this->notificationService->notifyAdmins(
            NotificationType::EmployeeUpdated->value,
            'Employee Updated',
            "Employee {$employee->full_name} was updated.",
            ['employee_id' => $employee->id],
        );
    }

    public function employeeDeleted(Employee $employee): void
    {
        $this->activityLogService->log(
            $employee,
            'deleted',
            "Employee {$employee->full_name} was deleted.",
            ['employee_number' => $employee->employee_number],
            module: 'employees',
        );

        $this->notificationService->notifyAdmins(
            NotificationType::EmployeeDeleted->value,
            'Employee Deleted',
            "Employee {$employee->full_name} was deleted.",
            ['employee_id' => $employee->id],
        );
    }

    public function employeeRestored(Employee $employee): void
    {
        $this->activityLogService->log(
            $employee,
            'restored',
            "Employee {$employee->full_name} was restored.",
            ['employee_number' => $employee->employee_number],
            module: 'employees',
        );
    }

    public function taskCreated(Task $task): void
    {
        $this->activityLogService->log(
            $task,
            'created',
            "Task \"{$task->title}\" was created.",
            ['title' => $task->title],
            module: 'tasks',
        );

        if ($task->assigned_to) {
            $this->notifyTaskAssignee($task, NotificationType::TaskAssigned, 'Task Assigned', "You were assigned task \"{$task->title}\".");
        }
    }

    public function taskUpdated(Task $task, array $changes = [], ?Task $before = null): void
    {
        $action = isset($changes['assigned_to']) ? 'assigned' : 'updated';

        $this->activityLogService->log(
            $task,
            $action,
            isset($changes['assigned_to'])
                ? "Task \"{$task->title}\" was assigned."
                : "Task \"{$task->title}\" was updated.",
            ['changes' => $changes],
            module: 'tasks',
        );

        $this->notificationService->notifyAdmins(
            NotificationType::TaskUpdated->value,
            'Task Updated',
            "Task \"{$task->title}\" was updated.",
            ['task_id' => $task->id],
        );

        if (isset($changes['assigned_to']) && $task->assigned_to) {
            $this->notifyTaskAssignee($task, NotificationType::TaskAssigned, 'Task Assigned', "You were assigned task \"{$task->title}\".");
        } elseif ($changes !== []) {
            $this->notifyTaskAssignee($task, NotificationType::TaskUpdated, 'Task Updated', "Task \"{$task->title}\" was updated.");
        }

        if (isset($changes['task_status_id']) && $this->isTaskCompleted($task)) {
            $this->taskCompleted($task);
        }
    }

    public function taskStatusChanged(Task $task, ?string $previousStatusId = null): void
    {
        $statusName = $task->taskStatus?->name ?? 'updated';

        $this->activityLogService->log(
            $task,
            'status_changed',
            "Task \"{$task->title}\" status changed to {$statusName}.",
            [
                'previous_status_id' => $previousStatusId,
                'task_status_id' => $task->task_status_id,
            ],
            module: 'tasks',
        );

        $assigneeName = $task->assignee?->full_name ?? 'An employee';

        $this->notificationService->notifyAdmins(
            NotificationType::TaskStatusChanged->value,
            'Task Status Changed',
            "{$assigneeName} changed \"{$task->title}\" to {$statusName}.",
            ['task_id' => $task->id, 'task_status_id' => $task->task_status_id],
        );

        if ($this->isTaskCompleted($task)) {
            $this->taskCompleted($task);
        }
    }

    public function taskCommentAdded(Task $task, TaskComment $comment): void
    {
        $this->activityLogService->log(
            $task,
            'comment_added',
            "Comment added on task \"{$task->title}\".",
            ['comment_id' => $comment->id, 'user_id' => $comment->user_id],
            module: 'tasks',
        );

        $author = $comment->user?->name ?? 'A user';

        $this->notificationService->notifyAdmins(
            NotificationType::TaskCommentAdded->value,
            'New Task Comment',
            "{$author} commented on \"{$task->title}\".",
            ['task_id' => $task->id, 'comment_id' => $comment->id],
        );
    }

    public function taskDueSoon(Task $task): void
    {
        $this->notifyTaskAssignee(
            $task,
            NotificationType::TaskDueSoon,
            'Task Deadline Approaching',
            "Task \"{$task->title}\" is due soon ({$task->due_date?->format('Y-m-d')}).",
        );
    }

    public function taskOverdue(Task $task): void
    {
        $this->activityLogService->log(
            $task,
            'overdue',
            "Task \"{$task->title}\" is overdue.",
            ['due_date' => $task->due_date?->format('Y-m-d')],
            module: 'tasks',
        );

        $this->notifyTaskAssignee(
            $task,
            NotificationType::TaskOverdue,
            'Task Overdue',
            "Task \"{$task->title}\" is overdue.",
        );

        $this->notificationService->notifyAdmins(
            NotificationType::TaskOverdue->value,
            'Task Overdue',
            "Task \"{$task->title}\" is overdue.",
            ['task_id' => $task->id],
        );
    }

    public function taskCompleted(Task $task): void
    {
        $this->activityLogService->log(
            $task,
            'completed',
            "Task \"{$task->title}\" was completed.",
            ['title' => $task->title],
            module: 'tasks',
        );

        $this->notificationService->notifyAdmins(
            NotificationType::TaskCompleted->value,
            'Task Completed',
            "Task \"{$task->title}\" was marked as completed.",
            ['task_id' => $task->id],
        );

        $this->notifyTaskAssignee($task, NotificationType::TaskCompleted, 'Task Completed', "Task \"{$task->title}\" was completed.");
    }

    public function taskDeleted(Task $task): void
    {
        $this->activityLogService->log(
            $task,
            'deleted',
            "Task \"{$task->title}\" was deleted.",
            ['title' => $task->title],
            module: 'tasks',
        );
    }

    public function taskRestored(Task $task): void
    {
        $this->activityLogService->log(
            $task,
            'restored',
            "Task \"{$task->title}\" was restored.",
            ['title' => $task->title],
            module: 'tasks',
        );
    }

    public function expenseCreated(Expense $expense): void
    {
        $this->activityLogService->log(
            $expense,
            'created',
            "Expense {$expense->expense_number} was created.",
            ['amount' => $expense->amount, 'currency' => $expense->currency],
            module: 'expenses',
        );

        $this->notificationService->notifyAdmins(
            NotificationType::ExpenseAdded->value,
            'Expense Added',
            "Expense {$expense->expense_number} was added ({$expense->currency} {$expense->amount}).",
            ['expense_id' => $expense->id],
        );
    }

    public function expenseUpdated(Expense $expense, array $changes = []): void
    {
        $this->activityLogService->log(
            $expense,
            'updated',
            "Expense {$expense->expense_number} was updated.",
            ['changes' => $changes],
            module: 'expenses',
        );

        $this->notificationService->notifyAdmins(
            NotificationType::ExpenseUpdated->value,
            'Expense Updated',
            "Expense {$expense->expense_number} was updated.",
            ['expense_id' => $expense->id],
        );
    }

    public function expenseDeleted(Expense $expense): void
    {
        $this->activityLogService->log(
            $expense,
            'deleted',
            "Expense {$expense->expense_number} was deleted.",
            ['expense_number' => $expense->expense_number],
            module: 'expenses',
        );
    }

    public function expenseRestored(Expense $expense): void
    {
        $this->activityLogService->log(
            $expense,
            'restored',
            "Expense {$expense->expense_number} was restored.",
            ['expense_number' => $expense->expense_number],
            module: 'expenses',
        );
    }

    public function paymentCreated(Payment $payment): void
    {
        $this->activityLogService->log(
            $payment,
            'created',
            "Payment {$payment->payment_number} was created.",
            ['amount' => $payment->amount, 'currency' => $payment->currency],
            module: 'payments',
        );

        $this->notificationService->notifyAdmins(
            NotificationType::PaymentAdded->value,
            'Payment Added',
            "Payment {$payment->payment_number} was added ({$payment->currency} {$payment->amount}).",
            ['payment_id' => $payment->id],
        );
    }

    public function paymentUpdated(Payment $payment, array $changes = []): void
    {
        $this->activityLogService->log(
            $payment,
            'updated',
            "Payment {$payment->payment_number} was updated.",
            ['changes' => $changes],
            module: 'payments',
        );

        $this->notificationService->notifyAdmins(
            NotificationType::PaymentUpdated->value,
            'Payment Updated',
            "Payment {$payment->payment_number} was updated.",
            ['payment_id' => $payment->id],
        );
    }

    public function paymentDeleted(Payment $payment): void
    {
        $this->activityLogService->log(
            $payment,
            'deleted',
            "Payment {$payment->payment_number} was deleted.",
            ['payment_number' => $payment->payment_number],
            module: 'payments',
        );
    }

    public function paymentRestored(Payment $payment): void
    {
        $this->activityLogService->log(
            $payment,
            'restored',
            "Payment {$payment->payment_number} was restored.",
            ['payment_number' => $payment->payment_number],
            module: 'payments',
        );
    }

    public function settingsChanged(Model $subject, string $action, string $resourceLabel, ?array $properties = null): void
    {
        $this->activityLogService->log(
            $subject,
            $action,
            "Settings: {$resourceLabel} record was {$action}.",
            $properties,
            module: 'settings',
        );
    }

    private function notifyTaskAssignee(Task $task, NotificationType $type, string $title, string $message): void
    {
        $task->loadMissing('assignee.user');
        $userId = $task->assignee?->user_id;

        if ($userId) {
            $this->notificationService->create(
                $userId,
                $type->value,
                $title,
                $message,
                ['task_id' => $task->id],
            );
        }
    }

    private function isTaskCompleted(Task $task): bool
    {
        $status = TaskStatus::query()->find($task->task_status_id);

        return (bool) $status?->is_closed;
    }
}
