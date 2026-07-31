<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Controller as BaseController;
use App\Http\Requests\Payment\IndexPaymentRequest;
use App\Http\Requests\Payment\StorePaymentRequest;
use App\Http\Requests\Payment\UpdatePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\Payment\PaymentService;
use Illuminate\Http\JsonResponse;

class PaymentController extends BaseController
{
    public function __construct(
        private readonly PaymentService $paymentService,
    ) {}

    public function index(IndexPaymentRequest $request): JsonResponse
    {
        $this->authorize('viewAny', Payment::class);

        $paginator = $this->paymentService->list($request->filters());

        return $this->successResponse(
            PaymentResource::collection($paginator->items())->resolve(),
            'Payments retrieved successfully.',
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

    public function store(StorePaymentRequest $request): JsonResponse
    {
        $this->authorize('create', Payment::class);

        $payment = $this->paymentService->create($request->validated());

        return $this->createdResponse([
            'payment' => new PaymentResource($payment),
        ], 'Payment created successfully.');
    }

    public function show(string $payment): JsonResponse
    {
        $model = $this->paymentService->find($payment);
        $this->authorize('view', $model);

        return $this->successResponse([
            'payment' => new PaymentResource($model),
        ]);
    }

    public function update(UpdatePaymentRequest $request, string $payment): JsonResponse
    {
        $model = $this->paymentService->find($payment);
        $this->authorize('update', $model);

        $updated = $this->paymentService->update($model, $request->validated());

        return $this->successResponse([
            'payment' => new PaymentResource($updated),
        ], 'Payment updated successfully.');
    }

    public function destroy(string $payment): JsonResponse
    {
        $model = $this->paymentService->find($payment);
        $this->authorize('delete', $model);

        $this->paymentService->delete($model);

        return $this->successResponse(null, 'Payment deleted successfully.');
    }

    public function restore(string $payment): JsonResponse
    {
        $model = $this->paymentService->find($payment);
        $this->authorize('restore', $model);

        $restored = $this->paymentService->restore($model);

        return $this->successResponse([
            'payment' => new PaymentResource($restored),
        ], 'Payment restored successfully.');
    }
}
