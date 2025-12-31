<?php

namespace Tests\Feature\Api\V2;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->artisan('migrate:fresh');
        $this->seed(\Database\Seeders\PermissionsSeeder::class);
    }

    /** @test */
    public function user_can_login_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/v2/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'token_type',
            'expires_in',
            'access_token',
            'refresh_token',
        ]);
    }

    /** @test */
    public function user_cannot_login_with_invalid_credentials()
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/v2/login', [
            'email' => 'test@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(400);
    }

    /**  @test */
    public function user_cannot_login_with_nonexistent_email()
    {
        $response = $this->postJson('/api/v2/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(400);
    }

    /** @test */
    public function user_can_register_with_valid_data()
    {
        $response = $this->postJson('/api/v2/register', [
            'name' => 'Test User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
        ]);
    }

    /** @test */
    public function user_cannot_register_with_existing_email()
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->postJson('/api/v2/register', [
            'name' => 'Test User',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function user_cannot_register_without_password_confirmation()
    {
        $response = $this->postJson('/api/v2/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function authenticated_user_can_logout()
    {
        $user = $this->actingAsAdmin();

        $response = $this->postJson('/api/v2/logout');

        $response->assertStatus(204);
    }

    /** @test */
    public function unauthenticated_user_cannot_logout()
    {
        $response = $this->postJson('/api/v2/logout');

        $response->assertStatus(401);
    }

    /** @test */
    public function user_can_request_password_reset()
    {
        Notification::fake();

        $user = User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/v2/password-forgot', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200);
    }

    /** @test */
    public function authenticated_user_can_view_profile()
    {
        $user = $this->actingAsAdmin();

        $response = $this->getJson('/api/v2/me', $this->jsonApiHeaders());

        $response->assertStatus(200);
        $response->assertJson([
            'data' => [
                'type' => 'users',
                'id' => (string) $user->id,
                'attributes' => [
                    'email' => $user->email,
                    'name' => $user->name,
                ],
            ],
        ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_view_profile()
    {
        $response = $this->getJson('/api/v2/me', $this->jsonApiHeaders());

        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_user_can_update_profile()
    {
        $user = $this->actingAsAdmin();

        $response = $this->patchJson('/api/v2/me', [
            'data' => [
                'type' => 'users',
                'id' => (string) $user->id,
                'attributes' => [
                    'name' => 'Updated Name',
                    'email' => $user->email,
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
        ]);
    }
}
