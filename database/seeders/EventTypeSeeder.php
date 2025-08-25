<?php

namespace Database\Seeders;

use App\Models\EventType;
use Illuminate\Database\Seeder;
use App\Enums\Status;

class EventTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $eventTypes = [
            'Sunday Celebration',
            'Cell Group',
            'Training',
            'Others'
        ];

        foreach ($eventTypes as $type) {
            EventType::create([
                'name' => $type,
                'status' => Status::ACTIVE
            ]);
        }
    }
} 