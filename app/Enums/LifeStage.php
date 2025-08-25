<?php

namespace App\Enums;

enum LifeStage: int
{
    case KIDS = 1;
    case STUDENT = 2;
    case WORKING = 3;
    case MARRIED = 4;

    public function label(): string
    {
        return match ($this) {
            self::KIDS => 'Kids',
            self::STUDENT => 'Student',
            self::WORKING => 'Working',
            self::MARRIED => 'Married',
        };
    }

    public static function options(): array
    {
        return [
            ['value' => self::KIDS->value, 'label' => self::KIDS->label()],
            ['value' => self::STUDENT->value, 'label' => self::STUDENT->label()],
            ['value' => self::WORKING->value, 'label' => self::WORKING->label()],
            ['value' => self::MARRIED->value, 'label' => self::MARRIED->label()],
        ];
    }
}
