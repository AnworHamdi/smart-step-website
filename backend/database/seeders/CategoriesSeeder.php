<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        DB::table('categories')->truncate();
        Schema::enableForeignKeyConstraints();

        DB::table('categories')->insert([
            'id' => 1,
            'name' => 'Infrastructure',
            'description' => 'Network and hardware infrastructure solutions',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('categories')->insert([
            'id' => 2,
            'name' => 'Software Development',
            'description' => 'Custom software and mobile application development',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('categories')->insert([
            'id' => 3,
            'name' => 'Cybersecurity',
            'description' => 'Protecting your business from digital threats',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('categories')->insert([
            'id' => 4,
            'name' => 'IT Consulting',
            'description' => 'Strategic technology advice for business growth',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('categories')->insert([
            'id' => 5,
            'name' => 'Cloud Solutions',
            'description' => 'Modern cloud computing and migration services',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
