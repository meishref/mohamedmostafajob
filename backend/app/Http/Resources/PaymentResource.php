<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payment_number' => $this->payment_number,
            'employee_id' => $this->employee_id,
            'employee' => $this->whenLoaded('employee', fn () => [
                'id' => $this->employee->id,
                'full_name' => $this->employee->full_name,
                'employee_number' => $this->employee->employee_number,
            ]),
            'payment_type_id' => $this->payment_type_id,
            'payment_type' => $this->whenLoaded('paymentType', fn () => [
                'id' => $this->paymentType->id,
                'name' => $this->paymentType->name,
                'code' => $this->paymentType->code,
            ]),
            'payment_status_id' => $this->payment_status_id,
            'payment_status' => $this->whenLoaded('paymentStatus', fn () => [
                'id' => $this->paymentStatus->id,
                'name' => $this->paymentStatus->name,
                'code' => $this->paymentStatus->code,
                'color' => $this->paymentStatus->color,
            ]),
            'amount' => $this->amount,
            'currency' => $this->currency,
            'payment_date' => $this->payment_date?->format('Y-m-d'),
            'reference' => $this->reference,
            'notes' => $this->notes,
            'attachments' => $this->whenLoaded('attachments', fn () =>
                AttachmentResource::collection($this->attachments)->resolve()
            ),
            'created_by' => $this->created_by,
            'creator' => $this->whenLoaded('creator', fn () => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
                'email' => $this->creator->email,
            ]),
            'deleted_at' => $this->deleted_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
