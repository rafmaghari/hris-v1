<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Platform;
use App\Models\PlatformCompanyUserPermission;
use App\Models\PlatformCompanyUserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserPlatformCompanyRolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // This seeder assumes PlatformSeeder and RolesAndPermissionsSeeder have been run

        // 1. Create additional platforms if necessary (using ones from PlatformSeeder if available)
        $additionalPlatforms = [
            [
                'name' => 'Sales Platform',
                'slug' => 'sales',
                'description' => 'Platform for sales management',
                'url' => '/sales',
                'is_active' => true,
            ],
            [
                'name' => 'Customer Support',
                'slug' => 'support',
                'description' => 'Platform for customer support',
                'url' => '/support',
                'is_active' => true,
            ],
        ];

        foreach ($additionalPlatforms as $platformData) {
            Platform::firstOrCreate(
                ['slug' => $platformData['slug']],
                $platformData
            );
        }

        // Get all existing platforms for our use
        $platforms = Platform::all();

        // 2. Create companies if they don't exist
        $companies = [
            [
                'name' => 'Acme Corporation',
                'type' => Company::TYPE_DEALER,
                'domain' => 'acme.com',
                'description' => 'A sample dealer company',
            ],
            [
                'name' => 'TechGiant Manufacturing',
                'type' => Company::TYPE_MANUFACTURER,
                'domain' => 'techgiant.com',
                'description' => 'A sample manufacturer company',
            ],
        ];

        foreach ($companies as $companyData) {
            Company::firstOrCreate(
                ['domain' => $companyData['domain']],
                $companyData
            );
        }

        // 3. Add additional roles if they don't exist yet (will use existing ones from RolesAndPermissionsSeeder)
        $additionalRoles = [
            'company_admin' => 'Manage company settings and users',
            'staff' => 'Regular staff member',
        ];

        foreach ($additionalRoles as $roleName => $roleDescription) {
            Role::firstOrCreate(['name' => $roleName], [
                'name' => $roleName,
                'guard_name' => 'web',
            ]);
        }

        // Get all roles for our use
        $roles = Role::all();

        // 4. Add any missing permissions needed for platform-company-user relationships
        $additionalPermissions = [
            'view_dashboard' => 'Can view dashboard',
            'edit_profile' => 'Can edit profile',
            'manage_content' => 'Can manage content',
            'admin_access' => 'Full admin access',
            'platform_management' => 'Can manage platform settings',
            'view_user_list' => 'Can view list of users',
        ];

        foreach ($additionalPermissions as $permName => $permDescription) {
            Permission::firstOrCreate(['name' => $permName], [
                'name' => $permName,
                'guard_name' => 'web',
            ]);
        }

        // Get all permissions for our use
        $allPermissions = Permission::all();

        // 5. Create test users with:
        // - Direct roles and permissions
        // - Platform->company->role->permission relationships
        $testUsers = [
            [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'john.doe@example.com',
                'password' => 'password',
                'direct_roles' => ['admin'],
                'direct_permissions' => ['view_dashboard', 'edit_profile'],
                'platforms' => ['sales', 'listing'],
                'company' => 'acme.com',
                'platform_role' => 'company_admin',
                'platform_permissions' => ['view_dashboard', 'manage users', 'edit_profile', 'view reports', 'manage_content'],
            ],
            [
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'email' => 'jane.smith@example.com',
                'password' => 'password',
                'direct_roles' => ['manager'],
                'direct_permissions' => ['view_dashboard'],
                'platforms' => ['support', 'basecamp'],
                'company' => 'techgiant.com',
                'platform_role' => 'manager',
                'platform_permissions' => ['view_dashboard', 'edit_profile', 'view reports', 'manage_content'],
            ],
            [
                'first_name' => 'Mike',
                'last_name' => 'Johnson',
                'email' => 'mike.johnson@example.com',
                'password' => 'password',
                'direct_roles' => ['user'],
                'direct_permissions' => ['edit_profile'],
                'platforms' => ['sales', 'inventory'],
                'company' => 'techgiant.com',
                'platform_role' => 'staff',
                'platform_permissions' => ['view_dashboard', 'edit_profile'],
            ],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Admin',
                'email' => 'sarah.admin@example.com',
                'password' => 'password',
                'direct_roles' => ['admin', 'manager'],
                'direct_permissions' => ['admin_access', 'platform_management', 'manage users'],
                'platforms' => ['sales', 'warranty', 'basecamp'],
                'company' => 'acme.com',
                'platform_role' => 'admin',
                'platform_permissions' => ['view_dashboard', 'manage users', 'edit_profile', 'view reports', 'manage_content', 'admin_access', 'platform_management'],
            ],
            [
                'first_name' => 'Tom',
                'last_name' => 'User',
                'email' => 'tom.user@example.com',
                'password' => 'password',
                'direct_roles' => ['user'],
                'direct_permissions' => ['view_dashboard'],
                'platforms' => ['support'],
                'company' => 'acme.com',
                'platform_role' => 'user',
                'platform_permissions' => ['view_dashboard', 'edit_profile', 'view users'],
            ],
            [
                'first_name' => 'Lisa',
                'last_name' => 'Regular',
                'email' => 'lisa.regular@example.com',
                'password' => 'password',
                'direct_roles' => ['user'],
                'direct_permissions' => ['view_dashboard', 'edit_profile'],
                'platforms' => ['sales', 'listing'],
                'company' => 'techgiant.com',
                'platform_role' => 'user',
                'platform_permissions' => ['view_dashboard', 'edit_profile'],
            ],
        ];

        foreach ($testUsers as $userData) {
            // Create or get the user
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'first_name' => $userData['first_name'],
                    'last_name' => $userData['last_name'],
                    'password' => Hash::make($userData['password']),
                    'system_user_id' => 'system|'.Str::random(20),
                ]
            );

            // 1. Assign direct roles to user (globally, not tied to platform-company)
            foreach ($userData['direct_roles'] as $roleName) {
                $role = Role::where('name', $roleName)->first();
                if ($role) {
                    $user->assignRole($role);
                }
            }

            // 2. Assign direct permissions to user (globally, not tied to platform-company)
            foreach ($userData['direct_permissions'] as $permissionName) {
                $permission = Permission::where('name', $permissionName)->first();
                if ($permission) {
                    $user->givePermissionTo($permission);
                }
            }

            // 3. Handle platform-company-user role and permissions
            $company = Company::where('domain', $userData['company'])->first();
            $platformRole = Role::where('name', $userData['platform_role'])->first();

            if ($company && $platformRole) {
                // For each platform the user has access to
                foreach ($userData['platforms'] as $platformSlug) {
                    $platform = Platform::where('slug', $platformSlug)->first();

                    if ($platform) {
                        // Connect user to platform and company with role
                        PlatformCompanyUserRole::updateOrCreate(
                            [
                                'platform_id' => $platform->id,
                                'company_id' => $company->id,
                                'user_id' => $user->id,
                                'role_id' => $platformRole->id,
                            ]
                        );

                        // Associate platform and company (if not already)
                        if (! $platform->companies->contains($company->id)) {
                            $platform->companies()->attach($company->id);
                        }

                        // Assign permissions to the user for this platform and company
                        foreach ($userData['platform_permissions'] as $permissionName) {
                            $permission = Permission::where('name', $permissionName)->first();
                            if ($permission) {
                                PlatformCompanyUserPermission::updateOrCreate(
                                    [
                                        'platform_id' => $platform->id,
                                        'company_id' => $company->id,
                                        'user_id' => $user->id,
                                        'permission_id' => $permission->id,
                                    ]
                                );
                            }
                        }
                    }
                }

                // Set the selected platform and company for the user (using first platform in the list)
                $defaultPlatformSlug = $userData['platforms'][0];
                $defaultPlatform = Platform::where('slug', $defaultPlatformSlug)->first();

                if ($defaultPlatform) {
                    $user->update([
                        'selected_platform_id' => $defaultPlatform->id,
                        'selected_company_id' => $company->id,
                    ]);
                }
            }
        }

        // 6. Add platform access for default users created in DatabaseSeeder
        $this->addPlatformAccessForDefaultUsers();

        // 7. Run the PlatformMenuSeeder to create menus for all platforms
        $this->call(PlatformMenuSeeder::class);
    }

    /**
     * Add platform access for the default users created in DatabaseSeeder
     */
    private function addPlatformAccessForDefaultUsers(): void
    {
        // Get reference data
        $firstCompany = Company::first();

        if (! $firstCompany) {
            return;
        }

        // Default platform access configurations
        $defaultUserAccess = [
            'admin@example.com' => [
                'platforms' => ['listing', 'basecamp', 'warranty', 'inventory', 'sales', 'support'],
                'role' => 'admin',
                'permissions' => ['view_dashboard', 'manage users', 'edit_profile', 'view reports', 'manage_content', 'admin_access', 'platform_management'],
            ],
            'user@example.com' => [
                'platforms' => ['listing', 'basecamp'],
                'role' => 'user',
                'permissions' => ['view_dashboard', 'edit_profile'],
            ],
        ];

        // Process each default user
        foreach ($defaultUserAccess as $email => $access) {
            $user = User::where('email', $email)->first();

            if (! $user) {
                continue;
            }

            $role = Role::where('name', $access['role'])->first();

            if (! $role) {
                continue;
            }

            // For each platform, create the necessary relationships
            foreach ($access['platforms'] as $platformSlug) {
                $platform = Platform::where('slug', $platformSlug)->first();

                if (! $platform) {
                    continue;
                }

                // Associate platform and company
                if (! $platform->companies->contains($firstCompany->id)) {
                    $platform->companies()->attach($firstCompany->id);
                }

                // Connect user to platform and company with role
                PlatformCompanyUserRole::updateOrCreate(
                    [
                        'platform_id' => $platform->id,
                        'company_id' => $firstCompany->id,
                        'user_id' => $user->id,
                        'role_id' => $role->id,
                    ]
                );

                // Assign platform-specific permissions
                foreach ($access['permissions'] as $permissionName) {
                    $permission = Permission::where('name', $permissionName)->first();

                    if ($permission) {
                        PlatformCompanyUserPermission::updateOrCreate(
                            [
                                'platform_id' => $platform->id,
                                'company_id' => $firstCompany->id,
                                'user_id' => $user->id,
                                'permission_id' => $permission->id,
                            ]
                        );
                    }
                }
            }

            // Set default platform and company for the user
            $defaultPlatform = Platform::where('slug', $access['platforms'][0])->first();

            if ($defaultPlatform) {
                $user->update([
                    'selected_platform_id' => $defaultPlatform->id,
                    'selected_company_id' => $firstCompany->id,
                ]);
            }
        }
    }
}
