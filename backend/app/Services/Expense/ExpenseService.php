<?php

namespace App\Services\Expense;

use App\Exceptions\ApiException;
use App\Models\Expense;
use App\Repositories\Contracts\ExpenseRepositoryInterface;
use App\Services\System\SystemEventService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class ExpenseService
{
    public function __construct(
        private readonly ExpenseRepositoryInterface $expenseRepository,
        private readonly SystemEventService $systemEventService,
    ) {}

    public function list(array $filters): LengthAwarePaginator
    {
        return $this->expenseRepository->paginate($filters);
    }

    public function find(string $id): Expense
    {
        $expense = $this->expenseRepository->findByIdWithTrashed($id);

        if (! $expense) {
            throw new ApiException('Expense not found.', Response::HTTP_NOT_FOUND);
        }

        return $expense->load(['category', 'platform', 'creator', 'attachments']);
    }

    public function create(array $data, ?UploadedFile $attachment = null): Expense
    {
        $expenseData = [
            'expense_number' => $this->generateExpenseNumber(),
            'category_id' => $data['category_id'],
            'platform_id' => $data['platform_id'] ?? null,
            'amount' => $data['amount'],
            'currency' => strtoupper($data['currency']),
            'expense_date' => $data['expense_date'],
            'description' => $data['notes'] ?? null,
            'created_by' => Auth::id(),
        ];

        if ($attachment) {
            $expenseData['receipt_path'] = $attachment->store('expense-attachments', 'public');
        }

        $expense = $this->expenseRepository->create($expenseData);

        $this->systemEventService->expenseCreated($expense);

        return $this->find($expense->id);
    }

    public function update(Expense $expense, array $data, ?UploadedFile $attachment = null): Expense
    {
        $updateData = [];
        $changes = [];

        foreach (['category_id', 'platform_id', 'amount', 'expense_date'] as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = $data[$field];
                $changes[$field] = $data[$field];
            }
        }

        if (array_key_exists('currency', $data)) {
            $updateData['currency'] = strtoupper($data['currency']);
            $changes['currency'] = $updateData['currency'];
        }

        if (array_key_exists('notes', $data)) {
            $updateData['description'] = $data['notes'];
            $changes['notes'] = $data['notes'];
        }

        if ($attachment) {
            if ($expense->receipt_path) {
                Storage::disk('public')->delete($expense->receipt_path);
            }
            $updateData['receipt_path'] = $attachment->store('expense-attachments', 'public');
            $changes['attachment'] = 'updated';
        }

        $updated = $this->expenseRepository->update($expense, $updateData);

        $this->systemEventService->expenseUpdated($updated, $changes);

        return $this->find($updated->id);
    }

    public function delete(Expense $expense): void
    {
        $this->expenseRepository->delete($expense);

        $this->systemEventService->expenseDeleted($expense);
    }

    public function restore(Expense $expense): Expense
    {
        $this->expenseRepository->restore($expense);
        $restored = $this->find($expense->id);

        $this->systemEventService->expenseRestored($restored);

        return $restored;
    }

    private function generateExpenseNumber(): string
    {
        $latest = Expense::withTrashed()
            ->where('expense_number', 'like', 'EXP-%')
            ->orderByDesc('expense_number')
            ->value('expense_number');

        if (! $latest) {
            return 'EXP-0001';
        }

        $number = (int) substr($latest, 4);

        return 'EXP-'.str_pad((string) ($number + 1), 4, '0', STR_PAD_LEFT);
    }
}
