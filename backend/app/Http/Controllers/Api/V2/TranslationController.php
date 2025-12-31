<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TranslationController extends Controller
{
    /**
     * Translate text using Gemini API.
     */
    public function translate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'text' => 'required|string',
            'context' => 'required|string',
        ]);

        $apiKey = SiteSetting::getValue('gemini_api_key');

        if (!$apiKey) {
            // Fallback to env if not in database
            $apiKey = config('services.gemini.key') ?? env('GEMINI_API_KEY');
        }

        if (!$apiKey) {
            return response()->json([
                'error' => 'Gemini API key not configured.',
            ], 500);
        }

        try {
            $text = $validated['text'];
            $context = $validated['context'];
            
            $isArabic = preg_match('/[\x{0600}-\x{06FF}]/u', $text);
            $sourceLang = $isArabic ? 'Arabic' : 'English';
            $targetLang = $isArabic ? 'English' : 'Arabic';

            $prompt = "Translate the following text from {$sourceLang} to {$targetLang}.\n" .
                      "The context is: \"{$context}\".\n" .
                      "The translation should be professional and accurate.\n" .
                      "Provide only the translated text, without any additional comments, formatting, or quotation marks.\n\n" .
                      "Text: \"{$text}\"";

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativeai.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ]);

            if ($response->failed()) {
                Log::error('Gemini API Error:', $response->json() ?? ['message' => $response->body()]);
                return response()->json([
                    'error' => 'Failed to translate using Gemini API.',
                    'details' => $response->json()
                ], $response->status());
            }

            $result = $response->json();
            $translatedText = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';

            return response()->json([
                'translated_text' => trim($translatedText),
            ]);

        } catch (\Exception $e) {
            Log::error('Translation Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'An error occurred during translation.',
            ], 500);
        }
    }
}
