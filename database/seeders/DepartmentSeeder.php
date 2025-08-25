<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;
use App\Enums\Status;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Human Resources',
                'description' => 'Manages employee relations, recruitment, and HR policies',
                'status' => Status::ACTIVE->value,
            ],
            [
                'name' => 'Information Technology',
                'description' => 'Handles all IT infrastructure and software development',
                'status' => Status::ACTIVE->value,
            ],
            [
                'name' => 'Finance',
                'description' => 'Manages company finances and accounting',
                'status' => Status::ACTIVE->value,
            ],
            [
                'name' => 'Marketing',
                'description' => 'Handles marketing and promotional activities',
                'status' => Status::ACTIVE->value,
            ],
            [
                'name' => 'Operations',
                'description' => 'Manages day-to-day business operations',
                'status' => Status::ACTIVE->value,
            ],
        ];

        foreach ($departments as $department) {
            Department::create($department);
        }
    }
} 