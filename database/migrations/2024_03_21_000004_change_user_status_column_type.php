<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // First drop the enum column
            $table->dropColumn('status');
        });

        Schema::table('users', function (Blueprint $table) {
            // Then recreate it as an integer
            $table->integer('status')->default(1);
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            // First drop the integer column
            $table->dropColumn('status');
        });

        Schema::table('users', function (Blueprint $table) {
            // Then recreate it as an enum
            $table->enum('status', ['active', 'inactive'])->default('active');
        });
    }
}; 