<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthSessionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'sanctum.stateful' => ['localhost:3000', '127.0.0.1:3000'],
        ]);
    }

    public function test_login_without_stateful_headers_returns_server_error(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'missing@example.com',
            'password' => 'password',
        ]);

        // Direct API calls without Origin/Referer/X-Forwarded-Host are not stateful.
        $response->assertStatus(500);
    }

    public function test_login_with_origin_header_starts_session_instead_of_server_error(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => 'password',
        ]);

        $this->withHeaders([
            'Origin' => 'http://localhost:3000',
            'Referer' => 'http://localhost:3000/login',
        ])->get('/sanctum/csrf-cookie');

        $response = $this->withHeaders([
            'Origin' => 'http://localhost:3000',
            'Referer' => 'http://localhost:3000/login',
        ])->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'password',
        ]);

        $this->assertNotEquals(500, $response->status());
        $this->assertStringNotContainsString(
            'Session store not set on request',
            (string) $response->getContent(),
        );
    }

    public function test_proxied_login_without_origin_uses_forwarded_host_for_session(): void
    {
        User::factory()->create([
            'email' => 'proxy@example.com',
            'password' => 'password',
        ]);

        $this->withHeaders([
            'X-Forwarded-Host' => 'localhost:3000',
            'X-Forwarded-Proto' => 'http',
        ])->get('/sanctum/csrf-cookie');

        $response = $this->withHeaders([
            'X-Forwarded-Host' => 'localhost:3000',
            'X-Forwarded-Proto' => 'http',
        ])->postJson('/api/v1/auth/login', [
            'email' => 'proxy@example.com',
            'password' => 'password',
        ]);

        $this->assertNotEquals(500, $response->status());
        $this->assertStringNotContainsString(
            'Session store not set on request',
            (string) $response->getContent(),
        );
    }
}
