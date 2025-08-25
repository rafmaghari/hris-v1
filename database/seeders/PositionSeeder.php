<?php

namespace Database\Seeders;

use App\Models\Position;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $positions = [
            // Management
            [
                'name' => 'Chief Executive Officer',
                'description' => 'Responsible for making major corporate decisions, managing overall operations and resources, and being the public face of the company.',
            ],
            [
                'name' => 'Chief Technology Officer',
                'description' => 'Oversees the technological direction of the company, managing the engineering and development teams, and ensuring technical excellence.',
            ],
            [
                'name' => 'Chief Operating Officer',
                'description' => 'Responsible for overseeing daily operations, implementing business strategies, and ensuring operational efficiency.',
            ],
            [
                'name' => 'Chief Marketing Officer',
                'description' => 'Leads marketing initiatives, brand development, and customer acquisition strategies across all platforms.',
            ],

            // Backend Development
            [
                'name' => 'Backend Team Lead',
                'description' => 'Leads the backend development team, architects solutions, and ensures code quality and best practices.',
            ],
            [
                'name' => 'Senior Backend Developer',
                'description' => 'Develops complex backend systems, mentors junior developers, and implements architectural decisions.',
            ],
            [
                'name' => 'Backend Developer',
                'description' => 'Builds and maintains server-side applications, APIs, and database systems.',
            ],
            [
                'name' => 'Junior Backend Developer',
                'description' => 'Assists in backend development tasks, learns best practices, and grows technical skills under mentorship.',
            ],

            // Frontend Development
            [
                'name' => 'Frontend Team Lead',
                'description' => 'Leads the frontend development team, ensures UI/UX excellence, and maintains frontend architecture.',
            ],
            [
                'name' => 'Senior Frontend Developer',
                'description' => 'Develops complex frontend applications, implements UI/UX designs, and mentors junior developers.',
            ],
            [
                'name' => 'Frontend Developer',
                'description' => 'Builds and maintains user interfaces, implements responsive designs, and ensures cross-browser compatibility.',
            ],
            [
                'name' => 'Junior Frontend Developer',
                'description' => 'Assists in frontend development tasks, learns modern frameworks, and grows under mentorship.',
            ],

            // Marketing
            [
                'name' => 'Marketing Director',
                'description' => 'Develops and executes marketing strategies, oversees campaigns, and manages the marketing team.',
            ],
            [
                'name' => 'Marketing Manager',
                'description' => 'Manages marketing campaigns, coordinates with team members, and analyzes marketing metrics.',
            ],
            [
                'name' => 'Senior Marketing Specialist',
                'description' => 'Executes marketing initiatives, develops content strategies, and analyzes market trends.',
            ],
            [
                'name' => 'Marketing Specialist',
                'description' => 'Creates marketing content, manages social media, and assists in campaign execution.',
            ],
            [
                'name' => 'Junior Marketing Specialist',
                'description' => 'Supports marketing initiatives, creates basic content, and learns marketing tools and strategies.',
            ],

            // Operations
            [
                'name' => 'Operations Director',
                'description' => 'Oversees all operational activities, develops processes, and ensures organizational efficiency.',
            ],
            [
                'name' => 'Operations Manager',
                'description' => 'Manages daily operations, implements processes, and coordinates with different departments.',
            ],
            [
                'name' => 'Senior Operations Specialist',
                'description' => 'Executes operational initiatives, optimizes processes, and handles complex operational tasks.',
            ],
            [
                'name' => 'Operations Specialist',
                'description' => 'Maintains operational processes, handles documentation, and supports daily operations.',
            ],
            [
                'name' => 'Junior Operations Specialist',
                'description' => 'Assists in operational tasks, learns company processes, and provides administrative support.',
            ],
        ];

        foreach ($positions as $position) {
            Position::create($position);
        }
    }
} 