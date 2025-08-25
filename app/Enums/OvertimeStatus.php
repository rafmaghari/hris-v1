<?php

namespace App\Enums;

enum OvertimeStatus: int
{
    case PENDING = 1;
    case APPROVED = 2;
    case REJECTED = 3;
    case CANCELLED = 4;

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::APPROVED => 'Approved',
            self::REJECTED => 'Rejected',
            self::CANCELLED => 'Cancelled',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function options(): array
    {
        return [
            ['value' => self::PENDING->value, 'label' => self::PENDING->label()],
            ['value' => self::APPROVED->value, 'label' => self::APPROVED->label()],
            ['value' => self::REJECTED->value, 'label' => self::REJECTED->label()],
            ['value' => self::CANCELLED->value, 'label' => self::CANCELLED->label()],
        ];
    }
}
