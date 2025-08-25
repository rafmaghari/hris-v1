<?php

namespace App\Enums;

enum Gender: int
{
    case MALE = 1;
    case FEMALE = 2;

    public function label(): string
    {
        return match ($this) {
            self::MALE => 'Male',
            self::FEMALE => 'Female',
        };
    }

    public static function options(): array
    {
        return [
            ['value' => self::MALE->value, 'label' => self::MALE->label()],
            ['value' => self::FEMALE->value, 'label' => self::FEMALE->label()],
        ];
    }
}
