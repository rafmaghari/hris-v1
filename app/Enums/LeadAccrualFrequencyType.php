<?php
namespace App\Enums;

enum LeadAccrualFrequencyType: int {
    case MONTHLY    = 1;
    case QUARTERLY  = 2;
    case YEARLY     = 3;
    case BIMONTHLY  = 4;
    case PER_MINUTE = 5;

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function options(): array
    {
        return [
            ['value' => self::MONTHLY->value, 'label' => 'Monthly'],
            ['value' => self::QUARTERLY->value, 'label' => 'Quarterly'],
            ['value' => self::YEARLY->value, 'label' => 'Yearly'],
            ['value' => self::BIMONTHLY->value, 'label' => 'Bimonthly'],
            ['value' => self::PER_MINUTE->value, 'label' => 'Per Minute (Testing)'],
        ];
    }
}
