<?php

namespace Tests\Feature\Api\V2;

use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->artisan('migrate:fresh');
        $this->seed(\Database\Seeders\PermissionsSeeder::class);
    }

    /** @test */
    public function creator_can_list_categories()
    {
        $this->actingAsCreator();
        Category::factory()->count(3)->create();

        $response = $this->getJson('/api/v2/categories', $this->jsonApiHeaders());

        $response->assertStatus(200);
        $this->assertJsonApiCollection($response, 'categories');
    }

    /** @test */
    public function member_can_view_categories()
    {
        $this->actingAsMember();
        Category::factory()->count(2)->create();

        $response = $this->getJson('/api/v2/categories', $this->jsonApiHeaders());

        $response->assertStatus(200);
    }

    /** @test */
    public function creator_can_create_category()
    {
        $this->actingAsCreator();

        $response = $this->postJson('/api/v2/categories', [
            'data' => [
                'type' => 'categories',
                'attributes' => [
                    'name' => 'Technology',
                    'color' => '#FF5733',
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(201);
        $this->assertDatabaseHas('categories', [
            'name' => 'Technology',
        ]);
    }

    /** @test */
    public function member_cannot_create_category()
    {
        $this->actingAsMember();

        $response = $this->postJson('/api/v2/categories', [
            'data' => [
                'type' => 'categories',
                'attributes' => [
                    'name' => 'Technology',
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(403);
    }

    /** @test */
    public function creator_can_update_category()
    {
        $this->actingAsCreator();
        $category = Category::factory()->create();

        $response = $this->patchJson("/api/v2/categories/{$category->id}", [
            'data' => [
                'type' => 'categories',
                'id' => (string) $category->id,
                'attributes' => [
                    'name' => 'Updated Category',
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(200);
        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Updated Category',
        ]);
    }

    /** @test */
    public function creator_can_delete_category()
    {
        $this->actingAsCreator();
        $category = Category::factory()->create();

        $response = $this->deleteJson("/api/v2/categories/{$category->id}", [], $this->jsonApiHeaders());

        $response->assertStatus(204);
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    /** @test */
    public function member_cannot_delete_category()
    {
        $this->actingAsMember();
        $category = Category::factory()->create();

        $response = $this->deleteJson("/api/v2/categories/{$category->id}", [], $this->jsonApiHeaders());

        $response->assertStatus(403);
    }

    /** @test */
    public function category_name_is_required()
    {
        $this->actingAsCreator();

        $response = $this->postJson('/api/v2/categories', [
            'data' => [
                'type' => 'categories',
                'attributes' => [
                    'color' => '#FF5733',
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(422);
    }

    /** @test */
    public function categories_can_be_searched_by_name()
    {
        $this->actingAsCreator();
        Category::factory()->create(['name' => 'Technology']);
        Category::factory()->create(['name' => 'Science']);

        $response = $this->getJson('/api/v2/categories?filter[name]=Tech', $this->jsonApiHeaders());

        $response->assertStatus(200);
    }
}
