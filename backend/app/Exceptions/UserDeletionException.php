<?php

namespace App\Exceptions;

use Exception;

class UserDeletionException extends Exception
{
    /**
     * Create a new exception instance.
     *
     * @param  string  $message
     * @return void
     */
    public function __construct(string $message = 'You cannot delete yourself.')
    {
        parent::__construct($message, 403);
    }

    /**
     * Report the exception.
     *
     * @return bool|null
     */
    public function report()
    {
        // Don't report this exception as it's expected behavior
        return false;
    }
}
