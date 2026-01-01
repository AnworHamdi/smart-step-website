<?php

namespace App\Policies;

use App\Models\Item;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class ItemPolicy
{
    use HandlesAuthorization;

    public function viewAny(?User $user): Response|bool
    {
        // Allow public read access for unauthenticated users
        if ($user === null) {
            return true;
        }
        return $user->can('view items');
    }

    public function view(?User $user, Item $item): Response|bool
    {
        // Allow public read access for published items
        if ($user === null) {
            // Only allow viewing published items for guests
            return $item->status === 'published';
        }
        return $user->can('view items');
    }

    public function create(User $user): Response|bool
    {
        return $user->can('create items');
    }

    public function update(User $user, Item $item): Response|bool
    {
        if ($user->is($item->user)) {
            return true;
        }

        return $user->can('edit items');
    }

    public function delete(User $user, Item $item): Response|bool
    {
        if ($user->is($item->user)) {
            return true;
        }

        return $user->can('delete items');
    }
}
