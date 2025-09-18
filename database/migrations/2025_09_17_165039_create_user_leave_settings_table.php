<?php

use App\Enums\LeadAccrualType;
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
        Schema::create('user_leave_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('leave_settings_template_id')
                ->constrained('leave_settings_templates')
                ->cascadeOnDelete();

            $table->date('start_date');
            $table->date('end_date')->nullable();

            $table->unsignedTinyInteger('accrual_type')->default(LeadAccrualType::FIXED->value)
                ->comment('1: Fixed, 2: Accrual');
            $table->unsignedTinyInteger('accrual_frequency')->nullable()
                ->comment('1: Monthly, 2: Quarterly, 3: Yearly');
            $table->decimal('accrual_amount', 5, 2)->nullable();
            $table->decimal('max_cap', 5, 2);
            $table->boolean('allow_carry_over')->default(false);
            $table->decimal('max_carry_over', 5, 2)->default(0);

            $table->decimal('current_balance', 5, 2)->default(0);
            $table->decimal('carried_over', 5, 2)->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_leave_settings');
    }
};
