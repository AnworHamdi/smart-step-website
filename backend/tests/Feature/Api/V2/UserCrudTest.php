<?php

namespace Tests\Feature\Api\V2;

use App\Exceptions\UserDeletionException;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->artisan('migrate:fresh');
        $this->seed(\Database\Seeders\PermissionsSeeder::class);
    }

    /** @test */
    public function admin_can_list_users()
    {
        $this->actingAsAdmin();
        User::factory()->count(3)->create();

        $response = $this->getJson('/api/v2/users', $this->jsonApiHeaders());

        $response->assertStatus(200);
        $this->assertJsonApiCollection($response, 'users');
    }

    /** @test */
    public function creator_cannot_list_users()
    {
        $this->actingAsCreator();

        $response = $this->getJson('/api/v2/users', $this->jsonApiHeaders());

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_create_user()
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/api/v2/users', [
            'data' => [
                'type' => 'users',
                'attributes' => [
                    'name' => 'New User',
                    'email' => 'newuser@example.com',
                    'password' => 'password123',
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
        ]);
    }

    /** @test */
    public function admin_can_update_user()
    {
        $this->actingAsAdmin();
        $user = User::factory()->create();

        $response = $this->patchJson("/api/v2/users/{$user->id}", [
            'data' => [
                'type' => 'users',
                'id' => (string) $user->id,
                'attributes' => [
                    'name' => 'Updated Name',
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
        ]);
    }

    /** @test */
    public function admin_can_delete_user()
    {
        $this->actingAsAdmin();
        $user = User::factory()->create();

        $response = $this->deleteJson("/api/v2/users/{$user->id}", [], $this->jsonApiHeaders());

        $response->assertStatus(204);
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    /** @test */
    public function user_cannot_delete_themselves()
    {
        $user = $this->actingAsAdmin();

        $this->expectException(UserDeletionException::class);
        
        $user->delete();
    }

    /** @test */
    public function non_admin_cannot_create_user()
    {
        $this->actingAsCreator();

        $response = $this->postJson('/api/v2/users', [
            'data' => [
                'type' => 'users',
                'attributes' => [
                    'name' => 'New User',
                    'email' => 'new@example.com',
                    'password' => 'password123',
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(403);
    }

    /** @test */
    public function users_can_be_filtered_by_email()
    {
        $this->actingAsAdmin();
        User::factory()->create(['email' => 'john@example.com']);
        User::factory()->create(['email' => 'jane@example.com']);

        $response = $this->getJson('/api/v2/users?filter[email]=john', $this->jsonApiHeaders());

        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, count($response->json('data')));
    }

    /** @test */
    public function user_email_must_be_unique()
    {
        $this->actingAsAdmin();
        User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->postJson('/api/v2/users', [
            'data' => [
                'type' => 'users',
                'attributes' => [
                    'name' => 'Test User',
                    'email' => 'existing@example.com',
                    'password' => 'password123',
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(422);
    }
}
