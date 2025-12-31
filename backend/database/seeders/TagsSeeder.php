<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class TagsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        DB::table('item_tag')->truncate();
        DB::table('tags')->truncate();
        Schema::enableForeignKeyConstraints();

        DB::table('tags')->insert([
            'id' => 1,
            'name' => 'AI & ML',
            'color' => '#6366f1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('tags')->insert([
            'id' => 2,
            'name' => 'Cloud',
            'color' => '#0ea5e9',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('tags')->insert([
            'id' => 3,
            'name' => 'Automation',
            'color' => '#10b981',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('tags')->insert([
            'id' => 4,
            'name' => 'Business',
            'color' => '#f59e0b',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('tags')->insert([
            'id' => 5,
            'name' => 'Security',
            'color' => '#ef4444',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
