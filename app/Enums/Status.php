<?php

namespace App\Enums;

enum Status: int
{
    case ACTIVE = 1;
    case INACTIVE = 2;

    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Active',
            self::INACTIVE => 'Inactive',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function options(): array
    {
        return [
            ['value' => self::ACTIVE->value, 'label' => self::ACTIVE->label()],
            ['value' => self::INACTIVE->value, 'label' => self::INACTIVE->label()],
        ];
    }
}
