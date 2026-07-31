<?php

use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\GoogleAuthController;
use App\Http\Controllers\Api\CurrencyOptionsController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\EmployeeOptionsController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\GlobalSearchController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\LookupController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\LookupOptionsController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use App\Support\Settings\SettingsRegistry;
use Illuminate\Support\Facades\Route;

$lookupResources = implode('|', SettingsRegistry::slugs());

Route::get('/health', HealthController::class);

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:auth');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:auth');
    Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware('signed')
        ->name('verification.verify');

    Route::get('/google/redirect', [GoogleAuthController::class, 'redirect']);
    Route::get('/google/callback', [GoogleAuthController::class, 'callback']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/email/verification-notification', [AuthController::class, 'sendVerificationEmail'])
            ->middleware('throttle:6,1');
    });
});

Route::middleware('auth:sanctum')->group(function () use ($lookupResources) {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::put('/account/settings', [ProfileController::class, 'updateAccountSettings']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/search', GlobalSearchController::class)->middleware('throttle:search');

    Route::get('/employees/{employee}/attachments', [AttachmentController::class, 'indexEmployee']);
    Route::post('/employees/{employee}/attachments', [AttachmentController::class, 'storeEmployee'])->middleware('throttle:upload');
    Route::get('/payments/{payment}/attachments', [AttachmentController::class, 'indexPayment']);
    Route::post('/payments/{payment}/attachments', [AttachmentController::class, 'storePayment'])->middleware('throttle:upload');
    Route::get('/expenses/{expense}/attachments', [AttachmentController::class, 'indexExpense']);
    Route::post('/expenses/{expense}/attachments', [AttachmentController::class, 'storeExpense'])->middleware('throttle:upload');
    Route::get('/tasks/{task}/attachments', [AttachmentController::class, 'indexTask']);
    Route::post('/tasks/{task}/attachments', [AttachmentController::class, 'storeTask'])->middleware('throttle:upload');
    Route::get('/attachments/{attachment}/download', [AttachmentController::class, 'download']);
    Route::delete('/attachments/{attachment}', [AttachmentController::class, 'destroy']);

    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
    Route::get('/notifications/types', [NotificationController::class, 'types']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::apiResource('notifications', NotificationController::class)->only(['index', 'show', 'destroy']);

    Route::get('/activity-logs/filters', [ActivityLogController::class, 'filters']);
    Route::apiResource('activity-logs', ActivityLogController::class)->only(['index', 'show']);

    Route::post('/payments/{payment}/restore', [PaymentController::class, 'restore']);
    Route::apiResource('payments', PaymentController::class);

    Route::get('/roles', [UserController::class, 'roles']);
    Route::post('/users/{user}/restore', [UserController::class, 'restore']);
    Route::post('/users/{user}/suspend', [UserController::class, 'suspend']);
    Route::post('/users/{user}/activate', [UserController::class, 'activate']);
    Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword']);
    Route::put('/users/{user}/role', [UserController::class, 'assignRole']);
    Route::apiResource('users', UserController::class);

    Route::post('/employees/{employee}/restore', [EmployeeController::class, 'restore']);
    Route::apiResource('employees', EmployeeController::class);

    Route::get('/lookups/employees', [EmployeeOptionsController::class, 'index']);
    Route::post('/tasks/{task}/restore', [TaskController::class, 'restore']);
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus']);
    Route::get('/tasks/{task}/comments', [TaskController::class, 'comments']);
    Route::post('/tasks/{task}/comments', [TaskController::class, 'storeComment']);
    Route::apiResource('tasks', TaskController::class);

    Route::get('/lookups/currencies', [CurrencyOptionsController::class, 'index']);
    Route::post('/expenses/{expense}/restore', [ExpenseController::class, 'restore']);
    Route::apiResource('expenses', ExpenseController::class);

    Route::get('/lookups/{resource}', [LookupOptionsController::class, 'index'])
        ->where('resource', $lookupResources);

    Route::prefix('settings')->group(function () use ($lookupResources) {
        Route::get('/resources', [LookupController::class, 'resources']);
        Route::get('/{resource}', [LookupController::class, 'index'])->where('resource', $lookupResources);
        Route::post('/{resource}', [LookupController::class, 'store'])->where('resource', $lookupResources);
        Route::get('/{resource}/{id}', [LookupController::class, 'show'])->where('resource', $lookupResources);
        Route::put('/{resource}/{id}', [LookupController::class, 'update'])->where('resource', $lookupResources);
        Route::delete('/{resource}/{id}', [LookupController::class, 'destroy'])->where('resource', $lookupResources);
        Route::post('/{resource}/{id}/restore', [LookupController::class, 'restore'])->where('resource', $lookupResources);
    });
});
