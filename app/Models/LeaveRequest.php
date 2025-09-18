<?php
namespace App\Models;

use App\Enums\LeaveRequestStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeaveRequest extends Model
{
    protected $fillable = [
        'user_id',
        'user_leave_setting_id',
        'start_date',
        'end_date',
        'days_requested',
        'status',
        'reason',
        'approved_by',
        'approved_at',
        'remarks',
    ];

    protected $casts = [
        'start_date'     => 'date',
        'end_date'       => 'date',
        'days_requested' => 'decimal:2',
        'status'         => LeaveRequestStatus::class,
        'approved_at'    => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function userLeaveSetting(): BelongsTo
    {
        return $this->belongsTo(UserLeaveSetting::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(LeaveRequestStatusLog::class);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', LeaveRequestStatus::PENDING);
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', LeaveRequestStatus::APPROVED);
    }

    public function scopeRejected(Builder $query): Builder
    {
        return $query->where('status', LeaveRequestStatus::REJECTED);
    }

    public function scopeCancelled(Builder $query): Builder
    {
        return $query->where('status', LeaveRequestStatus::CANCELLED);
    }

    public function isPending(): bool
    {
        return $this->status === LeaveRequestStatus::PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === LeaveRequestStatus::APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === LeaveRequestStatus::REJECTED;
    }

    public function isCancelled(): bool
    {
        return $this->status === LeaveRequestStatus::CANCELLED;
    }
}
