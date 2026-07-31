<?php

namespace App\Support;

use App\Exceptions\ApiException;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\Response;

class SecureUploadValidator
{
    /** @var array<string, array<int, string>> */
    private const MIME_MAP = [
        'jpg' => ['image/jpeg'],
        'jpeg' => ['image/jpeg'],
        'png' => ['image/png'],
        'gif' => ['image/gif'],
        'webp' => ['image/webp'],
        'pdf' => ['application/pdf'],
        'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        'xls' => ['application/vnd.ms-excel'],
        'csv' => ['text/csv', 'text/plain', 'application/csv'],
        'doc' => ['application/msword'],
        'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ];

    public static function validate(UploadedFile $file, array $allowedExtensions, int $maxSizeKb): void
    {
        $maxBytes = $maxSizeKb * 1024;

        if ($file->getSize() > $maxBytes) {
            throw new ApiException(
                message: 'File upload failed.',
                statusCode: Response::HTTP_UNPROCESSABLE_ENTITY,
                errors: ['file' => ['File size must not exceed '.($maxSizeKb / 1024).'MB.']],
            );
        }

        $extension = strtolower($file->getClientOriginalExtension());

        if (! in_array($extension, $allowedExtensions, true)) {
            throw new ApiException(
                message: 'File upload failed.',
                statusCode: Response::HTTP_UNPROCESSABLE_ENTITY,
                errors: ['file' => ['File type not allowed.']],
            );
        }

        $detectedMime = $file->getMimeType();
        $allowedMimes = self::MIME_MAP[$extension] ?? [];

        if ($detectedMime && $allowedMimes !== [] && ! in_array($detectedMime, $allowedMimes, true)) {
            throw new ApiException(
                message: 'File upload failed.',
                statusCode: Response::HTTP_UNPROCESSABLE_ENTITY,
                errors: ['file' => ['File content does not match the declared type.']],
            );
        }
    }

    public static function validateImage(UploadedFile $file, int $maxSizeKb = 2048): void
    {
        self::validate($file, FileUploadConfig::imageMimes(), $maxSizeKb);
    }

    public static function validateAttachment(UploadedFile $file): void
    {
        self::validate($file, FileUploadConfig::allowedMimes(), FileUploadConfig::MAX_SIZE_KB);
    }

    public static function sanitizeFilename(string $filename): string
    {
        $filename = basename($filename);
        $filename = preg_replace('/[^a-zA-Z0-9._-]/', '_', $filename) ?? 'download';

        return $filename !== '' ? $filename : 'download';
    }
}
