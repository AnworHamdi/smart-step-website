<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        DB::table('users')->truncate();
        Schema::enableForeignKeyConstraints();

        // Primary admin user for Smart Step
        User::create([
            'name' => 'Smart Step Super Admin',
            'email' => env('ADMIN_EMAIL', 'arbh.ly@gmail.com'),
            'password' => env('ADMIN_PASSWORD', 'Admin123!'),
            'profile_image' => env('APP_URL').'/images/admin.jpg',
        ])->assignRole('Super admin');

        // Default CMS users
        User::create([
            'name' => 'Admin',
            'email' => 'admin@smartstep.ly',
            'password' => 'secret',
            'profile_image' => env('APP_URL').'/images/admin.jpg',
        ])->assignRole('admin');

        User::create([
            'name' => 'Creator',
            'email' => 'creator@smartstep.ly',
            'password' => 'secret',
            'profile_image' => env('APP_URL').'/images/creator.jpg',
        ])->assignRole('creator');

        User::create([
            'name' => 'Member',
            'email' => 'member@smartstep.ly',
            'password' => 'secret',
            'profile_image' => env('APP_URL').'/images/member.jpg',
        ])->assignRole('member');
    }
}

