<?php
namespace App\Models;

use App\Enums\LeadAccrualFrequencyType;
use App\Enums\LeadAccrualType;
use App\Enums\Status;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveSettingsTemplate extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'leave_type_id',
        'accrual_type',
        'fixed_days',
        'accrual_frequency',
        'accrual_amount',
        'max_cap',
        'allow_carry_over',
        'max_carry_over',
        'status',
    ];

    protected $casts = [
        'accrual_type'      => LeadAccrualType::class,
        'accrual_frequency' => LeadAccrualFrequencyType::class,
        'allow_carry_over'  => 'boolean',
        'status'            => Status::class,
    ];

    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }
}
