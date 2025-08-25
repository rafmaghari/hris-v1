<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class RoleController extends Controller
{
    /**
     * Display a listing of the roles.
     */
    public function index(): Response
    {
        $roles = QueryBuilder::for(Role::class)
            ->allowedFilters([
                AllowedFilter::callback('search', function ($query, $value) {
                    $query->where('name', 'like', "%{$value}%");
                }),
            ])
            ->with('permissions')
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
            'filters' => ['filter' => request()->get('filter') ?? ''],
        ]);
    }

    /**
     * Show the form for creating a new role.
     */
    public function create(): Response
    {

        $permissions = Permission::all();

        return Inertia::render('Roles/Create', [
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(Request $request): RedirectResponse
    {

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles'],
            'permissions' => ['required', 'array'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        $role = Role::create(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions']);

        return redirect()->route('roles.index')
            ->with('success', 'Role created successfully.');
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role): Response
    {

        return Inertia::render('Roles/Show', [
            'role' => $role->load('permissions'),
        ]);
    }

    /**
     * Show the form for editing the specified role.
     */
    public function edit(Role $role): Response
    {

        $permissions = Permission::all();

        return Inertia::render('Roles/Edit', [
            'role' => $role->load('permissions'),
            'permissions' => $permissions,
        ]);
    }

    /**
     * Update the specified role in storage.
     */
    public function update(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name,'.$role->id],
            'permissions' => ['required', 'array'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        $role->update(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions']);

        return redirect()->route('roles.index')
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy(Role $role): RedirectResponse
    {

        if ($role->name === 'admin') {
            return back()->with('error', 'Cannot delete the admin role.');
        }

        $role->delete();

        return redirect()->route('roles.index')
            ->with('success', 'Role deleted successfully.');
    }
}
