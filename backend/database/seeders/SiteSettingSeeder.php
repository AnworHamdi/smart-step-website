<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // General settings
            [
                'key' => 'site_name',
                'value' => ['en' => 'Smart Step', 'ar' => 'الخطوة الذكية'],
                'group' => 'general',
            ],
            [
                'key' => 'site_description',
                'value' => [
                    'en' => 'Your trusted partner for innovative solutions',
                    'ar' => 'شريكك الموثوق للحلول المبتكرة'
                ],
                'group' => 'general',
            ],
            [
                'key' => 'site_logo',
                'value' => '/assets/logo.png',
                'group' => 'general',
            ],
            // Contact settings
            [
                'key' => 'contact_email',
                'value' => 'info@smartstep.ly',
                'group' => 'contact',
            ],
            [
                'key' => 'contact_phone',
                'value' => '+218 91 000 0000',
                'group' => 'contact',
            ],
            [
                'key' => 'contact_address',
                'value' => [
                    'en' => 'Tripoli, Libya',
                    'ar' => 'طرابلس، ليبيا'
                ],
                'group' => 'contact',
            ],
            // Social media
            [
                'key' => 'social_facebook',
                'value' => 'https://facebook.com/smartstep',
                'group' => 'social',
            ],
            [
                'key' => 'social_twitter',
                'value' => 'https://twitter.com/smartstep',
                'group' => 'social',
            ],
            [
                'key' => 'social_linkedin',
                'value' => 'https://linkedin.com/company/smartstep',
                'group' => 'social',
            ],
            // Translation settings
            [
                'key' => 'auto_translate_enabled',
                'value' => true,
                'group' => 'translation',
            ],
            [
                'key' => 'gemini_api_key',
                'value' => '', // Encrypted, set by Super admin
                'group' => 'translation',
            ],
        ];

        foreach ($settings as $setting) {
            SiteSetting::create($setting);
        }
    }
}
