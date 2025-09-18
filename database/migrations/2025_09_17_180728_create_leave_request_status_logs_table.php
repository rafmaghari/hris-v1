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
        Schema::create('leave_request_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('leave_request_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('status')->default(LeaveRequestStatus::PENDING->value)
                ->comment('1: Pending, 2: Approved, 3: Rejected, 4: Cancelled');
            $table->foreignId('acted_by')->constrained('users');
            $table->text('remarks')->nullable();
            $table->timestamp('acted_at')->useCurrent();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_request_status_logs');
    }
};
