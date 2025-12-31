<?php

namespace Tests\Unit\Policies;

use App\Models\Category;
use App\Models\Item;
use App\Models\Role;
use App\Models\Tag;
use App\Models\User;
use App\Policies\CategoryPolicy;
use App\Policies\ItemPolicy;
use App\Policies\RolePolicy;
use App\Policies\TagPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PolicyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->artisan('migrate:fresh');
        $this->seed(\Database\Seeders\PermissionsSeeder::class);
    }

    /** @test */
    public function member_can_view_items()
    {
        $member = $this->actingAsMember();
        $policy = new ItemPolicy();

        $this->assertTrue($policy->viewAny($member));
        $this->assertTrue($policy->view($member));
    }

    /** @test */
    public function member_cannot_create_items()
    {
        $member = $this->actingAsMember();
        $policy = new ItemPolicy();

        $this->assertFalse($policy->create($member));
    }

    /** @test */
    public function creator_can_create_items()
    {
        $creator = $this->actingAsCreator();
        $policy = new ItemPolicy();

        $this->assertTrue($policy->create($creator));
    }

    /** @test */
    public function item_owner_can_update_their_item()
    {
        $creator = $this->actingAsCreator();
        $item = Item::factory()->create(['user_id' => $creator->id]);
        $policy = new ItemPolicy();

        $this->assertTrue($policy->update($creator, $item));
    }

    /** @test */
    public function item_owner_cannot_update_others_item()
    {
        $creator = $this->actingAsCreator();
        $otherUser = User::factory()->create();
        $item = Item::factory()->create(['user_id' => $otherUser->id]);
        $policy = new ItemPolicy();

        $this->assertFalse($policy->update($creator, $item));
    }

    /** @test */
    public function admin_can_update_any_item()
    {
        $admin = $this->actingAsAdmin();
        $otherUser = User::factory()->create();
        $item = Item::factory()->create(['user_id' => $otherUser->id]);
        $policy = new ItemPolicy();

        $this->assertTrue($policy->update($admin, $item));
    }

    /** @test */
    public function item_owner_can_delete_their_item()
    {
        $creator = $this->actingAsCreator();
        $item = Item::factory()->create(['user_id' => $creator->id]);
        $policy = new ItemPolicy();

        $this->assertTrue($policy->delete($creator, $item));
    }

    /** @test */
    public function admin_can_delete_any_item()
    {
        $admin = $this->actingAsAdmin();
        $item = Item::factory()->create();
        $policy = new ItemPolicy();

        $this->assertTrue($policy->delete($admin, $item));
    }

    /** @test */
    public function admin_can_manage_users()
    {
        $admin = $this->actingAsAdmin();
        $policy = new UserPolicy();
        $user = User::factory()->create();

        $this->assertTrue($policy->viewAny($admin));
        $this->assertTrue($policy->view($admin));
        $this->assertTrue($policy->create($admin));
        $this->assertTrue($policy->update($admin, $user));
        $this->assertTrue($policy->delete($admin, $user));
    }

    /** @test */
    public function creator_cannot_manage_users()
    {
        $creator = $this->actingAsCreator();
        $policy = new UserPolicy();
        $user = User::factory()->create();

        $this->assertFalse($policy->viewAny($creator));
        $this->assertFalse($policy->create($creator));
        $this->assertFalse($policy->delete($creator, $user));
    }

    /** @test */
    public function creator_can_manage_categories()
    {
        $creator = $this->actingAsCreator();
        $policy = new CategoryPolicy();
        $category = Category::factory()->create();

        $this->assertTrue($policy->viewAny($creator));
        $this->assertTrue($policy->create($creator));
        $this->assertTrue($policy->update($creator, $category));
        $this->assertTrue($policy->delete($creator, $category));
    }

    /** @test */
    public function member_cannot_manage_categories()
    {
        $member = $this->actingAsMember();
        $policy = new CategoryPolicy();
        $category = Category::factory()->create();

        $this->assertFalse($policy->create($member));
        $this->assertFalse($policy->update($member, $category));
        $this->assertFalse($policy->delete($member, $category));
    }

    /** @test */
    public function creator_can_manage_tags()
    {
        $creator = $this->actingAsCreator();
        $policy = new TagPolicy();
        $tag = Tag::factory()->create();

        $this->assertTrue($policy->viewAny($creator));
        $this->assertTrue($policy->create($creator));
        $this->assertTrue($policy->update($creator, $tag));
        $this->assertTrue($policy->delete($creator, $tag));
    }

    /** @test */
    public function admin_can_manage_roles()
    {
        $admin = $this->actingAsAdmin();
        $policy = new RolePolicy();
        $role = Role::factory()->create();

        $this->assertTrue($policy->viewAny($admin));
        $this->assertTrue($policy->create($admin));
        $this->assertTrue($policy->update($admin, $role));
        $this->assertTrue($policy->delete($admin, $role));
    }

    /** @test */
    public function non_admin_cannot_manage_roles()
    {
        $creator = $this->actingAsCreator();
        $policy = new RolePolicy();
        $role = Role::factory()->create();

        $this->assertFalse($policy->viewAny($creator));
        $this->assertFalse($policy->create($creator));
        $this->assertFalse($policy->update($creator, $role));
        $this->assertFalse($policy->delete($creator, $role));
    }
}
