<?php

namespace App\Http\Controllers;

use App\Actions\Menu\GetPlatformMenuTreeAction;
use App\Actions\Menu\UpdateMenuOrderAction;
use App\Actions\Menu\ValidateMenuStructureAction;
use App\Models\Menu;
use App\Models\Platform;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class MenuController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, Platform $platform)
    {
        $menuTree = (new GetPlatformMenuTreeAction)->execute($platform);

        return Inertia::render('MenuBuilder/Index', [
            'menus' => $menuTree,
            'platform' => $platform,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Platform $platform)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => [
                'nullable',
                Rule::exists('menus', 'id')->where(function ($query) use ($platform) {
                    return $query->where('platform_id', $platform->id);
                }),
            ],
            'icon' => 'nullable|string|max:255',
            'url' => 'nullable|string|max:255',
            'route' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        // Validate menu structure
        if (isset($validated['parent_id'])) {
            $parentMenu = Menu::find($validated['parent_id']);
            if (! (new ValidateMenuStructureAction)->execute(new Menu, $validated['parent_id'])) {
                return redirect()->back()->with('error', 'Cannot create menu due to maximum nesting level reached or circular reference');
            }
        }

        $validated['platform_id'] = $platform->id;
        $validated['slug'] = Str::slug($validated['name']);

        $menu = Menu::create($validated);

        // Assign permissions if provided
        if (isset($validated['permissions']) && ! empty($validated['permissions'])) {
            $menu->permissions()->sync($validated['permissions']);
        }

        return redirect()->route('menu-builder.edit', $platform)->with('success', 'Menu created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Platform $platform, Menu $menu)
    {
        if ($menu->platform_id !== $platform->id) {
            abort(404);
        }

        return Inertia::render('MenuBuilder/Show', [
            'menu' => $menu->load(['parent', 'children', 'permissions']),
            'platform' => $platform,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Platform $platform, Menu $menu)
    {
        if ($menu->platform_id !== $platform->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'parent_id' => [
                'nullable',
                Rule::exists('menus', 'id')->where(function ($query) use ($platform, $menu) {
                    return $query->where('platform_id', $platform->id)
                        ->where('id', '!=', $menu->id); // Prevent self-reference
                }),
            ],
            'icon' => 'nullable|string|max:255',
            'url' => 'nullable|string|max:255',
            'route' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Validate menu structure
        if (isset($validated['parent_id']) && ! (new ValidateMenuStructureAction)->execute($menu, $validated['parent_id'])) {
            return redirect()->back()->with('error', 'Cannot update menu due to maximum nesting level reached or circular reference');
        }

        $menu->update($validated);

        // Update permissions if provided
        if (isset($validated['permissions'])) {
            $menu->permissions()->sync($validated['permissions']);
        }

        return redirect()->route('menu-builder.edit', $platform)->with('success', 'Menu updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Platform $platform, Menu $menu)
    {
        if ($menu->platform_id !== $platform->id) {
            abort(404);
        }

        // First get all child menus
        $childMenus = Menu::where('parent_id', $menu->id)->get();

        // Update all child menus to have the parent of the current menu
        foreach ($childMenus as $childMenu) {
            $childMenu->update(['parent_id' => $menu->parent_id]);
        }

        $menu->delete();

        return redirect()->route('menu-builder.edit', $platform)->with('success', 'Menu deleted successfully');
    }

    /**
     * Update the order of menus.
     */
    public function updateOrder(Request $request, Platform $platform)
    {
        $validated = $request->validate([
            'menus' => 'required|array',
            'menus.*.id' => [
                'required',
                'integer',
                Rule::exists('menus', 'id')->where(function ($query) use ($platform) {
                    return $query->where('platform_id', $platform->id);
                }),
            ],
            'menus.*.order' => 'required|integer',
        ]);

        (new UpdateMenuOrderAction)->execute($platform, $validated['menus']);

        return redirect()->route('menu-builder.edit', $platform)->with('success', 'Menu order updated successfully');
    }
}
