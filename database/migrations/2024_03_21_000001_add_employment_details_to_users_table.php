<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('position_id')->nullable();
            $table->unsignedBigInteger('department_id')->nullable();
            $table->unsignedBigInteger('manager_id')->nullable();
            $table->date('date_hired')->nullable();
            $table->enum('employment_type', ['regular', 'probationary', 'contractual'])->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->date('end_at')->nullable();

            $table->foreign('position_id')->references('id')->on('positions')->onDelete('set null');
            $table->foreign('department_id')->references('id')->on('departments')->onDelete('set null');
            $table->foreign('manager_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['position_id']);
            $table->dropForeign(['department_id']);
            $table->dropForeign(['manager_id']);
            
            $table->dropColumn([
                'position_id',
                'department_id',
                'manager_id',
                'date_hired',
                'employment_type',
                'status',
                'end_at'
            ]);
        });
    }
}; 