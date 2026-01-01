<?php

use App\Http\Controllers\Api\V2\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\V2\Auth\LoginController;
use App\Http\Controllers\Api\V2\Auth\LogoutController;
use App\Http\Controllers\Api\V2\Auth\RegisterController;
use App\Http\Controllers\Api\V2\Auth\ResetPasswordController;
use App\Http\Controllers\Api\V2\ContactMessageController;
use App\Http\Controllers\Api\V2\EmailSubscriptionController;
use App\Http\Controllers\Api\V2\MeController;
use App\Http\Controllers\Api\V2\SiteSettingController;
use App\Http\Controllers\Api\V2\TranslationController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;
use LaravelJsonApi\Laravel\Facades\JsonApiRoute;
use LaravelJsonApi\Laravel\Http\Controllers\JsonApiController;
use LaravelJsonApi\Laravel\Routing\ResourceRegistrar;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::prefix('v2')->middleware('json.api')->group(function () {
    Route::post('/login', LoginController::class)->name('login');
    Route::post('/register', RegisterController::class);
    Route::post('/logout', LogoutController::class)->middleware('auth:api');
    Route::post('/password-forgot', ForgotPasswordController::class);
    Route::post('/password-reset', ResetPasswordController::class)->name('password.reset');

    // Public routes
    Route::post('/contact', [ContactMessageController::class, 'store']);
    Route::post('/subscribe', [EmailSubscriptionController::class, 'subscribe']);
    
    // Public read access for settings
    Route::get('/settings', [SiteSettingController::class, 'index']);
    Route::get('/settings/{key}', [SiteSettingController::class, 'show']);
});

// Protected routes for admin modules
Route::prefix('v2')->middleware(['json.api', 'auth:api'])->group(function () {
    // Contact Messages
    Route::get('/contact-messages', [ContactMessageController::class, 'index']);
    Route::get('/contact-messages/{contactMessage}', [ContactMessageController::class, 'show']);
    Route::put('/contact-messages/{contactMessage}', [ContactMessageController::class, 'update']);
    Route::delete('/contact-messages/{contactMessage}', [ContactMessageController::class, 'destroy']);
    Route::post('/contact-messages/{contactMessage}/reply', [ContactMessageController::class, 'reply']);

    // Email Subscriptions
    Route::get('/subscriptions', [EmailSubscriptionController::class, 'index']);
    Route::get('/subscriptions/{subscription}', [EmailSubscriptionController::class, 'show']);
    Route::put('/subscriptions/{subscription}', [EmailSubscriptionController::class, 'update']);
    Route::delete('/subscriptions/{subscription}', [EmailSubscriptionController::class, 'destroy']);
    Route::post('/subscriptions/broadcast', [EmailSubscriptionController::class, 'broadcast']);

    // Site Settings (Protected: Update/Delete)
    Route::put('/settings', [SiteSettingController::class, 'update']);
    Route::delete('/settings/{key}', [SiteSettingController::class, 'destroy']);

    // Translation
    Route::post('translate', [TranslationController::class, 'translate']);
});

JsonApiRoute::server('v2')->prefix('v2')->resources(function (ResourceRegistrar $server) {
    $server->resource('categories', JsonApiController::class);
    $server->resource('items', JsonApiController::class);
    $server->resource('permissions', JsonApiController::class)->only('index');
    $server->resource('roles', JsonApiController::class);
    $server->resource('tags', JsonApiController::class);
    $server->resource('users', JsonApiController::class);
    Route::get('me', [MeController::class, 'readProfile']);
    Route::patch('me', [MeController::class, 'updateProfile']);
    Route::post('/uploads/{resource}/{id}/{field}', UploadController::class);
});

