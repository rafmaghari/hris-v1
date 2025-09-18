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
        Schema::create('leave_accrual_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_leave_setting_id')
                ->constrained('user_leave_settings')
                ->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->string('type')->comment('accrual, deduction, carry_over, adjustment');
            $table->decimal('amount', 8, 2)->comment('Amount added/deducted');
            $table->decimal('balance_before', 8, 2)->comment('Balance before transaction');
            $table->decimal('balance_after', 8, 2)->comment('Balance after transaction');

            $table->string('description')->nullable()->comment('Description of the accrual/deduction');
            $table->json('metadata')->nullable()->comment('Additional data like frequency, period, etc.');

            $table->date('accrual_date')->comment('Date when accrual should be applied');
            $table->datetime('processed_at')->comment('When this log was processed');

            $table->timestamps();

            $table->index(['user_id', 'accrual_date']);
            $table->index(['user_leave_setting_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_accrual_logs');
    }
};
