<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

class ApiException extends Exception
{
    public function __construct(
        string $message = 'An error occurred',
        protected int $statusCode = Response::HTTP_BAD_REQUEST,
        protected mixed $errors = null,
        ?Exception $previous = null,
    ) {
        parent::__construct($message, $statusCode, $previous);
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getErrors(): mixed
    {
        return $this->errors;
    }
}
