<?php
namespace App\Enums;

enum LeadAccrualType: int {
    case FIXED   = 1;
    case ACCRUAL = 2;

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function options(): array
    {
        return [
            ['value' => self::FIXED->value, 'label' => 'Fixed'],
            ['value' => self::ACCRUAL->value, 'label' => 'Accrual'],
        ];
    }
}
