<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define basic permissions
        $permissions = [
            'view dashboard',
            'manage users',
            'create users',
            'edit users',
            'delete users',
            'manage roles',
            'create roles',
            'edit roles',
            'delete roles',
            'manage permissions',
            'create permissions',
            'edit permissions',
            'delete permissions',
            'manage settings',
            'view reports',
            'manage menu',
            'manage departments',
            'create departments',
            'edit departments',
            'delete departments',
            'view departments',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }
    }
}
