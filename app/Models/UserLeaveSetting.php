<?php
namespace App\Models;

use App\Enums\LeadAccrualFrequencyType;
use App\Enums\LeadAccrualType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserLeaveSetting extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'leave_settings_template_id',
        'start_date',
        'end_date',
        'accrual_type',
        'accrual_frequency',
        'accrual_amount',
        'max_cap',
        'allow_carry_over',
        'max_carry_over',
        'current_balance',
        'carried_over',
        'allow_custom_settings',
    ];

    protected $casts = [
        'start_date'            => 'date:Y-m-d',
        'end_date'              => 'date:Y-m-d',
        'accrual_type'          => LeadAccrualType::class,
        'accrual_frequency'     => LeadAccrualFrequencyType::class,
        'allow_carry_over'      => 'boolean',
        'allow_custom_settings' => 'boolean',
        'accrual_amount'        => 'decimal:2',
        'max_cap'               => 'decimal:2',
        'max_carry_over'        => 'decimal:2',
        'current_balance'       => 'decimal:2',
        'carried_over'          => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function leaveSettingsTemplate(): BelongsTo
    {
        return $this->belongsTo(LeaveSettingsTemplate::class);
    }

    public function accrualLogs(): HasMany
    {
        return $this->hasMany(LeaveAccrualLog::class);
    }

    public function getLatestAccrualLogAttribute()
    {
        return $this->accrualLogs()
            ->where('type', LeaveAccrualLog::TYPE_ACCRUAL)
            ->latest('accrual_date')
            ->first();
    }
}
