<?php

namespace Database\Seeders;

use App\Models\LeaveType;
use App\Enums\Status;
use Illuminate\Database\Seeder;

class LeaveTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $leaveTypes = [
            [
                'name' => 'Sick Leave',
                'description' => 'Leave for medical reasons or illness',
                'status' => Status::ACTIVE->value,
            ],
            [
                'name' => 'Vacation Leave',
                'description' => 'Leave for vacation, rest, or personal time',
                'status' => Status::ACTIVE->value,
            ],
            [
                'name' => 'Bereavement Leave',
                'description' => 'Leave for dealing with death of family members or loved ones',
                'status' => Status::ACTIVE->value,
            ],
        ];

        foreach ($leaveTypes as $leaveType) {
            LeaveType::create($leaveType);
        }
    }
}
