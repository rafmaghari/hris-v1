<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\Status;

class Group extends Model
{
    //
    protected $fillable = [
        'name',
        'description',
        'status',
    ];

    protected $casts = [
        'status' => Status::class,
    ];

    public function leader()
    {
        return $this->belongsTo(Member::class, 'leader_id');
    }
}
