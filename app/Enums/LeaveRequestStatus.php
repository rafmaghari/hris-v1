<?php
namespace App\Enums;

enum LeaveRequestStatus: int {
    case PENDING   = 1;
    case APPROVED  = 2;
    case REJECTED  = 3;
    case CANCELLED = 4;

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function options(): array
    {
        return [
            ['value' => self::PENDING->value, 'label' => 'Pending'],
            ['value' => self::APPROVED->value, 'label' => 'Approved'],
            ['value' => self::REJECTED->value, 'label' => 'Rejected'],
            ['value' => self::CANCELLED->value, 'label' => 'Cancelled'],
        ];
    }
}
