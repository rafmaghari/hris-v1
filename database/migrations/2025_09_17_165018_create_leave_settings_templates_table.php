<?php

use App\Enums\LeadAccrualType;
use App\Enums\Status;
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
        Schema::create('leave_settings_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // "VL Standard", "SL Accrual"
            $table->foreignId('leave_type_id')->constrained('leave_types')->cascadeOnDelete();

            $table->unsignedTinyInteger('accrual_type')->default(LeadAccrualType::FIXED->value)
                ->comment('1: Fixed, 2: Accrual');

            // Fixed type
            $table->unsignedInteger('fixed_days')->nullable();

            // Accrual type
            $table->unsignedTinyInteger('accrual_frequency')->nullable()
                ->comment('1: Monthly, 2: Quarterly, 3: Yearly');
            $table->decimal('accrual_amount', 5, 2)->nullable();
            $table->decimal('max_cap', 5, 2)->nullable();

            // Carry-over rules
            $table->boolean('allow_carry_over')->default(false);
            $table->decimal('max_carry_over', 5, 2)->nullable();

            $table->unsignedTinyInteger('status')->default(Status::ACTIVE->value)
                ->comment('1: Active, 2: Inactive');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_settings_templates');
    }
};
