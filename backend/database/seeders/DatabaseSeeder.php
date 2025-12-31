<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call(PermissionsSeeder::class);
        $this->call(UsersSeeder::class);
        $this->call(CategoriesSeeder::class);
        $this->call(TagsSeeder::class);
        $this->call(ItemsSeeder::class);

        // Custom modules
        $this->call(ContactMessageSeeder::class);
        $this->call(EmailSubscriptionSeeder::class);
        $this->call(SiteSettingSeeder::class);

        $this->command->call('passport:install', ['--force' => true]);
    }
}

