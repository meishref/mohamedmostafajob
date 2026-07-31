<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\ActivityLog */
class ActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'email' => $this->user?->email,
            ]),
            'action' => $this->action,
            'module' => $this->module,
            'description' => $this->description,
            'properties' => $this->properties,
            'subject_type' => $this->subject_type ? class_basename($this->subject_type) : null,
            'subject_id' => $this->subject_id,
            'ip_address' => $this->ip_address,
            'browser' => $this->browser,
            'operating_system' => $this->operating_system,
            'user_agent' => $this->user_agent,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
