<?php

namespace App\Http\Resources;

use App\Support\Roles;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'profile_image' => $this->profile_image,
            'profile_image_url' => $this->profile_image_url,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'roles' => $this->whenLoaded('roles', fn () => Roles::forDisplay($this->roles->pluck('name'))),
            'permissions' => $this->whenLoaded('permissions', fn () => $this->getAllPermissions()->pluck('name')),
            'deleted_at' => $this->deleted_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
