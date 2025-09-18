<?php
namespace App\Models;

use App\Enums\OvertimeStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OvertimeRequest extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'start_time',
        'end_time',
        'reason',
        'total_hours',
        'status',
        'approver_note',
        'approved_at',
    ];

    protected $casts = [
        'date'        => 'date:Y-m-d',
        'start_time'  => 'datetime',
        'end_time'    => 'datetime',
        'total_hours' => 'decimal:2',
        'status'      => OvertimeStatus::class,
        'approved_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', OvertimeStatus::PENDING);
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', OvertimeStatus::APPROVED);
    }

    public function scopeRejected(Builder $query): Builder
    {
        return $query->where('status', OvertimeStatus::REJECTED);
    }

    public function scopeCancelled(Builder $query): Builder
    {
        return $query->where('status', OvertimeStatus::CANCELLED);
    }

    public function isPending(): bool
    {
        return $this->status === OvertimeStatus::PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === OvertimeStatus::APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === OvertimeStatus::REJECTED;
    }

    public function isCancelled(): bool
    {
        return $this->status === OvertimeStatus::CANCELLED;
    }
}
