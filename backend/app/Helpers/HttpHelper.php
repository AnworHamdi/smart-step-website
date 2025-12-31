<?php

namespace App\Helpers;

class HttpHelper
{
    /**
     * Parse headers to collapse internal arrays
     *
     * This transforms headers from array format (e.g., ['Content-Type' => ['application/json']])
     * to string format (e.g., ['Content-Type' => 'application/json'])
     *
     * @param  array  $headers
     * @return array
     */
    public static function parseHeaders(array $headers): array
    {
        return collect($headers)->map(function ($item) {
            if (is_array($item)) {
                return $item[0] ?? null;
            }

            return $item;
        })->toArray();
    }
}
