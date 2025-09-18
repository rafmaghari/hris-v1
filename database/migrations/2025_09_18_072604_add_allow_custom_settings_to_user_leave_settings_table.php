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
        Schema::table('user_leave_settings', function (Blueprint $table) {
            $table->boolean('allow_custom_settings')->default(false)
                ->comment('Allow editing of template fields');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_leave_settings', function (Blueprint $table) {
            $table->dropColumn('allow_custom_settings');
        });
    }
};
