<?php

namespace Tests\Feature\Api\V2;

use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TagCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->artisan('migrate:fresh');
        $this->seed(\Database\Seeders\PermissionsSeeder::class);
    }

    /** @test */
    public function creator_can_list_tags()
    {
        $this->actingAsCreator();
        Tag::factory()->count(5)->create();

        $response = $this->getJson('/api/v2/tags', $this->jsonApiHeaders());

        $response->assertStatus(200);
        $this->assertJsonApiCollection($response, 'tags');
        $this->assertGreaterThanOrEqual(5, count($response->json('data')));
    }

    /** @test */
    public function member_can_view_tags()
    {
        $this->actingAsMember();
        Tag::factory()->count(3)->create();

        $response = $this->getJson('/api/v2/tags', $this->jsonApiHeaders());

        $response->assertStatus(200);
    }

    /** @test */
    public function creator_can_create_tag()
    {
        $this->actingAsCreator();

        $response = $this->postJson('/api/v2/tags', [
            'data' => [
                'type' => 'tags',
                'attributes' => [
                    'name' => 'Laravel',
                    'color' => '#FF2D20',
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(201);
        $this->assertDatabaseHas('tags', [
            'name' => 'Laravel',
        ]);
    }

    /** @test */
    public function member_cannot_create_tag()
    {
        $this->actingAsMember();

        $response = $this->postJson('/api/v2/tags', [
            'data' => [
                'type' => 'tags',
                'attributes' => [
                    'name' => 'PHP',
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(403);
    }

    /** @test */
    public function creator_can_update_tag()
    {
        $this->actingAsCreator();
        $tag = Tag::factory()->create();

        $response = $this->patchJson("/api/v2/tags/{$tag->id}", [
            'data' => [
                'type' => 'tags',
                'id' => (string) $tag->id,
                'attributes' => [
                    'name' => 'Updated Tag',
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(200);
        $this->assertDatabaseHas('tags', [
            'id' => $tag->id,
            'name' => 'Updated Tag',
        ]);
    }

    /** @test */
    public function creator_can_delete_tag()
    {
        $this->actingAsCreator();
        $tag = Tag::factory()->create();

        $response = $this->deleteJson("/api/v2/tags/{$tag->id}", [], $this->jsonApiHeaders());

        $response->assertStatus(204);
        $this->assertDatabaseMissing('tags', ['id' => $tag->id]);
    }

    /** @test */
    public function member_cannot_update_tag()
    {
        $this->actingAsMember();
        $tag = Tag::factory()->create();

        $response = $this->patchJson("/api/v2/tags/{$tag->id}", [
            'data' => [
                'type' => 'tags',
                'id' => (string) $tag->id,
                'attributes' => [
                    'name' => 'Hacked Tag',
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(403);
    }

    /** @test */
    public function tag_name_is_required()
    {
        $this->actingAsCreator();

        $response = $this->postJson('/api/v2/tags', [
            'data' => [
                'type' => 'tags',
                'attributes' => [
                    'color' => '#000000',
                ],
            ],
        ], $this->jsonApiHeaders());

        $response->assertStatus(422);
    }

    /** @test */
    public function tags_can_be_filtered_by_name()
    {
        $this->actingAsCreator();
        Tag::factory()->create(['name' => 'Laravel']);
        Tag::factory()->create(['name' => 'PHP']);
        Tag::factory()->create(['name' => 'Vue']);

        $response = $this->getJson('/api/v2/tags?filter[name]=Laravel', $this->jsonApiHeaders());

        $response->assertStatus(200);
    }
}
