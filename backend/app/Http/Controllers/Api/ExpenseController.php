<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Controller as BaseController;
use App\Http\Requests\Expense\IndexExpenseRequest;
use App\Http\Requests\Expense\StoreExpenseRequest;
use App\Http\Requests\Expense\UpdateExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use App\Services\Expense\ExpenseService;
use Illuminate\Http\JsonResponse;

class ExpenseController extends BaseController
{
    public function __construct(
        private readonly ExpenseService $expenseService,
    ) {}

    public function index(IndexExpenseRequest $request): JsonResponse
    {
        $this->authorize('viewAny', Expense::class);

        $paginator = $this->expenseService->list($request->filters());

        return $this->successResponse(
            ExpenseResource::collection($paginator->items())->resolve(),
            'Expenses retrieved successfully.',
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

    public function store(StoreExpenseRequest $request): JsonResponse
    {
        $this->authorize('create', Expense::class);

        $expense = $this->expenseService->create(
            $request->validated(),
            $request->file('attachment'),
        );

        return $this->createdResponse([
            'expense' => new ExpenseResource($expense),
        ], 'Expense created successfully.');
    }

    public function show(string $expense): JsonResponse
    {
        $model = $this->expenseService->find($expense);
        $this->authorize('view', $model);

        return $this->successResponse([
            'expense' => new ExpenseResource($model),
        ]);
    }

    public function update(UpdateExpenseRequest $request, string $expense): JsonResponse
    {
        $model = $this->expenseService->find($expense);
        $this->authorize('update', $model);

        $updated = $this->expenseService->update(
            $model,
            $request->validated(),
            $request->file('attachment'),
        );

        return $this->successResponse([
            'expense' => new ExpenseResource($updated),
        ], 'Expense updated successfully.');
    }

    public function destroy(string $expense): JsonResponse
    {
        $model = $this->expenseService->find($expense);
        $this->authorize('delete', $model);

        $this->expenseService->delete($model);

        return $this->successResponse(null, 'Expense deleted successfully.');
    }

    public function restore(string $expense): JsonResponse
    {
        $model = $this->expenseService->find($expense);
        $this->authorize('restore', $model);

        $restored = $this->expenseService->restore($model);

        return $this->successResponse([
            'expense' => new ExpenseResource($restored),
        ], 'Expense restored successfully.');
    }
}
