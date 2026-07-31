<?php

namespace App\Http\Requests\Attachment;

use App\Support\FileUploadConfig;
use Illuminate\Foundation\Http\FormRequest;

class StoreAttachmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user();
    }

    public function rules(): array
    {
        return [
            'file' => FileUploadConfig::validationRules(required: true),
        ];
    }
}
