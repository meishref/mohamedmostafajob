<?php

namespace App\Http\Resources\Settings;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LookupOptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name ?? $this->from_currency.'/'.$this->to_currency,
            'code' => $this->code ?? null,
            'label' => $this->name
                ?? ($this->from_currency.' → '.$this->to_currency),
        ];
    }
}
