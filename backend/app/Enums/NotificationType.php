<?php

namespace App\Enums;

enum NotificationType: string
{
    case UserCreated = 'user.created';
    case EmployeeAdded = 'employee.added';
    case EmployeeUpdated = 'employee.updated';
    case EmployeeDeleted = 'employee.deleted';
    case TaskAssigned = 'task.assigned';
    case TaskUpdated = 'task.updated';
    case TaskCompleted = 'task.completed';
    case TaskStatusChanged = 'task.status_changed';
    case TaskCommentAdded = 'task.comment_added';
    case TaskDueSoon = 'task.due_soon';
    case TaskOverdue = 'task.overdue';
    case PaymentAdded = 'payment.added';
    case PaymentUpdated = 'payment.updated';
    case ExpenseAdded = 'expense.added';
    case ExpenseUpdated = 'expense.updated';
    case Login = 'auth.login';
    case PasswordChanged = 'auth.password_changed';
}
