<?php

namespace Database\Seeders;

use App\Models\Platform;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PlatformSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $platforms = [
            [
                'name' => 'Listing',
                'slug' => 'listing',
                'description' => 'Platform for managing listings and property details',
                'url' => '/listing',
                'is_active' => true,
            ],
            [
                'name' => 'Basecamp',
                'slug' => 'basecamp',
                'description' => 'Central project management and collaboration platform',
                'url' => '/basecamp',
                'is_active' => true,
            ],
            [
                'name' => 'Warranty',
                'slug' => 'warranty',
                'description' => 'Platform for managing warranty claims and services',
                'url' => '/warranty',
                'is_active' => true,
            ],
            [
                'name' => 'Inventory',
                'slug' => 'inventory',
                'description' => 'Platform for tracking and managing inventory items',
                'url' => '/inventory',
                'is_active' => true,
            ],
        ];

        foreach ($platforms as $platform) {
            // Generate a unique secret key for each platform
            $platform['secret_key'] = 'platform_key_'.Str::random(40);

            Platform::updateOrCreate(
                ['slug' => $platform['slug']],
                $platform
            );
        }
    }
}
