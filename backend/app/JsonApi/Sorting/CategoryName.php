<?php

namespace App\JsonApi\Sorting;

use LaravelJsonApi\Eloquent\Contracts\SortField;

class CategoryName implements SortField
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
     * CategoryName constructor.
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
            ->leftJoin('categories', 'categories.id', '=', 'items.category_id')
            ->select('items.*')
            ->orderBy('categories.name', $direction)
            ->orderBy('items.id', $direction);
    }
}
