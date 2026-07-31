<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Controller as BaseController;
use App\Http\Requests\Attachment\StoreAttachmentRequest;
use App\Http\Resources\AttachmentResource;
use App\Models\Attachment;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\Task;
use App\Services\FileUpload\AttachmentService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttachmentController extends BaseController
{
    public function __construct(
        private readonly AttachmentService $attachmentService,
    ) {}

    public function indexEmployee(Employee $employee): JsonResponse
    {
        $this->authorize('view', $employee);

        return $this->successResponse(
            AttachmentResource::collection($this->attachmentService->list($employee))->resolve(),
        );
    }

    public function storeEmployee(StoreAttachmentRequest $request, Employee $employee): JsonResponse
    {
        $this->authorize('update', $employee);

        $attachment = $this->attachmentService->upload(
            $employee,
            $request->file('file'),
            'employee-attachments',
        );

        return $this->createdResponse([
            'attachment' => new AttachmentResource($attachment->load('uploader')),
        ], 'File uploaded successfully.');
    }

    public function indexPayment(Payment $payment): JsonResponse
    {
        $this->authorize('view', $payment);

        return $this->successResponse(
            AttachmentResource::collection($this->attachmentService->list($payment))->resolve(),
        );
    }

    public function storePayment(StoreAttachmentRequest $request, Payment $payment): JsonResponse
    {
        $this->authorize('update', $payment);

        $attachment = $this->attachmentService->upload(
            $payment,
            $request->file('file'),
            'payment-attachments',
        );

        return $this->createdResponse([
            'attachment' => new AttachmentResource($attachment->load('uploader')),
        ], 'File uploaded successfully.');
    }

    public function indexExpense(Expense $expense): JsonResponse
    {
        $this->authorize('view', $expense);

        return $this->successResponse(
            AttachmentResource::collection($this->attachmentService->list($expense))->resolve(),
        );
    }

    public function storeExpense(StoreAttachmentRequest $request, Expense $expense): JsonResponse
    {
        $this->authorize('update', $expense);

        $attachment = $this->attachmentService->upload(
            $expense,
            $request->file('file'),
            'expense-attachments',
        );

        return $this->createdResponse([
            'attachment' => new AttachmentResource($attachment->load('uploader')),
        ], 'File uploaded successfully.');
    }

    public function indexTask(Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        return $this->successResponse(
            AttachmentResource::collection($this->attachmentService->list($task))->resolve(),
        );
    }

    public function storeTask(StoreAttachmentRequest $request, Task $task): JsonResponse
    {
        $this->authorize('attachFiles', $task);

        $attachment = $this->attachmentService->upload(
            $task,
            $request->file('file'),
            'task-attachments',
        );

        return $this->createdResponse([
            'attachment' => new AttachmentResource($attachment->load('uploader')),
        ], 'File uploaded successfully.');
    }

    public function download(Attachment $attachment): StreamedResponse
    {
        $this->authorizeAttachment($attachment, 'view');

        return $this->attachmentService->download($attachment);
    }

    public function destroy(Attachment $attachment): JsonResponse
    {
        $this->authorizeAttachment($attachment, 'update');

        $this->attachmentService->delete($attachment);

        return $this->successResponse(null, 'Attachment deleted successfully.');
    }

    private function authorizeAttachment(Attachment $attachment, string $action): void
    {
        $model = $attachment->attachable;

        if (! $model instanceof Model) {
            abort(404);
        }

        if ($model instanceof Task) {
            $this->authorize($action === 'view' ? 'view' : 'attachFiles', $model);

            return;
        }

        $this->authorize($action, $model);
    }
}
