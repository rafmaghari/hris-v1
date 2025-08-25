<?php

namespace App\Actions\Menu;

use App\Models\Menu;
use App\Models\Platform;
use App\Models\User;

class CheckMenuPermissionAction
{
    /**
     * Check if a user has permission to access a menu based on assigned permissions.
     */
    public function execute(User $user, Platform $platform, Menu $menu, ?int $companyId = null): bool
    {
        // If menu has no permissions, allow access by default
        if ($menu->permissions->isEmpty()) {
            return true;
        }

        // Get all user permissions for this platform and company
        $userPermissions = [];
        if ($companyId) {
            $userPermissions = $user->getPlatformCompanyPermissions($platform->id, $companyId)
                ->pluck('id')
                ->toArray();
        }

        // Check if user has at least one of the permissions required by the menu
        $menuPermissionIds = $menu->permissions->pluck('id')->toArray();

        return count(array_intersect($userPermissions, $menuPermissionIds)) > 0;
    }
}
