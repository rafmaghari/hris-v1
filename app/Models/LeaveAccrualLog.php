<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveAccrualLog extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_leave_setting_id',
        'user_id',
        'type',
        'amount',
        'balance_before',
        'balance_after',
        'description',
        'metadata',
        'accrual_date',
        'processed_at',
    ];

    protected $casts = [
        'amount'         => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after'  => 'decimal:2',
        'metadata'       => 'array',
        'accrual_date'   => 'datetime',
        'processed_at'   => 'datetime',
    ];

    // Accrual types
    public const TYPE_ACCRUAL    = 'accrual';
    public const TYPE_DEDUCTION  = 'deduction';
    public const TYPE_CARRY_OVER = 'carry_over';
    public const TYPE_ADJUSTMENT = 'adjustment';

    public function userLeaveSetting(): BelongsTo
    {
        return $this->belongsTo(UserLeaveSetting::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForPeriod($query, $startDate, $endDate)
    {
        return $query->whereBetween('accrual_date', [$startDate, $endDate]);
    }
}
