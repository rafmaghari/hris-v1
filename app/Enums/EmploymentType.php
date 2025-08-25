<?php

namespace App\Enums;

enum EmploymentType: string
{
    case REGULAR = 'regular';
    case PROBATIONARY = 'probationary';
    case CONTRACTUAL = 'contractual';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function options(): array
    {
        return [
            ['value' => self::REGULAR->value, 'label' => 'Regular'],
            ['value' => self::PROBATIONARY->value, 'label' => 'Probationary'],
            ['value' => self::CONTRACTUAL->value, 'label' => 'Contractual'],
        ];
    }
} 