<?php

namespace App\Services\FileUpload;

use App\Exceptions\ApiException;
use App\Models\Attachment;
use App\Support\SecureUploadValidator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttachmentService
{
    public function list(Model $attachable): \Illuminate\Database\Eloquent\Collection
    {
        return $attachable->attachments()->with('uploader')->get();
    }

    public function upload(Model $attachable, UploadedFile $file, string $directory): Attachment
    {
        $this->validateFile($file);

        $path = $file->store($directory, 'public');

        return $attachable->attachments()->create([
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
            'file_size' => $file->getSize(),
            'uploaded_by' => Auth::id(),
        ]);
    }

    public function download(Attachment $attachment): StreamedResponse
    {
        if (! Storage::disk('public')->exists($attachment->file_path)) {
            throw new ApiException('File not found.', Response::HTTP_NOT_FOUND);
        }

        return Storage::disk('public')->download(
            $attachment->file_path,
            SecureUploadValidator::sanitizeFilename($attachment->original_name),
        );
    }

    public function delete(Attachment $attachment): void
    {
        if (Storage::disk('public')->exists($attachment->file_path)) {
            Storage::disk('public')->delete($attachment->file_path);
        }

        $attachment->delete();
    }

    private function validateFile(UploadedFile $file): void
    {
        SecureUploadValidator::validateAttachment($file);
    }
}
