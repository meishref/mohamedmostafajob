<?php

namespace App\Providers;

use App\Models\ActivityLog;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\Task;
use App\Models\User;
use App\Policies\ActivityLogPolicy;
use App\Policies\EmployeePolicy;
use App\Policies\ExpensePolicy;
use App\Policies\PaymentPolicy;
use App\Policies\TaskPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        User::class => UserPolicy::class,
        Employee::class => EmployeePolicy::class,
        Task::class => TaskPolicy::class,
        Expense::class => ExpensePolicy::class,
        Payment::class => PaymentPolicy::class,
        ActivityLog::class => ActivityLogPolicy::class,
    ];

    public function boot(): void
    {
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Employee::class, EmployeePolicy::class);
        Gate::policy(Task::class, TaskPolicy::class);
        Gate::policy(Expense::class, ExpensePolicy::class);
        Gate::policy(Payment::class, PaymentPolicy::class);
        Gate::policy(ActivityLog::class, ActivityLogPolicy::class);
    }
}
