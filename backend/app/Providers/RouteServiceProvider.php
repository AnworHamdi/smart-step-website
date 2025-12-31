<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to the "home" route for your application.
     *
     * This is used by Laravel authentication to redirect users after login.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * Define your route model bindings, pattern filters, etc.
     *
     * @return void
     */
    public function boot()
    {
        $this->configureRateLimiting();

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }

    /**
     * Configure the rate limiters for the application.
     *
     * @return void
     */
    protected function configureRateLimiting()
    {
        // Role-based API rate limiting
        RateLimiter::for('api', function (Request $request) {
            $user = $request->user();
            
            // Determine rate limit based on user role
            $limit = match (true) {
                $user && $user->hasRole('admin') => config('rate_limit.admin', 1000),
                $user && $user->hasRole('creator') => config('rate_limit.creator', 100),
                $user && $user->hasRole('member') => config('rate_limit.member', 60),
                default => config('rate_limit.guest', 30),
            };

            return Limit::perMinute($limit)
                ->by($user?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'errors' => [
                            [
                                'status' => '429',
                                'title' => 'Too Many Requests',
                                'detail' => 'Rate limit exceeded. Please try again later.',
                            ],
                        ],
                    ], 429, array_merge($headers, [
                        'Content-Type' => 'application/vnd.api+json',
                    ]));
                });
        });
    }
}
