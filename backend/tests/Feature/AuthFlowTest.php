<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Passport\ClientRepository;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_login_and_fetch_profile_via_json_api(): void
    {
        config(['app.url' => 'http://localhost']);

        $client = app(ClientRepository::class)
            ->createPasswordGrantClient(null, 'Test Password Client', 'http://localhost');

        $user = User::factory()->create(['password' => 'password']);

        $loginPayload = [
            'data' => [
                'attributes' => [
                    'email' => $user->email,
                    'password' => 'password',
                ],
            ],
        ];

        $loginResponse = $this->postJson(
            '/api/v2/login',
            $loginPayload,
            ['Accept' => 'application/vnd.api+json']
        );

        $loginResponse->assertOk()->assertJsonStructure([
            'token_type',
            'expires_in',
            'access_token',
            'refresh_token',
        ]);

        $token = $loginResponse->json('access_token');

        $userResponse = $this->getJson(
            "/api/v2/users/{$user->id}",
            [
                'Accept' => 'application/vnd.api+json',
                'Authorization' => 'Bearer '.$token,
            ]
        );

        $userResponse
            ->assertOk()
            ->assertJsonPath('data.id', (string) $user->id)
            ->assertJsonPath('data.type', 'users');

        $meResponse = $this->getJson(
            '/api/v2/me',
            [
                'Accept' => 'application/vnd.api+json',
                'Authorization' => 'Bearer '.$token,
            ]
        );

        $meResponse
            ->assertOk()
            ->assertJsonPath('data.id', (string) $user->id)
            ->assertJsonPath('data.type', 'users')
            ->assertJsonPath('data.attributes.email', $user->email)
            ->assertJsonStructure([
                'data' => [
                    'attributes' => [
                        'roles',
                        'permissions',
                        'token_expires_at',
                        'token_scopes',
                    ],
                ],
            ]);
    }
}
