<?php

namespace App\Actions\Menu;

use App\Models\Platform;
use App\Models\User;

class GetAuthorizedMenusAction
{
    /**
     * Get authorized menus for a user based on their permissions.
     */
    public function execute(User $user, Platform $platform, ?int $companyId = null): array
    {
        $allMenus = $platform->menus()
            ->active()
            ->with(['children' => function ($query) {
                $query->active()->ordered()->with('permissions');
            }, 'permissions'])
            ->root()
            ->ordered()
            ->get();

        $checkPermission = new CheckMenuPermissionAction;

        // Filter top-level menus
        $authorizedMenus = $allMenus->filter(function ($menu) use ($user, $platform, $companyId, $checkPermission) {
            return $checkPermission->execute($user, $platform, $menu, $companyId);
        });

        // Filter child menus
        foreach ($authorizedMenus as $menu) {
            if ($menu->children && $menu->children->isNotEmpty()) {
                $menu->children = $menu->children->filter(function ($childMenu) use ($user, $platform, $companyId, $checkPermission) {
                    return $checkPermission->execute($user, $platform, $childMenu, $companyId);
                });
            }
        }

        return (new FormatMenuTreeAction)->execute($authorizedMenus);
    }
}
