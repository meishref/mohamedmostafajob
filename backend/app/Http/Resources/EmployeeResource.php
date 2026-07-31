<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class EmployeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_number' => $this->employee_number,
            'full_name' => $this->full_name,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'profile_image' => $this->profile_image,
            'profile_image_url' => $this->profile_image
                ? Storage::disk('public')->url($this->profile_image)
                : null,
            'department_id' => $this->department_id,
            'department' => $this->whenLoaded('department', fn () => [
                'id' => $this->department->id,
                'name' => $this->department->name,
                'code' => $this->department->code,
            ]),
            'job_title_id' => $this->job_title_id,
            'job_title' => $this->whenLoaded('jobTitle', fn () => [
                'id' => $this->jobTitle->id,
                'name' => $this->jobTitle->name,
                'code' => $this->jobTitle->code,
            ]),
            'employee_status_id' => $this->employee_status_id,
            'employee_status' => $this->whenLoaded('employeeStatus', fn () => [
                'id' => $this->employeeStatus->id,
                'name' => $this->employeeStatus->name,
                'code' => $this->employeeStatus->code,
                'color' => $this->employeeStatus->color,
            ]),
            'hire_date' => $this->hire_date?->format('Y-m-d'),
            'notes' => $this->notes,
            'attachments' => $this->whenLoaded('attachments', fn () =>
                AttachmentResource::collection($this->attachments)->resolve()
            ),
            'deleted_at' => $this->deleted_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
