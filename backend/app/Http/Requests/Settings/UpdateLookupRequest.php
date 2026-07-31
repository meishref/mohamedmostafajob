<?php

namespace App\Http\Requests\Settings;

use App\Support\Settings\SettingsRegistry;
use Illuminate\Foundation\Http\FormRequest;

class UpdateLookupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('settings.manage') ?? false;
    }

    public function rules(): array
    {
        $resource = $this->route('resource');
        $rulesFn = SettingsRegistry::get($resource)['store_rules'];

        return $rulesFn($this->route('id'));
    }
}
