<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Users table indexes
        Schema::table('users', function (Blueprint $table) {
            $table->index('name');
        });

        // Items table indexes
        Schema::table('items', function (Blueprint $table) {
            $table->index('name');
            $table->index('status');
            $table->index('is_on_homepage');
            $table->index('date_at');
            $table->index('created_at');
            $table->index('user_id');
            $table->index('category_id');
        });

        // Categories table indexes
        Schema::table('categories', function (Blueprint $table) {
            $table->index('name');
        });

        // Tags table indexes
        Schema::table('tags', function (Blueprint $table) {
            $table->index('name');
        });

        // Item_Tag pivot table composite index
        Schema::table('item_tag', function (Blueprint $table) {
            $table->index(['item_id', 'tag_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes in reverse order
        Schema::table('item_tag', function (Blueprint $table) {
            $table->dropIndex(['item_id', 'tag_id']);
        });

        Schema::table('tags', function (Blueprint $table) {
            $table->dropIndex(['name']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex(['name']);
        });

        Schema::table('items', function (Blueprint $table) {
            $table->dropIndex(['name']);
            $table->dropIndex(['status']);
            $table->dropIndex(['is_on_homepage']);
            $table->dropIndex(['date_at']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['category_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['name']);
        });
    }

};
