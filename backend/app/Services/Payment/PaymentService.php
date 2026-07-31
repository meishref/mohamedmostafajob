<?php

namespace App\Services\Payment;

use App\Exceptions\ApiException;
use App\Models\Payment;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use App\Services\System\SystemEventService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class PaymentService
{
    public function __construct(
        private readonly PaymentRepositoryInterface $paymentRepository,
        private readonly SystemEventService $systemEventService,
    ) {}

    public function list(array $filters): LengthAwarePaginator
    {
        return $this->paymentRepository->paginate($filters);
    }

    public function find(string $id): Payment
    {
        $payment = $this->paymentRepository->findByIdWithTrashed($id);

        if (! $payment) {
            throw new ApiException('Payment not found.', Response::HTTP_NOT_FOUND);
        }

        return $payment->load(['employee', 'paymentType', 'paymentStatus', 'creator', 'attachments']);
    }

    public function create(array $data): Payment
    {
        $payment = $this->paymentRepository->create([
            'payment_number' => $this->generatePaymentNumber(),
            'employee_id' => $data['employee_id'],
            'payment_type_id' => $data['payment_type_id'],
            'payment_status_id' => $data['payment_status_id'],
            'amount' => $data['amount'],
            'currency' => strtoupper($data['currency']),
            'payment_date' => $data['payment_date'],
            'reference' => $data['reference'] ?? null,
            'notes' => $data['notes'] ?? null,
            'created_by' => Auth::id(),
        ]);

        $this->systemEventService->paymentCreated($payment);

        return $this->find($payment->id);
    }

    public function update(Payment $payment, array $data): Payment
    {
        $updateData = [];
        $changes = [];

        foreach (['employee_id', 'payment_type_id', 'payment_status_id', 'amount', 'payment_date', 'reference', 'notes'] as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = $data[$field];
                $changes[$field] = $data[$field];
            }
        }

        if (array_key_exists('currency', $data)) {
            $updateData['currency'] = strtoupper($data['currency']);
            $changes['currency'] = $updateData['currency'];
        }

        $updated = $this->paymentRepository->update($payment, $updateData);

        $this->systemEventService->paymentUpdated($updated, $changes);

        return $this->find($updated->id);
    }

    public function delete(Payment $payment): void
    {
        $this->paymentRepository->delete($payment);
        $this->systemEventService->paymentDeleted($payment);
    }

    public function restore(Payment $payment): Payment
    {
        $this->paymentRepository->restore($payment);
        $restored = $this->find($payment->id);
        $this->systemEventService->paymentRestored($restored);

        return $restored;
    }

    private function generatePaymentNumber(): string
    {
        $latest = Payment::withTrashed()
            ->where('payment_number', 'like', 'PAY-%')
            ->orderByDesc('payment_number')
            ->value('payment_number');

        if (! $latest) {
            return 'PAY-0001';
        }

        $number = (int) substr($latest, 4);

        return 'PAY-'.str_pad((string) ($number + 1), 4, '0', STR_PAD_LEFT);
    }
}
