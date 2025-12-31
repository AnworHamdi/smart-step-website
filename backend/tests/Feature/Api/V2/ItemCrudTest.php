<?php

namespace Tests\Feature\Api\V2;

use App\Enums\ItemStatus;
use App\Models\Category;
use App\Models\Item;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ItemCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->artisan('migrate:fresh');
        $this->seed(\Database\Seeders\PermissionsSeeder::class);
    }

    /** @test */
    public function admin_can_list_all_items()
    {
        $this->actingAsAdmin();
        Item::factory()->count(5)->create();

        $response = $this->getJson('/api/v2/items', $this->jsonApiHeaders());

        $response->assertStatus(200);
        $this->assertJsonApiCollection($response, 'items');
        $this->assertCount(5, $response->json('data'));
    }

    /** @test */
    public function creator_can_list_items()
    {
        $this->actingAsCreator();
        Item::factory()->count(3)->create();

        $response = $this->getJson('/api/v2/items', $this->jsonApiHeaders());

        $response->assertStatus(200);
        $this->assertJsonApiCollection($response, 'items');
    }

    /** @test */
    public function member_can_view_items()
    {
        $this->actingAsMember();
        Item::factory()->count(2)->create();

        $response = $this->getJson('/api/v2/items', $this->jsonApiHeaders());

        $response->assertStatus(200);
    }

    /** @test */
    public function unauthenticated_user_cannot_list_items()
    {
        $response = $this->getJson('/api/v2/items', $this->jsonApiHeaders());

        $response->assertStatus(401);
    }

    /** @test */
    public function items_can_be_filtered_by_status()
    {
        $this->actingAsAdmin();
        Item::factory()->create(['status' => ItemStatus::Published]);
        Item::factory()->create(['status' => ItemStatus::Draft]);

        $response = $this->getJson('/api/v2/items?filter[status]=published', $this->jsonApiHeaders());

        $response->assertStatus(200);
        $this->assertEquals(1, count($response->json('data')));
    }

    /** @test */
    public function items_can_be_sorted_by_created_at()
    {
        $this->actingAsAdmin();
        Item::factory()->create(['created_at' => now()->subDays(2)]);
        Item::factory()->create(['created_at' => now()]);

        $response = $this->getJson('/api/v2/items?sort=-created_at', $this->jsonApiHeaders());

        $response->assertStatus(200);
    }

    /** @test */
    public function creator_can_create_item()
    {
        $user = $this->actingAsCreator();
        $category = Category::factory()->create();
        $tag = Tag::factory()->create();

        $response = $this->postJson('/api/v2/items', [
            'data' => [
                'type' => 'items',
                'attributes' => [
                    'name' => 'Test Item',
                    'status' => 'published',
                    'excerpt' => 'Test excerpt',
                    'description' => 'Test description',
                    'is_on_homepage' => true,
                    'date_at' => '2025-01-01',
                ],
                'relationships' => [
                    'category' => [
                        'data' => ['type' => 'categories', 'id' => (string) $category->id],
                    ],
                    'tags' => [
                        'data' => [
                            ['type' => 'tags', 'id' => (string) $tag->id],
                        ],
                    ],
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(201);
        $this->assertDatabaseHas('items', [
            'name' => 'Test Item',
            'status' => 'published',
            'user_id' => $user->id,
        ]);
    }

    /** @test */
    public function member_cannot_create_item()
    {
        $this->actingAsMember();
        $category = Category::factory()->create();

        $response = $this->postJson('/api/v2/items', [
            'data' => [
                'type' => 'items',
                'attributes' => [
                    'name' => 'Test Item',
                    'status' => 'published',
                    'excerpt' => 'Test',
                    'is_on_homepage' => false,
                    'date_at' => '2025-01-01',
                ],
                'relationships' => [
                    'category' => [
                        'data' => ['type' => 'categories', 'id' => (string) $category->id],
                    ],
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(403);
    }

    /** @test */
    public function item_owner_can_update_their_item()
    {
        $user = $this->actingAsCreator();
        $item = Item::factory()->create(['user_id' => $user->id]);

        $response = $this->patchJson("/api/v2/items/{$item->id}", [
            'data' => [
                'type' => 'items',
                'id' => (string) $item->id,
                'attributes' => [
                    'name' => 'Updated Name',
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(200);
        $this->assertDatabaseHas('items', [
            'id' => $item->id,
            'name' => 'Updated Name',
        ]);
    }

    /** @test */
    public function admin_can_update_any_item()
    {
        $this->actingAsAdmin();
        $otherUser = User::factory()->create();
        $item = Item::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->patchJson("/api/v2/items/{$item->id}", [
            'data' => [
                'type' => 'items',
                'id' => (string) $item->id,
                'attributes' => [
                    'name' => 'Admin Updated',
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(200);
        $this->assertDatabaseHas('items', [
            'id' => $item->id,
            'name' => 'Admin Updated',
        ]);
    }

    /** @test */
    public function creator_cannot_update_others_item()
    {
        $user = $this->actingAsCreator();
        $otherUser = User::factory()->create();
        $item = Item::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->patchJson("/api/v2/items/{$item->id}", [
            'data' => [
                'type' => 'items',
                'id' => (string) $item->id,
                'attributes' => [
                    'name' => 'Unauthorized Update',
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(403);
    }

    /** @test */
    public function item_owner_can_delete_their_item()
    {
        $user = $this->actingAsCreator();
        $item = Item::factory()->create(['user_id' => $user->id]);

        $response = $this->deleteJson("/api/v2/items/{$item->id}", [], $this->jsonApiHeaders());

        $response->assertStatus(204);
        $this->assertDatabaseMissing('items', ['id' => $item->id]);
    }

    /** @test */
    public function admin_can_delete_any_item()
    {
        $this->actingAsAdmin();
        $otherUser = User::factory()->create();
        $item = Item::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->deleteJson("/api/v2/items/{$item->id}", [], $this->jsonApiHeaders());

        $response->assertStatus(204);
        $this->assertDatabaseMissing('items', ['id' => $item->id]);
    }

    /** @test */
    public function member_cannot_delete_items()
    {
        $this->actingAsMember();
        $item = Item::factory()->create();

        $response = $this->deleteJson("/api/v2/items/{$item->id}", [], $this->jsonApiHeaders());

        $response->assertStatus(403);
    }

    /** @test */
    public function item_requires_name()
    {
        $this->actingAsCreator();
        $category = Category::factory()->create();

        $response = $this->postJson('/api/v2/items', [
            'data' => [
                'type' => 'items',
                'attributes' => [
                    'status' => 'published',
                    'excerpt' => 'Test',
                    'is_on_homepage' => false,
                    'date_at' => '2025-01-01',
                ],
                'relationships' => [
                    'category' => [
                        'data' => ['type' => 'categories', 'id' => (string) $category->id],
                    ],
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(422);
    }

    /** @test */
    public function item_status_must_be_valid()
    {
        $this->actingAsCreator();
        $category = Category::factory()->create();

        $response = $this->postJson('/api/v2/items', [
            'data' => [
                'type' => 'items',
                'attributes' => [
                    'name' => 'Test',
                    'status' => 'invalid-status',
                    'excerpt' => 'Test',
                    'is_on_homepage' => false,
                    'date_at' => '2025-01-01',
                ],
                'relationships' => [
                    'category' => [
                        'data' => ['type' => 'categories', 'id' => (string) $category->id],
                    ],
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(422);
    }
}
