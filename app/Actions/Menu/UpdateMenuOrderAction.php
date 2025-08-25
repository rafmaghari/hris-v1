<?php

namespace App\Actions\Menu;

use App\Models\Menu;
use App\Models\Platform;

class UpdateMenuOrderAction
{
    /**
     * Execute the action.
     *
     * @return void
     */
    public function execute(Platform $platform, array $menuData)
    {
        foreach ($menuData as $menu) {
            Menu::where('id', $menu['id'])
                ->where('platform_id', $platform->id)
                ->update(['order' => $menu['order']]);
        }
    }
}
