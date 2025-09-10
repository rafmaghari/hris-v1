<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Position;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and permissions
        $this->call(RolesAndPermissionsSeeder::class);

        // Seed platforms
        $this->call(PlatformSeeder::class);

        // Seed positions
        $this->call(PositionSeeder::class);

        // Create super admin user
        $superAdmin = User::create([
            'first_name' => 'Super',
            'last_name' => 'Admin',
            'email' => 'superadmin@example.com',
            'password' => Hash::make('password'),
            'system_user_id' => 'system|'.Str::random(20),
            'position_id' => Position::where('name', 'Chief Executive Officer')->first()->id,
        ]);
        $superAdmin->assignRole('super_admin');

        // Create CTO (Manager)
        $cto = User::create([
            'first_name' => 'Tech',
            'last_name' => 'Leader',
            'email' => 'cto@example.com',
            'password' => Hash::make('password'),
            'system_user_id' => 'system|'.Str::random(20),
            'position_id' => Position::where('name', 'Chief Technology Officer')->first()->id,
            'manager_id' => $superAdmin->id,
        ]);
        $cto->assignRole(['admin', 'manager']);

        // Create Backend Team Lead
        $backendLead = User::create([
            'first_name' => 'Backend',
            'last_name' => 'Lead',
            'email' => 'backend.lead@example.com',
            'password' => Hash::make('password'),
            'system_user_id' => 'system|'.Str::random(20),
            'position_id' => Position::where('name', 'Backend Team Lead')->first()->id,
            'manager_id' => $cto->id,
        ]);
        $backendLead->assignRole(['admin', 'manager']);

        // Create Frontend Team Lead
        $frontendLead = User::create([
            'first_name' => 'Frontend',
            'last_name' => 'Lead',
            'email' => 'frontend.lead@example.com',
            'password' => Hash::make('password'),
            'system_user_id' => 'system|'.Str::random(20),
            'position_id' => Position::where('name', 'Frontend Team Lead')->first()->id,
            'manager_id' => $cto->id,
        ]);
        $frontendLead->assignRole(['admin', 'manager']);

        // Create Senior Backend Developer
        $seniorBackend = User::create([
            'first_name' => 'Senior',
            'last_name' => 'Backend',
            'email' => 'senior.backend@example.com',
            'password' => Hash::make('password'),
            'system_user_id' => 'system|'.Str::random(20),
            'position_id' => Position::where('name', 'Senior Backend Developer')->first()->id,
            'manager_id' => $backendLead->id,
        ]);
        $seniorBackend->assignRole('user');

        // Create Backend Developer
        $backendDev = User::create([
            'first_name' => 'Backend',
            'last_name' => 'Developer',
            'email' => 'backend.dev@example.com',
            'password' => Hash::make('password'),
            'system_user_id' => 'system|'.Str::random(20),
            'position_id' => Position::where('name', 'Backend Developer')->first()->id,
            'manager_id' => $backendLead->id,
        ]);
        $backendDev->assignRole('user');

        // Create Senior Frontend Developer
        $seniorFrontend = User::create([
            'first_name' => 'Senior',
            'last_name' => 'Frontend',
            'email' => 'senior.frontend@example.com',
            'password' => Hash::make('password'),
            'system_user_id' => 'system|'.Str::random(20),
            'position_id' => Position::where('name', 'Senior Frontend Developer')->first()->id,
            'manager_id' => $frontendLead->id,
        ]);
        $seniorFrontend->assignRole('user');

        // Create Frontend Developer
        $frontendDev = User::create([
            'first_name' => 'Frontend',
            'last_name' => 'Developer',
            'email' => 'frontend.dev@example.com',
            'password' => Hash::make('password'),
            'system_user_id' => 'system|'.Str::random(20),
            'position_id' => Position::where('name', 'Frontend Developer')->first()->id,
            'manager_id' => $frontendLead->id,
        ]);
        $frontendDev->assignRole('user');

        // Create some companies
        Company::factory(5)->create();

        // Call the PermissionSeeder to create additional permissions
        $this->call([
            PermissionSeeder::class,
            DepartmentSeeder::class,
            PositionSeeder::class,
            LeaveTypeSeeder::class,
        ]);

        // Ensure super_admin has all permissions including the ones from PermissionSeeder
        $superAdmin->assignRole('super_admin');
        $superAdmin->syncPermissions(Permission::all());
    }
}
