<?php

namespace App\JsonApi\Sorting;

use Illuminate\Support\Facades\DB;
use LaravelJsonApi\Eloquent\Contracts\SortField;

class RolesName implements SortField
{
    private string $name;

    /**
     * Create a new sort field.
     *
     * @param  string|null  $column
     */
    public static function make(string $name): self
    {
        return new static($name);
    }

    /**
     * RolesName constructor.
     */
    public function __construct(string $name)
    {
        $this->name = $name;
    }

    /**
     * Get the name of the sort field.
     */
    public function sortField(): string
    {
        return $this->name;
    }

    /**
     * Apply the sort order to the query.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function sort($query, string $direction = 'asc')
    {
        return $query
            ->leftJoin('model_has_roles', 'model_id', '=', 'users.id')
            ->leftjoin('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->groupBy('users.id')
            ->select('users.*', DB::raw('group_concat(roles.name) as croles'))
            ->orderBy('croles', $direction)->orderBy('users.id', $direction);
    }
}
