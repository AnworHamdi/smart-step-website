<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Neomerx\JsonApi\Exceptions\JsonApiException;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        JsonApiException::class,
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register()
    {
        $this->renderable(
            \LaravelJsonApi\Exceptions\ExceptionParser::make()->renderable()
        );

        // Handle validation exceptions with detailed field errors
        $this->renderable(function (\Illuminate\Validation\ValidationException $e, $request) {
            if ($request->is('api/*') && $request->expectsJson()) {
                return $this->jsonApiValidationError($e);
            }
        });

        // Handle authentication exceptions
        $this->renderable(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->is('api/*') && $request->expectsJson()) {
                return $this->jsonApiError('Unauthenticated', $e->getMessage() ?: 'You must be authenticated to access this resource.', 401);
            }
        });

        // Handle authorization exceptions
        $this->renderable(function (\Illuminate\Auth\Access\AuthorizationException $e, $request) {
            if ($request->is('api/*') && $request->expectsJson()) {
                return $this->jsonApiError('Forbidden', $e->getMessage() ?: 'You do not have permission to perform this action.', 403);
            }
        });

        // Handle model not found exceptions
        $this->renderable(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, $request) {
            if ($request->is('api/*') && $request->expectsJson()) {
                return $this->jsonApiError('Not Found', 'The requested resource was not found.', 404);
            }
        });

        // Handle user deletion exception
        $this->renderable(function (UserDeletionException $e, $request) {
            if ($request->is('api/*') && $request->expectsJson()) {
                return $this->jsonApiError('Forbidden', $e->getMessage(), $e->getCode());
            }
        });

        // Handle general HTTP exceptions
        $this->renderable(function (\Symfony\Component\HttpKernel\Exception\HttpException $e, $request) {
            if ($request->is('api/*') && $request->expectsJson()) {
                return $this->jsonApiError(
                    $e->getMessage() ?: 'Error',
                    $e->getMessage(),
                    $e->getStatusCode()
                );
            }
        });
    }

    /**
     * Format validation exception as JSON:API error
     *
     * @param  \Illuminate\Validation\ValidationException  $exception
     * @return \Illuminate\Http\JsonResponse
     */
    protected function jsonApiValidationError(\Illuminate\Validation\ValidationException $exception)
    {
        $errors = [];

        foreach ($exception->errors() as $field => $messages) {
            foreach ($messages as $message) {
                $errors[] = [
                    'status' => '422',
                    'title' => 'Validation Error',
                    'detail' => $message,
                    'source' => [
                        'pointer' => '/data/attributes/' . $field,
                    ],
                ];
            }
        }

        return response()->json(['errors' => $errors], 422, [
            'Content-Type' => 'application/vnd.api+json',
        ]);
    }

    /**
     * Format a simple error as JSON:API error
     *
     * @param  string  $title
     * @param  string  $detail
     * @param  int  $status
     * @return \Illuminate\Http\JsonResponse
     */
    protected function jsonApiError(string $title, string $detail, int $status)
    {
        return response()->json([
            'errors' => [
                [
                    'status' => (string) $status,
                    'title' => $title,
                    'detail' => $detail,
                ],
            ],
        ], $status, [
            'Content-Type' => 'application/vnd.api+json',
        ]);
    }
}
