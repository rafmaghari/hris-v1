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
        Schema::table('leave_accrual_logs', function (Blueprint $table) {
            $table->datetime('accrual_date')->change()->comment('Date and time when accrual should be applied');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leave_accrual_logs', function (Blueprint $table) {
            $table->date('accrual_date')->change()->comment('Date when accrual should be applied');
        });
    }
};
