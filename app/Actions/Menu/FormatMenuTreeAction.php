<?php

namespace App\Actions\Menu;

use Illuminate\Database\Eloquent\Collection;

class FormatMenuTreeAction
{
    /**
     * Execute the action.
     *
     * @return array
     */
    public function execute(Collection $menus)
    {
        $result = [];

        foreach ($menus as $menu) {
            $menuData = [
                'id' => $menu->id,
                'name' => $menu->name,
                'slug' => $menu->slug,
                'icon' => $menu->icon,
                'url' => $menu->url,
                'route' => $menu->route,
                'order' => $menu->order,
                'is_active' => $menu->is_active,
            ];

            // Include permissions if they exist
            if ($menu->permissions) {
                $menuData['permissions'] = $menu->permissions;
            }

            if ($menu->children && $menu->children->count() > 0) {
                $menuData['children'] = $this->execute($menu->children);
            }

            $result[] = $menuData;
        }

        return $result;
    }
}
