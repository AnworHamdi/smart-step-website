<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteSettingController extends Controller
{
    /**
     * Get all site settings.
     */
    public function index(Request $request): JsonResponse
    {
        $group = $request->get('group');

        if ($group) {
            $settings = SiteSetting::where('group', $group)->get();
        } else {
            $settings = SiteSetting::all();
        }

        $user = $request->user('api');
        $isSuperAdmin = $user && $user->email === 'arbh.ly@gmail.com';

        // Transform to key-value format
        $data = $settings->mapWithKeys(function ($setting) use ($isSuperAdmin) {
            // Hide sensitive API keys from non-super-admins
            $value = $setting->value;
            if ($setting->key === 'gemini_api_key' && !$isSuperAdmin) {
                $value = $value ? '********' : '';
            }
            
            return [$setting->key => [
                'value' => $value,
                'group' => $setting->group,
            ]];
        });

        return response()->json([
            'data' => $data,
        ]);
    }

    /**
     * Update multiple settings at once.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|max:255',
            'settings.*.value' => 'nullable',
            'settings.*.group' => 'nullable|string|max:100',
        ]);

        $user = $request->user('api');
        $isSuperAdmin = $user && $user->email === 'arbh.ly@gmail.com';
        $updated = [];

        foreach ($validated['settings'] as $setting) {
            // Only Super Admin can update API keys
            if (str_contains($setting['key'], 'api_key') && !$isSuperAdmin) {
                continue;
            }

            $record = SiteSetting::setValue(
                $setting['key'],
                $setting['value'],
                $setting['group'] ?? 'general'
            );
            $updated[$setting['key']] = $record->value;
        }

        return response()->json([
            'data' => $updated,
            'message' => 'Settings updated successfully.',
        ]);
    }

    /**
     * Get a single setting by key.
     */
    public function show(string $key): JsonResponse
    {
        $setting = SiteSetting::where('key', $key)->first();

        if (!$setting) {
            return response()->json([
                'error' => 'Setting not found.',
            ], 404);
        }

        return response()->json([
            'data' => [
                'key' => $setting->key,
                'value' => $setting->value,
                'group' => $setting->group,
            ],
        ]);
    }

    /**
     * Delete a setting.
     */
    public function destroy(string $key): JsonResponse
    {
        $setting = SiteSetting::where('key', $key)->first();

        if (!$setting) {
            return response()->json([
                'error' => 'Setting not found.',
            ], 404);
        }

        $setting->delete();

        return response()->json(null, 204);
    }
}
