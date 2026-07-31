<?php

namespace App\DTOs\Auth;

readonly class ResetPasswordDTO
{
    public function __construct(
        public string $email,
        public string $password,
        public string $passwordConfirmation,
        public string $token,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            email: $data['email'],
            password: $data['password'],
            passwordConfirmation: $data['password_confirmation'],
            token: $data['token'],
        );
    }
}
