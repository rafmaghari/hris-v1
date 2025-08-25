<?php

namespace App\Actions\User;

use App\Models\PlatformCompanyUserPermission;
use App\Models\PlatformCompanyUserRole;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class GetUserAccessAction
{
    /**
     * Get user's platform company roles
     */
    public function getPlatformCompanyRoles(User $user): array
    {
        // Get all platform-company combinations for this user
        $roles = PlatformCompanyUserRole::with(['platform', 'company', 'role'])
            ->where('user_id', $user->id)
            ->get();

        // Group by company and platform
        return $roles->groupBy(function ($item) {
            return $item->company_id.'-'.$item->platform_id;
        })->map(function (Collection $groupedRoles) {
            // Get the first item to access company and platform info
            $first = $groupedRoles->first();

            return [
                'label' => ucwords($first->platform->name).' - '.ucwords($first->company->name),
                'platform_id' => $first->platform_id,
                'company_id' => $first->company_id,
                'value' => $first->platform_id.'-'.$first->company_id,
                'company_name' => $first->company->name,
                'domain' => $first->company->domain,
                'type' => $first->company->type,
                'roles' => $groupedRoles->pluck('role.name')->toArray(),
            ];
        })->values()->toArray();
    }

    /**
     * Get user's selected role access with permissions
     */
    public function getSelectedRoleAccess(User $user): ?array
    {
        if (! $user->selected_platform_id || ! $user->selected_company_id) {
            return null;
        }

        // Get the roles for the selected platform-company combination
        $roles = Role::whereHas('platformCompanyUserRoles', function ($query) use ($user) {
            $query->where('platform_id', $user->selected_platform_id)
                ->where('company_id', $user->selected_company_id)
                ->where('user_id', $user->id);
        })->with('permissions')->get();

        if ($roles->isEmpty()) {
            return null;
        }

        // Get direct permissions for this platform-company-user combination
        $directPermissions = PlatformCompanyUserPermission::with(['permission'])
            ->where('platform_id', $user->selected_platform_id)
            ->where('company_id', $user->selected_company_id)
            ->where('user_id', $user->id)
            ->get()
            ->pluck('permission.name')
            ->toArray();

        // Get role permissions
        $rolePermissions = $roles->flatMap(function ($role) {
            return $role->permissions->pluck('name')->toArray();
        })->toArray();

        // Combine both permission sets
        $allPermissions = array_unique(array_merge($directPermissions, $rolePermissions));

        return [
            'current_selected_access' => [
                'id' => $user->selected_platform_id.'-'.$user->selected_company_id,
                'platform_id' => $user->selected_platform_id,
                'company_id' => $user->selected_company_id,
                'roles' => $roles->pluck('name')->toArray(),
                'permissions' => $allPermissions,
            ],
            'menus' => $this->getUserMenus($user),
        ];
    }

    /**
     * Get user's selected platform's menus with permissions
     */
    public function getUserMenus(User $user): ?array
    {
        if (! $user->selected_platform_id || ! $user->selected_company_id) {
            return null;
        }

        $platform = \App\Models\Platform::find($user->selected_platform_id);

        if (! $platform) {
            return null;
        }

        // Get menus for the platform
        $menus = $platform->menus()
            ->active()
            ->with([
                'children' => function ($query) {
                    $query->active()->ordered()->with('permissions');
                },
                'permissions',
            ])
            ->root()
            ->ordered()
            ->get();

        // Format the menu tree with platforms as the top level
        $platformNameSlug = Str::slug($platform->name);
        $formattedMenus = [
            $platformNameSlug => [
                'platform_name' => $platform->name,
                'menu' => [],
            ],
        ];

        foreach ($menus as $menu) {
            $menuData = [
                'id' => $menu->id,
                'name' => $menu->name,
                'slug' => $menu->slug,
                'permission' => $menu->permissions->pluck('name')->toArray(),
            ];

            if ($menu->children && $menu->children->count() > 0) {
                $menuData['submenu'] = [];
                foreach ($menu->children as $child) {
                    $menuData['submenu'][$child->slug] = [
                        'id' => $child->id,
                        'name' => $child->name,
                        'slug' => $child->slug,
                        'permission' => $child->permissions->pluck('name')->toArray(),
                    ];
                }
            }

            $formattedMenus[$platformNameSlug]['menu'][$menu->slug] = $menuData;
        }

        return $formattedMenus;
    }

    /**
     * Get all user access information
     */
    public function execute(User $user): array
    {
        return [
            'platform_company_roles' => $this->getPlatformCompanyRoles($user),
            'access' => $this->getSelectedRoleAccess($user),
        ];
    }
}
