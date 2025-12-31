<?php

namespace Database\Seeders;

use App\Models\EmailSubscription;
use Illuminate\Database\Seeder;

class EmailSubscriptionSeeder extends Seeder
{
    public function run(): void
    {
        $subscriptions = [
            [
                'email' => 'subscriber1@example.com',
                'name' => 'Alice Brown',
                'source' => 'homepage',
                'status' => 'active',
                'subscribed_at' => now()->subMonths(3),
            ],
            [
                'email' => 'subscriber2@example.com',
                'name' => 'Bob Wilson',
                'source' => 'blog',
                'status' => 'active',
                'subscribed_at' => now()->subMonths(2),
            ],
            [
                'email' => 'subscriber3@example.com',
                'name' => 'Carol Davis',
                'source' => 'footer',
                'status' => 'active',
                'subscribed_at' => now()->subWeeks(3),
            ],
            [
                'email' => 'former@example.com',
                'name' => 'Dan Miller',
                'source' => 'homepage',
                'status' => 'unsubscribed',
                'subscribed_at' => now()->subMonths(6),
                'unsubscribed_at' => now()->subWeeks(1),
            ],
        ];

        foreach ($subscriptions as $subscription) {
            EmailSubscription::create($subscription);
        }
    }
}
