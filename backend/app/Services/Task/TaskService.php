<?php

namespace App\Services\Task;

use App\Exceptions\ApiException;
use App\Mail\TaskAssignedMail;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskStatus;
use App\Models\User;
use App\Repositories\Contracts\TaskRepositoryInterface;
use App\Services\System\SystemEventService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpFoundation\Response;

class TaskService
{
    public function __construct(
        private readonly TaskRepositoryInterface $taskRepository,
        private readonly SystemEventService $systemEventService,
    ) {}

    public function list(array $filters, ?User $user = null): LengthAwarePaginator
    {
        $user ??= Auth::user();

        if ($user && ! $user->can('tasks.view') && $user->can('tasks.view-own')) {
            $user->loadMissing('employee');
            $employeeId = $user->employee?->id;
            $filters['assigned_to'] = $employeeId ?: '00000000-0000-0000-0000-000000000000';
            $filters['trashed'] = 'without';
        }

        return $this->taskRepository->paginate($filters);
    }

    public function find(string $id): Task
    {
        $task = $this->taskRepository->findByIdWithTrashed($id);

        if (! $task) {
            throw new ApiException('Task not found.', Response::HTTP_NOT_FOUND);
        }

        return $task->load([
            'assignee.department',
            'assignee.jobTitle',
            'assignee.employeeStatus',
            'assignee.user',
            'taskStatus',
            'priority',
            'creator',
            'attachments.uploader',
            'comments.user',
        ]);
    }

    public function create(array $data): Task
    {
        $taskData = [
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'assigned_to' => $data['assigned_to'] ?? null,
            'created_by' => Auth::id(),
            'task_status_id' => $data['task_status_id'],
            'priority_id' => $data['priority_id'],
            'start_date' => $data['start_date'] ?? null,
            'due_date' => $data['due_date'] ?? null,
            'notes' => $data['notes'] ?? null,
            'completed_at' => $this->resolveCompletedAt($data['task_status_id']),
        ];

        $task = $this->taskRepository->create($taskData);
        $task = $this->find($task->id);

        $this->systemEventService->taskCreated($task);
        $this->sendAssigneeEmail($task, 'assigned');

        return $task;
    }

    public function update(Task $task, array $data): Task
    {
        $before = $task->replicate();
        $updateData = [];
        $changes = [];

        foreach (['title', 'description', 'assigned_to', 'task_status_id', 'priority_id', 'start_date', 'due_date', 'notes'] as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = $data[$field];
                $changes[$field] = $data[$field];
            }
        }

        if (isset($data['task_status_id'])) {
            $updateData['completed_at'] = $this->resolveCompletedAt($data['task_status_id']);
        }

        $updated = $this->taskRepository->update($task, $updateData);
        $updated = $this->find($updated->id);

        $this->systemEventService->taskUpdated($updated, $changes, $before);

        if (isset($changes['assigned_to'])) {
            $this->sendAssigneeEmail($updated, 'assigned');
        } elseif (isset($changes['due_date'])) {
            $this->sendAssigneeEmail($updated, 'due_date_changed');
        } elseif ($changes !== []) {
            $this->sendAssigneeEmail($updated, 'updated');
        }

        return $updated;
    }

    public function updateStatus(Task $task, string $taskStatusId): Task
    {
        $beforeStatusId = $task->task_status_id;

        $updated = $this->taskRepository->update($task, [
            'task_status_id' => $taskStatusId,
            'completed_at' => $this->resolveCompletedAt($taskStatusId),
        ]);

        $updated = $this->find($updated->id);

        $this->systemEventService->taskStatusChanged($updated, $beforeStatusId);

        return $updated;
    }

    public function addComment(Task $task, string $body, User $user): TaskComment
    {
        $comment = $task->comments()->create([
            'user_id' => $user->id,
            'body' => $body,
        ]);

        $comment->load('user');

        $this->systemEventService->taskCommentAdded($task, $comment);

        return $comment;
    }

    public function listComments(Task $task): \Illuminate\Database\Eloquent\Collection
    {
        return $task->comments()->with('user')->latest()->get();
    }

    public function delete(Task $task): void
    {
        $this->taskRepository->delete($task);

        $this->systemEventService->taskDeleted($task);
    }

    public function restore(Task $task): Task
    {
        $this->taskRepository->restore($task);
        $restored = $this->find($task->id);

        $this->systemEventService->taskRestored($restored);

        return $restored;
    }

    private function sendAssigneeEmail(Task $task, string $action): void
    {
        $task->loadMissing(['assignee.user', 'priority', 'taskStatus', 'creator']);

        $user = $task->assignee?->user;

        if (! $user?->email) {
            return;
        }

        Mail::to($user->email)->send(new TaskAssignedMail($task, $user, $action));
    }

    private function resolveCompletedAt(string $taskStatusId): ?\DateTimeInterface
    {
        $status = TaskStatus::query()->find($taskStatusId);

        if ($status?->is_closed) {
            return now();
        }

        return null;
    }
}
