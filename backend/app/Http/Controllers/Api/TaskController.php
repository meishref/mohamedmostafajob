<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Controller as BaseController;
use App\Http\Requests\Task\IndexTaskRequest;
use App\Http\Requests\Task\StoreTaskCommentRequest;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Requests\Task\UpdateTaskStatusRequest;
use App\Http\Resources\TaskCommentResource;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\Task\TaskService;
use Illuminate\Http\JsonResponse;

class TaskController extends BaseController
{
    public function __construct(
        private readonly TaskService $taskService,
    ) {}

    public function index(IndexTaskRequest $request): JsonResponse
    {
        $this->authorize('viewAny', Task::class);

        $paginator = $this->taskService->list($request->filters(), $request->user());

        return $this->successResponse(
            TaskResource::collection($paginator->items())->resolve(),
            'Tasks retrieved successfully.',
            meta: [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        );
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $this->authorize('create', Task::class);

        $task = $this->taskService->create($request->validated());

        return $this->createdResponse([
            'task' => new TaskResource($task),
        ], 'Task created successfully.');
    }

    public function show(string $task): JsonResponse
    {
        $model = $this->taskService->find($task);
        $this->authorize('view', $model);

        return $this->successResponse([
            'task' => new TaskResource($model),
        ]);
    }

    public function update(UpdateTaskRequest $request, string $task): JsonResponse
    {
        $model = $this->taskService->find($task);
        $this->authorize('update', $model);

        $updated = $this->taskService->update($model, $request->validated());

        return $this->successResponse([
            'task' => new TaskResource($updated),
        ], 'Task updated successfully.');
    }

    public function updateStatus(UpdateTaskStatusRequest $request, string $task): JsonResponse
    {
        $model = $this->taskService->find($task);
        $this->authorize('updateStatus', $model);

        $updated = $this->taskService->updateStatus($model, $request->validated('task_status_id'));

        return $this->successResponse([
            'task' => new TaskResource($updated),
        ], 'Task status updated successfully.');
    }

    public function comments(string $task): JsonResponse
    {
        $model = $this->taskService->find($task);
        $this->authorize('view', $model);

        return $this->successResponse(
            TaskCommentResource::collection($this->taskService->listComments($model))->resolve(),
        );
    }

    public function storeComment(StoreTaskCommentRequest $request, string $task): JsonResponse
    {
        $model = $this->taskService->find($task);
        $this->authorize('comment', $model);

        $comment = $this->taskService->addComment(
            $model,
            $request->validated('body'),
            $request->user(),
        );

        return $this->createdResponse([
            'comment' => new TaskCommentResource($comment),
        ], 'Comment added successfully.');
    }

    public function destroy(string $task): JsonResponse
    {
        $model = $this->taskService->find($task);
        $this->authorize('delete', $model);

        $this->taskService->delete($model);

        return $this->successResponse(null, 'Task deleted successfully.');
    }

    public function restore(string $task): JsonResponse
    {
        $model = $this->taskService->find($task);
        $this->authorize('restore', $model);

        $restored = $this->taskService->restore($model);

        return $this->successResponse([
            'task' => new TaskResource($restored),
        ], 'Task restored successfully.');
    }
}
