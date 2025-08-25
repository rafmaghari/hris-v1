<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\Platform;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PlatformMenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all platforms
        $platforms = Platform::all();

        // Associate permissions with menus
        $viewDashboardPermission = Permission::where('name', 'view_dashboard')->first();
        $manageUsersPermission = Permission::where('name', 'manage users')->first();
        $viewReportsPermission = Permission::where('name', 'view reports')->first();
        $manageContentPermission = Permission::where('name', 'manage_content')->first();
        $adminAccessPermission = Permission::where('name', 'admin_access')->first();
        $platformManagementPermission = Permission::where('name', 'platform_management')->first();
        $viewUserListPermission = Permission::where('name', 'view_user_list')->first();
        $editProfilePermission = Permission::where('name', 'edit_profile')->first();

        // Define menus for each platform
        $platformMenus = [
            'listing' => [
                [
                    'name' => 'Dashboard',
                    'slug' => 'dashboard',
                    'icon' => 'fa-tachometer-alt',
                    'url' => '/dashboard',
                    'order' => 1,
                    'is_active' => true,
                    'permissions' => [$viewDashboardPermission],
                    'children' => [],
                ],
                [
                    'name' => 'Listings',
                    'slug' => 'listings',
                    'icon' => 'fa-list',
                    'url' => '/listings',
                    'order' => 2,
                    'is_active' => true,
                    'permissions' => [$viewDashboardPermission],
                    'children' => [
                        [
                            'name' => 'All Listings',
                            'slug' => 'all-listings',
                            'icon' => 'fa-list-alt',
                            'url' => '/listings/all',
                            'order' => 1,
                            'is_active' => true,
                            'permissions' => [$viewDashboardPermission],
                        ],
                        [
                            'name' => 'Create Listing',
                            'slug' => 'create-listing',
                            'icon' => 'fa-plus',
                            'url' => '/listings/create',
                            'order' => 2,
                            'is_active' => true,
                            'permissions' => [$manageContentPermission],
                        ],
                    ],
                ],
                [
                    'name' => 'Reports',
                    'slug' => 'reports',
                    'icon' => 'fa-chart-bar',
                    'url' => '/reports',
                    'order' => 3,
                    'is_active' => true,
                    'permissions' => [$viewReportsPermission],
                    'children' => [],
                ],
                [
                    'name' => 'Users',
                    'slug' => 'users',
                    'icon' => 'fa-users',
                    'url' => '/users',
                    'order' => 4,
                    'is_active' => true,
                    'permissions' => [$manageUsersPermission, $viewUserListPermission],
                    'children' => [],
                ],
                [
                    'name' => 'Settings',
                    'slug' => 'settings',
                    'icon' => 'fa-cog',
                    'url' => '/settings',
                    'order' => 5,
                    'is_active' => true,
                    'permissions' => [$adminAccessPermission, $platformManagementPermission],
                    'children' => [],
                ],
            ],
            'sales' => [
                [
                    'name' => 'Dashboard',
                    'slug' => 'dashboard',
                    'icon' => 'fa-tachometer-alt',
                    'url' => '/dashboard',
                    'order' => 1,
                    'is_active' => true,
                    'permissions' => [$viewDashboardPermission],
                    'children' => [],
                ],
                [
                    'name' => 'Sales',
                    'slug' => 'sales',
                    'icon' => 'fa-dollar-sign',
                    'url' => '/sales',
                    'order' => 2,
                    'is_active' => true,
                    'permissions' => [$viewDashboardPermission],
                    'children' => [
                        [
                            'name' => 'New Sale',
                            'slug' => 'new-sale',
                            'icon' => 'fa-plus',
                            'url' => '/sales/new',
                            'order' => 1,
                            'is_active' => true,
                            'permissions' => [$manageContentPermission],
                        ],
                        [
                            'name' => 'Sales History',
                            'slug' => 'sales-history',
                            'icon' => 'fa-history',
                            'url' => '/sales/history',
                            'order' => 2,
                            'is_active' => true,
                            'permissions' => [$viewDashboardPermission],
                        ],
                    ],
                ],
                [
                    'name' => 'Customers',
                    'slug' => 'customers',
                    'icon' => 'fa-users',
                    'url' => '/customers',
                    'order' => 3,
                    'is_active' => true,
                    'permissions' => [$viewDashboardPermission],
                    'children' => [],
                ],
                [
                    'name' => 'Reports',
                    'slug' => 'reports',
                    'icon' => 'fa-chart-bar',
                    'url' => '/reports',
                    'order' => 4,
                    'is_active' => true,
                    'permissions' => [$viewReportsPermission],
                    'children' => [],
                ],
                [
                    'name' => 'Settings',
                    'slug' => 'settings',
                    'icon' => 'fa-cog',
                    'url' => '/settings',
                    'order' => 5,
                    'is_active' => true,
                    'permissions' => [$adminAccessPermission, $platformManagementPermission],
                    'children' => [],
                ],
            ],
            'support' => [
                [
                    'name' => 'Dashboard',
                    'slug' => 'dashboard',
                    'icon' => 'fa-tachometer-alt',
                    'url' => '/dashboard',
                    'order' => 1,
                    'is_active' => true,
                    'permissions' => [$viewDashboardPermission],
                    'children' => [],
                ],
                [
                    'name' => 'Tickets',
                    'slug' => 'tickets',
                    'icon' => 'fa-ticket-alt',
                    'url' => '/tickets',
                    'order' => 2,
                    'is_active' => true,
                    'permissions' => [$viewDashboardPermission],
                    'children' => [
                        [
                            'name' => 'Open Tickets',
                            'slug' => 'open-tickets',
                            'icon' => 'fa-folder-open',
                            'url' => '/tickets/open',
                            'order' => 1,
                            'is_active' => true,
                            'permissions' => [$viewDashboardPermission],
                        ],
                        [
                            'name' => 'Closed Tickets',
                            'slug' => 'closed-tickets',
                            'icon' => 'fa-folder',
                            'url' => '/tickets/closed',
                            'order' => 2,
                            'is_active' => true,
                            'permissions' => [$viewDashboardPermission],
                        ],
                    ],
                ],
                [
                    'name' => 'Knowledge Base',
                    'slug' => 'knowledge-base',
                    'icon' => 'fa-book',
                    'url' => '/knowledge-base',
                    'order' => 3,
                    'is_active' => true,
                    'permissions' => [$viewDashboardPermission],
                    'children' => [],
                ],
                [
                    'name' => 'Reports',
                    'slug' => 'reports',
                    'icon' => 'fa-chart-bar',
                    'url' => '/reports',
                    'order' => 4,
                    'is_active' => true,
                    'permissions' => [$viewReportsPermission],
                    'children' => [],
                ],
                [
                    'name' => 'Settings',
                    'slug' => 'settings',
                    'icon' => 'fa-cog',
                    'url' => '/settings',
                    'order' => 5,
                    'is_active' => true,
                    'permissions' => [$adminAccessPermission, $platformManagementPermission],
                    'children' => [],
                ],
            ],
            'basecamp' => [
                [
                    'name' => 'Dashboard',
                    'slug' => 'dashboard',
                    'icon' => 'fa-tachometer-alt',
                    'url' => '/dashboard',
                    'order' => 1,
                    'is_active' => true,
                    'permissions' => [$viewDashboardPermission],
                    'children' => [],
                ],
                [
                    'name' => 'Projects',
                    'slug' => 'projects',
                    'icon' => 'fa-project-diagram',
                    'url' => '/projects',
                    'order' => 2,
                    'is_active' => true,
                    'permissions' => [$viewDashboardPermission],
                    'children' => [],
                ],
                [
                    'name' => 'Teams',
                    'slug' => 'teams',
                    'icon' => 'fa-users',
                    'url' => '/teams',
                    'order' => 3,
                    'is_active' => true,
                    'permissions' => [$viewDashboardPermission],
                    'children' => [],
                ],
                [
                    'name' => 'Calendar',
                    'slug' => 'calendar',
                    'icon' => 'fa-calendar',
                    'url' => '/calendar',
                    'order' => 4,
                    'is_active' => true,
                    'permissions' => [$viewDashboardPermission],
                    'children' => [],
                ],
                [
                    'name' => 'Settings',
                    'slug' => 'settings',
                    'icon' => 'fa-cog',
                    'url' => '/settings',
                    'order' => 5,
                    'is_active' => true,
                    'permissions' => [$adminAccessPermission, $platformManagementPermission],
                    'children' => [],
                ],
            ],
            'warranty' => [
                [
                    'name' => 'Dashboard',
                    'slug' => 'dashboard',
                    'icon' => 'fa-tachometer-alt',
                    'url' => '/dashboard',
                    'order' => 1,
                    'is_active' => true,
                    'permissions' => [$viewDashboardPermission],
                    'children' => [],
                ],
                [
                    'name' => 'Warranty Claims',
                    'slug' => 'warranty-claims',
                    'icon' => 'fa-file-contract',
                    'url' => '/warranty-claims',
                    'order' => 2,
                    'is_active' => true,
                    'permissions' => [$viewDashboardPermission],
                    'children' => [
                        [
                            'name' => 'New Claim',
                            'slug' => 'new-claim',
                            'icon' => 'fa-plus',
                            'url' => '/warranty-claims/new',
                            'order' => 1,
                            'is_active' => true,
                            'permissions' => [$manageContentPermission],
                        ],
                        [
                            'name' => 'Pending Claims',
                            'slug' => 'pending-claims',
                            'icon' => 'fa-clock',
                            'url' => '/warranty-claims/pending',
                            'order' => 2,
                            'is_active' => true,
                            'permissions' => [$viewDashboardPermission],
                        ],
                        [
                            'name' => 'Approved Claims',
                            'slug' => 'approved-claims',
                            'icon' => 'fa-check',
                            'url' => '/warranty-claims/approved',
                            'order' => 3,
                            'is_active' => true,
                            'permissions' => [$viewDashboardPermission],
                        ],
                    ],
                ],
                [
                    'name' => 'Warranty Products',
                    'slug' => 'warranty-products',
                    'icon' => 'fa-boxes',
                    'url' => '/warranty-products',
                    'order' => 3,
                    'is_active' => true,
                    'permissions' => [$viewDashboardPermission],
                    'children' => [],
                ],
                [
                    'name' => 'Reports',
                    'slug' => 'reports',
                    'icon' => 'fa-chart-bar',
                    'url' => '/reports',
                    'order' => 4,
                    'is_active' => true,
                    'permissions' => [$viewReportsPermission],
                    'children' => [],
                ],
                [
                    'name' => 'Settings',
                    'slug' => 'settings',
                    'icon' => 'fa-cog',
                    'url' => '/settings',
                    'order' => 5,
                    'is_active' => true,
                    'permissions' => [$adminAccessPermission, $platformManagementPermission],
                    'children' => [],
                ],
            ],
            'inventory' => [
                [
                    'name' => 'Dashboard',
                    'slug' => 'dashboard',
                    'icon' => 'fa-tachometer-alt',
                    'url' => '/dashboard',
                    'order' => 1,
                    'is_active' => true,
                    'permissions' => [$viewDashboardPermission],
                    'children' => [],
                ],
                [
                    'name' => 'Products',
                    'slug' => 'products',
                    'icon' => 'fa-boxes',
                    'url' => '/products',
                    'order' => 2,
                    'is_active' => true,
                    'permissions' => [$viewDashboardPermission],
                    'children' => [
                        [
                            'name' => 'All Products',
                            'slug' => 'all-products',
                            'icon' => 'fa-list',
                            'url' => '/products/all',
                            'order' => 1,
                            'is_active' => true,
                            'permissions' => [$viewDashboardPermission],
                        ],
                        [
                            'name' => 'Add Product',
                            'slug' => 'add-product',
                            'icon' => 'fa-plus',
                            'url' => '/products/add',
                            'order' => 2,
                            'is_active' => true,
                            'permissions' => [$manageContentPermission],
                        ],
                    ],
                ],
                [
                    'name' => 'Stock Management',
                    'slug' => 'stock-management',
                    'icon' => 'fa-warehouse',
                    'url' => '/stock',
                    'order' => 3,
                    'is_active' => true,
                    'permissions' => [$viewDashboardPermission],
                    'children' => [],
                ],
                [
                    'name' => 'Reports',
                    'slug' => 'reports',
                    'icon' => 'fa-chart-bar',
                    'url' => '/reports',
                    'order' => 4,
                    'is_active' => true,
                    'permissions' => [$viewReportsPermission],
                    'children' => [],
                ],
                [
                    'name' => 'Settings',
                    'slug' => 'settings',
                    'icon' => 'fa-cog',
                    'url' => '/settings',
                    'order' => 5,
                    'is_active' => true,
                    'permissions' => [$adminAccessPermission, $platformManagementPermission],
                    'children' => [],
                ],
            ],
        ];

        // For each platform, create its menus
        foreach ($platforms as $platform) {
            // Skip if platform doesn't have defined menus
            if (! isset($platformMenus[$platform->slug])) {
                continue;
            }

            // Process each menu
            foreach ($platformMenus[$platform->slug] as $menuData) {
                $this->createMenuWithChildren($platform, null, $menuData);
            }
        }
    }

    /**
     * Create a menu and its children recursively
     */
    private function createMenuWithChildren(Platform $platform, ?Menu $parentMenu, array $menuData): void
    {
        // Create the menu
        $menu = Menu::updateOrCreate(
            [
                'platform_id' => $platform->id,
                'parent_id' => $parentMenu ? $parentMenu->id : null,
                'slug' => $menuData['slug'],
            ],
            [
                'name' => $menuData['name'],
                'icon' => $menuData['icon'],
                'url' => $menuData['url'],
                'order' => $menuData['order'],
                'is_active' => $menuData['is_active'],
            ]
        );

        // Attach permissions to the menu
        if (isset($menuData['permissions']) && ! empty($menuData['permissions'])) {
            $permissionIds = collect($menuData['permissions'])->filter()->pluck('id')->toArray();
            $menu->permissions()->sync($permissionIds);
        }

        // Create children if any
        if (isset($menuData['children']) && ! empty($menuData['children'])) {
            foreach ($menuData['children'] as $childMenuData) {
                $this->createMenuWithChildren($platform, $menu, $childMenuData);
            }
        }
    }
}
