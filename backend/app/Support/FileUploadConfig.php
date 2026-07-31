<?php

namespace App\Support;

class FileUploadConfig
{
    public const MAX_SIZE_KB = 10240;

    /** @return array<int, string> */
    public static function allowedMimes(): array
    {
        return [
            'jpg', 'jpeg', 'png', 'gif', 'webp',
            'pdf',
            'xlsx', 'xls', 'csv',
            'doc', 'docx',
        ];
    }

    /** @return array<int, string> */
    public static function imageMimes(): array
    {
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    }

    public static function validationRules(bool $required = false): array
    {
        $prefix = $required ? 'required' : 'nullable';

        return [
            $prefix,
            'file',
            'mimes:'.implode(',', self::allowedMimes()),
            'max:'.self::MAX_SIZE_KB,
        ];
    }
}
