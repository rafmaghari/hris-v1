<?php

use App\Enums\LeaveRequestStatus;
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
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_leave_setting_id')
                ->constrained('user_leave_settings')
                ->cascadeOnDelete();

            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('days_requested', 5, 2); // supports half-day, etc.

            $table->unsignedTinyInteger('status')->default(LeaveRequestStatus::PENDING->value)
                ->comment('1: Pending, 2: Approved, 3: Rejected, 4: Cancelled');
            $table->text('reason')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->date('approved_at')->nullable();
            $table->string('remarks')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
    }
};
