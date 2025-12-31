<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class ApiLoggingMiddleware
{
    /**
     * Sensitive fields to exclude from logging
     */
    protected array $sensitiveFields = [
        'password',
        'password_confirmation',
        'token',
        'access_token',
        'refresh_token',
        'api_key',
        'secret',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip logging if disabled
        if (!config('logging.api.enabled', false)) {
            return $next($request);
        }

        // Generate request ID for correlation
        $requestId = Str::uuid()->toString();
        $request->headers->set('X-Request-ID', $requestId);

        $startTime = microtime(true);

        // Log request
        $this->logRequest($request, $requestId);

        // Process request
        $response = $next($request);

        // Calculate response time
        $duration = round((microtime(true) - $startTime) * 1000, 2);

        // Log response
        $this->logResponse($request, $response, $requestId, $duration);

        // Add request ID to response headers
        $response->headers->set('X-Request-ID', $requestId);

        return $response;
    }

    /**
     * Log the incoming request
     */
    protected function logRequest(Request $request, string $requestId): void
    {
        $data = [
            'request_id' => $requestId,
            'type' => 'request',
            'method' => $request->method(),
            'path' => $request->path(),
            'query' => $request->query->all(),
            'user_id' => $request->user()?->id,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ];

        // Add body for non-GET requests (excluding sensitive data)
        if (!$request->isMethod('GET')) {
            $data['body'] = $this->filterSensitiveData($request->all());
        }

        Log::channel(config('logging.api.channel', 'daily'))->info('API Request', $data);
    }

    /**
     * Log the response
     */
    protected function logResponse(Request $request, Response $response, string $requestId, float $duration): void
    {
        $data = [
            'request_id' => $requestId,
            'type' => 'response',
            'status' => $response->getStatusCode(),
            'duration_ms' => $duration,
            'size_bytes' => strlen($response->getContent()),
        ];

        // Log level based on status code
        $logLevel = match (true) {
            $response->getStatusCode() >= 500 => 'error',
            $response->getStatusCode() >= 400 => 'warning',
            default => 'info',
        };

        // Add error details for 4xx and 5xx responses
        if ($response->getStatusCode() >= 400) {
            $data['response'] = json_decode($response->getContent(), true);
        }

        Log::channel(config('logging.api.channel', 'daily'))->{$logLevel}('API Response', $data);

        // Log slow requests separately
        if ($duration > config('logging.api.slow_threshold', 1000)) {
            Log::channel('daily')->warning('Slow API Request', [
                'request_id' => $requestId,
                'method' => $request->method(),
                'path' => $request->path(),
                'duration_ms' => $duration,
                'user_id' => $request->user()?->id,
            ]);
        }
    }

    /**
     * Filter out sensitive data from the array
     */
    protected function filterSensitiveData(array $data): array
    {
        foreach ($this->sensitiveFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = '***REDACTED***';
            }

            // Check nested arrays
            if (isset($data['data']['attributes'][$field])) {
                $data['data']['attributes'][$field] = '***REDACTED***';
            }
        }

        return $data;
    }
}
