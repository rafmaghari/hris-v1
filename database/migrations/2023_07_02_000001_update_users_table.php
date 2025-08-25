<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add new columns
            $table->string('first_name')->after('id')->nullable();
            $table->string('last_name')->after('first_name')->nullable();

            // Copy data from name to first_name for existing users
            // This will happen in a separate DB statement
        });

        // Move existing name data to first_name
        DB::statement('UPDATE users SET first_name = name');

        Schema::table('users', function (Blueprint $table) {
            // Remove the old name column
            $table->dropColumn('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add the name column back
            $table->string('name')->after('id')->nullable();
        });

        // Copy data from first_name back to name for reverting
        DB::statement('UPDATE users SET name = first_name');

        Schema::table('users', function (Blueprint $table) {
            // Remove the new columns
            $table->dropColumn(['first_name', 'last_name']);
        });
    }
};
