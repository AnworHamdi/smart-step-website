<?php

namespace Database\Seeders;

use App\Models\ContactMessage;
use Illuminate\Database\Seeder;

class ContactMessageSeeder extends Seeder
{
    public function run(): void
    {
        $messages = [
            [
                'name' => 'John Smith',
                'email' => 'john.smith@example.com',
                'subject' => 'Inquiry about your services',
                'message' => 'Hello, I am interested in learning more about your services. Could you please send me some information?',
                'status' => 'new',
            ],
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah.j@example.com',
                'subject' => 'Partnership opportunity',
                'message' => 'We are looking for potential partners for our upcoming project. Would your company be interested in discussing collaboration opportunities?',
                'status' => 'read',
            ],
            [
                'name' => 'Ahmed Hassan',
                'email' => 'ahmed.h@example.com',
                'subject' => 'Question about pricing',
                'message' => 'I would like to know the pricing details for your premium package. Can you provide a quote?',
                'status' => 'replied',
                'reply_message' => 'Thank you for your interest! Our premium package starts at $99/month. Please visit our pricing page for more details.',
                'replied_at' => now()->subDays(2),
            ],
            [
                'name' => 'Maria Garcia',
                'email' => 'maria.g@example.com',
                'subject' => 'Feedback on your website',
                'message' => 'I love your new website design! Very clean and professional.',
                'status' => 'archived',
            ],
        ];

        foreach ($messages as $message) {
            ContactMessage::create($message);
        }
    }
}
