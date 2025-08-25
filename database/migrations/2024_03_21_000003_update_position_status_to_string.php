<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('positions', function (Blueprint $table) {
            $table->string('status')->default('active')->change();
        });
    }

    public function down()
    {
        Schema::table('positions', function (Blueprint $table) {
            $table->unsignedTinyInteger('status')->default(1)->change();
        });
    }
}; 