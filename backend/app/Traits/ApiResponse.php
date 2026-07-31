<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

trait ApiResponse
{
    protected function successResponse(
        mixed $data = null,
        string $message = 'Success',
        int $statusCode = Response::HTTP_OK,
        ?array $meta = null,
    ): JsonResponse {
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];

        if ($meta !== null) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $statusCode);
    }

    protected function errorResponse(
        string $message = 'Error',
        int $statusCode = Response::HTTP_BAD_REQUEST,
        mixed $errors = null,
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $message,
            'data' => null,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }

    protected function createdResponse(
        mixed $data = null,
        string $message = 'Resource created successfully',
    ): JsonResponse {
        return $this->successResponse($data, $message, Response::HTTP_CREATED);
    }

    protected function noContentResponse(): JsonResponse
    {
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
