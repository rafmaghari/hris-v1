<?php

namespace App\Actions\Menu;

use App\Models\Menu;

class ValidateMenuStructureAction
{
    /**
     * Execute the action.
     *
     * @return bool
     */
    public function execute(Menu $menu, ?int $newParentId = null)
    {
        // Check for circular references
        if ($newParentId && $this->wouldCreateCircular($menu, $newParentId)) {
            return false;
        }

        // Check maximum depth (limit to 3 levels: menu -> submenu -> submenu)
        if ($newParentId) {
            $depth = $this->calculateMenuDepth($newParentId);
            if ($depth >= 2) { // 0-indexed, so 2 means already at the third level
                return false;
            }
        }

        return true;
    }

    /**
     * Calculate the depth of a menu.
     *
     * @return int
     */
    private function calculateMenuDepth(int $menuId)
    {
        $menu = Menu::find($menuId);
        $depth = 0;

        while ($menu && $menu->parent_id) {
            $depth++;
            $menu = $menu->parent;
        }

        return $depth;
    }

    /**
     * Check if setting a new parent would create a circular reference.
     *
     * @return bool
     */
    private function wouldCreateCircular(Menu $menu, int $newParentId)
    {
        if ($menu->id == $newParentId) {
            return true;
        }

        $parent = Menu::find($newParentId);

        while ($parent) {
            if ($parent->id == $menu->id) {
                return true;
            }

            $parent = $parent->parent;
        }

        return false;
    }
}
