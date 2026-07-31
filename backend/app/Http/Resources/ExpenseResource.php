<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ExpenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'expense_number' => $this->expense_number,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'code' => $this->category->code,
            ]),
            'platform_id' => $this->platform_id,
            'platform' => $this->whenLoaded('platform', fn () => [
                'id' => $this->platform->id,
                'name' => $this->platform->name,
                'code' => $this->platform->code,
            ]),
            'amount' => $this->amount,
            'currency' => $this->currency,
            'expense_date' => $this->expense_date?->format('Y-m-d'),
            'notes' => $this->description,
            'attachment_path' => $this->receipt_path,
            'attachment_url' => $this->receipt_path
                ? Storage::disk('public')->url($this->receipt_path)
                : null,
            'attachment_name' => $this->receipt_path ? basename($this->receipt_path) : null,
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
