<?php

namespace App\Http\Controllers;

use App\Actions\Menu\GetPlatformMenuTreeAction;
use App\Models\Permission;
use App\Models\Platform;
use Inertia\Inertia;

class MenuBuilderController extends Controller
{
    /**
     * Display a listing of platforms for menu building.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $platforms = Platform::where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('MenuBuilder/Index', [
            'platforms' => $platforms,
        ]);
    }

    /**
     * Display the menu builder for a specific platform.
     *
     * @return \Inertia\Response
     */
    public function edit(Platform $platform)
    {
        $menuTree = (new GetPlatformMenuTreeAction)->execute($platform);
        $permissions = Permission::orderBy('name')->get();

        return Inertia::render('MenuBuilder/Edit', [
            'platform' => $platform,
            'menuTree' => $menuTree,
            'permissions' => $permissions,
        ]);
    }
}
