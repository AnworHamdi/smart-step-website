<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Passport\Passport;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    /**
     * Authenticate as a user with specified role
     *
     * @param  string  $role
     * @return User
     */
    protected function actingAsRole(string $role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);
        Passport::actingAs($user);
        
        return $user;
    }

    /**
     * Authenticate as an admin user
     *
     * @return User
     */
    protected function actingAsAdmin(): User
    {
        return $this->actingAsRole('admin');
    }

    /**
     * Authenticate as a creator user
     *
     * @return User
     */
    protected function actingAsCreator(): User
    {
        return $this->actingAsRole('creator');
    }

    /**
     * Authenticate as a member user
     *
     * @return User
     */
    protected function actingAsMember(): User
    {
        return $this->actingAsRole('member');
    }

    /**
     * Get JSON:API headers
     *
     * @return array
     */
    protected function jsonApiHeaders(): array
    {
        return [
            'Accept' => 'application/vnd.api+json',
            'Content-Type' => 'application/vnd.api+json',
        ];
    }

    /**
     * Assert JSON:API error response
     *
     * @param  \Illuminate\Testing\TestResponse  $response
     * @param  int  $status
     * @return void
     */
    protected function assertJsonApiError($response, int $status): void
    {
        $response->assertStatus($status);
        $response->assertJsonStructure([
            'errors' => [
                '*' => ['status', 'title'],
            ],
        ]);
    }

    /**
     * Assert JSON:API resource response
     *
     * @param  \Illuminate\Testing\TestResponse  $response
     * @param  string  $type
     * @return void
     */
    protected function assertJsonApiResource($response, string $type): void
    {
        $response->assertJsonStructure([
            'data' => [
                'type',
                'id',
                'attributes',
            ],
        ]);
        $response->assertJson([
            'data' => [
                'type' => $type,
            ],
        ]);
    }

    /**
     * Assert JSON:API collection response
     *
     * @param  \Illuminate\Testing\TestResponse  $response
     * @param  string  $type
     * @return void
     */
    protected function assertJsonApiCollection($response, string $type): void
    {
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'type',
                    'id',
                    'attributes',
                ],
            ],
        ]);
        
        if ($response->json('data')) {
            $response->assertJson([
                'data' => [
                    ['type' => $type],
                ],
            ]);
        }
    }
}
