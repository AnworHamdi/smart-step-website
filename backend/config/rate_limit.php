<?php

return [

    /*
    |--------------------------------------------------------------------------
    | API Rate Limits
    |--------------------------------------------------------------------------
    |
    | Configure the rate limits for different user roles. Values are
    | requests per minute.
    |
    */

    'admin' => env('RATE_LIMIT_ADMIN', 1000),
    'creator' => env('RATE_LIMIT_CREATOR', 100),
    'member' => env('RATE_LIMIT_MEMBER', 60),
    'guest' => env('RATE_LIMIT_GUEST', 30),

];
