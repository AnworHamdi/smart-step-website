<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use LaravelJsonApi\Core\Document\Error;

class UploadController extends Controller
{
    /**
     * List of allowed upload paths
     *
     * @var array
     */
    protected $allowedPaths = [
        'users' => [
            'profile-image',
        ],
        'items' => [
            'image',
        ],
    ];

    public function __construct()
    {
        $this->allowedPaths = collect($this->allowedPaths);
    }

    /**
     * Handle the incoming request.
     *
     * @return \Illuminate\Http\Response
     */
    public function __invoke(string $resource, string $id, string $field, Request $request)
    {
        // Check if path is allowed
        if ($this->routeIsAllowed($resource, $field)) {

            $request->validate([
                'attachment' => 'required|image|max:5120', // Increased max size to 5MB
            ]);

            // Find the model
            $modelClass = "App\\Models\\" . ucfirst(Str::singular($resource));
            if (!class_exists($modelClass)) {
                 return Error::fromArray([
                    'title' => 'Bad Request',
                    'detail' => "Resource class {$modelClass} not found",
                    'status' => '400',
                ]);
            }

            $model = $modelClass::find($id);
            
            // For new items (id=0), we might need a different strategy, 
            // but for now let's assume valid ID or handle accordingly.
            if (!$model && $id != '0') {
                return Error::fromArray([
                    'title' => 'Not Found',
                    'detail' => "Model {$resource} with ID {$id} not found",
                    'status' => '404',
                ]);
            }

            try {
                if ($model) {
                    // Use Spatie Media Library
                    $media = $model->addMediaFromRequest('attachment')
                        ->toMediaCollection($field);
                    
                    $url = $media->getUrl();
                    
                    // Also update the fallback 'image' column if it exists on the model
                    if ($field === 'image' && isset($model->image)) {
                        $model->update(['image' => $url]);
                    }
                } else {
                    // Fallback for when ID is 0 (e.g. before item is saved)
                    // We'll just save to public storage for now
                    $path = $request->file('attachment')->store("uploads/{$resource}/temp", 'public');
                    $url = Storage::url($path);
                }

                return response()->json(compact('url'), 201);
            } catch (\Exception $e) {
                return Error::fromArray([
                    'title' => 'Internal Server Error',
                    'detail' => $e->getMessage(),
                    'status' => '500',
                ]);
            }
        }

        return
            Error::fromArray([
                'title' => 'Bad Request',
                'detail' => 'Not a valid path',
                'status' => '400',
            ]);
    }

    /**
     * Check if route is allowed
     *
     * @return string|bool
     */
    protected function routeIsAllowed(string $resource, string $field)
    {
        return $this->allowedPaths->search(function ($allowedFields, $allowedResource) use ($resource, $field) {
            return $resource == $allowedResource && in_array($field, $allowedFields);
        });
    }
}
