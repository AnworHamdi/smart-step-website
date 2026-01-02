<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * List all media files
     */
    public function index(Request $request)
    {
        $type = $request->query('type', 'image');
        $disk = 'public';
        $directory = 'media';

        // Get all files from the media directory
        $files = Storage::disk($disk)->files($directory);
        
        $media = collect($files)->map(function ($path, $index) use ($disk, $type) {
            $mimeType = Storage::disk($disk)->mimeType($path);
            
            // Filter by type if specified
            if ($type === 'image' && !str_starts_with($mimeType, 'image/')) {
                return null;
            }

            return [
                'id' => $index + 1, // Using index as ID since files don't have DB entries
                'filename' => basename($path),
                'original_name' => basename($path),
                'path' => $path,
                'url' => Storage::disk($disk)->url($path),
                'mime_type' => $mimeType,
                'size' => Storage::disk($disk)->size($path),
                'alt_text' => null,
                'created_at' => date('Y-m-d H:i:s', Storage::disk($disk)->lastModified($path)),
            ];
        })->filter()->values();

        return response()->json(['data' => $media]);
    }

    /**
     * Upload a new media file
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,jpg,png,gif,webp,svg|max:10240',
            'alt_text' => 'nullable|string|max:255',
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        
        // Generate unique filename
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        
        // Store in public/media directory
        $path = $file->storeAs('media', $filename, 'public');
        $url = Storage::disk('public')->url($path);

        $media = [
            'id' => time(), // Using timestamp as temporary ID
            'filename' => $filename,
            'original_name' => $originalName,
            'path' => $path,
            'url' => $url,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'alt_text' => $request->input('alt_text'),
            'created_at' => now()->toISOString(),
        ];

        return response()->json(['media' => $media], 201);
    }

    /**
     * Delete a media file
     */
    public function destroy(Request $request, $id)
    {
        // Since we're using file-based storage without a database,
        // we need to get the filename from the request
        $filename = $request->query('filename');
        
        if (!$filename) {
            // Try to find by ID (which is based on position in the list)
            $files = Storage::disk('public')->files('media');
            $index = (int) $id - 1;
            
            if (isset($files[$index])) {
                $filename = basename($files[$index]);
            }
        }

        if ($filename) {
            $path = 'media/' . $filename;
            
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
                return response()->json(['message' => 'Media deleted successfully']);
            }
        }

        return response()->json(['error' => 'Media not found'], 404);
    }
}
