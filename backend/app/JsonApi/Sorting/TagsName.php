<?php

namespace App\JsonApi\Sorting;

use Illuminate\Support\Facades\DB;
use LaravelJsonApi\Eloquent\Contracts\SortField;

class TagsName implements SortField
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
     * TagsName constructor.
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
            ->leftJoin('item_tag', 'item_id', '=', 'items.id')
            ->leftJoin('tags', 'item_tag.tag_id', '=', 'tags.id')
            ->groupBy('items.id')
            ->select('items.*', DB::raw('group_concat(tags.name) as ctags'))
            ->orderBy('ctags', $direction)->orderBy('items.id', $direction);
    }
}
