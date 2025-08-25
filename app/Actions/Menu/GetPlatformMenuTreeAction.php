<?php

namespace App\Actions\Menu;

use App\Models\Platform;

class GetPlatformMenuTreeAction
{
    /**
     * Execute the action.
     *
     * @return array
     */
    public function execute(Platform $platform)
    {
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

        return (new FormatMenuTreeAction)->execute($menus);
    }
}
