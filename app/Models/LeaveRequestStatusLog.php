<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveRequestStatusLog extends Model
{
    protected $fillable = [
        'leave_request_id',
        'status',
        'remarks',
        'approved_by',
        'approved_at',
    ];

    public function leaveRequest()
    {
        return $this->belongsTo(LeaveRequest::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', LeaveRequestStatus::PENDING);
    }
}
