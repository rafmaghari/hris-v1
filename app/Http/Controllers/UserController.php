<?php
namespace App\Http\Controllers;

use App\Enums\EmploymentType;
use App\Enums\Status;
use App\Http\Requests\UserRequest;
use App\Models\Company;
use App\Models\Department;
use App\Models\Platform;
use App\Models\Position;
use App\Models\User;
use App\Queries\UserRolePermissionQuery;
use App\Utils\Constant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Users/Index', [
            'users'   => UserRolePermissionQuery::getUsersWithRoles(),
            'filters' => ['filter' => request()->get('filter') ?? ''],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Users/Create', [
            'roles'           => Role::all(),
            'positions'       => Position::select('id', 'name')->get(),
            'departments'     => Department::select('id', 'name')->get(),
            'managers'        => User::select('id', 'first_name', 'last_name')
                ->whereHas('roles', function ($query) {
                    $query->where('name', 'like', '%manager%');
                })
                ->get()
                ->map(function ($user) {
                    return [
                        'id'   => $user->id,
                        'name' => $user->name,
                    ];
                }),
            'employmentTypes' => collect(EmploymentType::cases())->map(function ($type) {
                return [
                    'value' => $type->value,
                    'label' => ucfirst($type->value),
                ];
            }),
            'statuses'        => collect(Status::cases())->map(function ($status) {
                return [
                    'value' => $status->value,
                    'label' => ucfirst($status->label()),
                ];
            }),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserRequest $request): RedirectResponse
    {
        $validated             = $request->validated();
        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        if ($request->has('roles')) {
            $user->syncRoles($request->roles);
        }

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user): Response
    {
        $platforms   = Platform::select('id', 'name')->get();
        $companies   = Company::select('id', 'name')->get();
        $roles       = Role::select('id', 'name')->where('name', '!=', Constant::SUPER_ADMIN_ROLE)->get();
        $permissions = Permission::select('id', 'name')->get();
        $positions   = Position::select('id', 'name')->get();
        $departments = Department::select('id', 'name')->get();
        $managers    = User::select('id', 'first_name', 'last_name')
            ->whereHas('roles', function ($query) {
                $query->where('name', 'like', '%manager%');
            })
            ->where('id', '!=', $user->id)
            ->get()
            ->map(function ($manager) {
                return [
                    'id'   => $manager->id,
                    'name' => $manager->name,
                ];
            });

        // Add roles to user data
        $userData          = $user->toArray();
        $userData['roles'] = $user->roles->pluck('id')->toArray();

        return Inertia::render('Users/Edit', [
            'user'                             => $userData,
            'platforms'                        => $platforms,
            'companies'                        => $companies,
            'roles'                            => $roles,
            'permissions'                      => $permissions,
            'positions'                        => $positions,
            'departments'                      => $departments,
            'managers'                         => $managers,
            'employmentTypes'                  => collect(EmploymentType::cases())->map(function ($type) {
                return [
                    'value' => $type->value,
                    'label' => ucfirst($type->value),
                ];
            }),
            'statuses'                         => collect(Status::cases())->map(function ($status) {
                return [
                    'value' => $status->value,
                    'label' => ucfirst($status->label()),
                ];
            }),
            'userRolesByPlatformCompany'       => UserRolePermissionQuery::getUserPlatformCompanyRoles($user),
            'userPermissionsByPlatformCompany' => UserRolePermissionQuery::getUserPlatformCompanyPermissions($user),
            'userDirectRoles'                  => $user->roles->pluck('id')->toArray(),
            'userDirectPermissions'            => $user->permissions->pluck('id')->toArray(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        if (isset($validated['password']) && ! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        if ($request->has('roles')) {
            $user->syncRoles($request->roles);
        }

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        if (auth()->id() === $user->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Update user's direct roles and permissions.
     */
    public function updateDirectAccess(Request $request, User $user)
    {
        $validated = $request->validate([
            'role_ids'         => ['required', 'array'],
            'role_ids.*'       => ['exists:roles,id'],
            'permission_ids'   => ['required', 'array'],
            'permission_ids.*' => ['exists:permissions,id'],
        ]);

        try {
            DB::beginTransaction();

            // Get role and permission models
            $roles       = Role::whereIn('id', $validated['role_ids'])->get();
            $permissions = Permission::whereIn('id', $validated['permission_ids'])->get();

            // Sync roles and permissions using Spatie methods
            $user->syncRoles($roles);
            $user->syncPermissions($permissions);

            DB::commit();

            if ($request->wantsJson()) {
                return response()->json(['success' => true, 'message' => 'Direct access updated successfully']);
            }

            return redirect()->back()->with('success', 'Direct access updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();

            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => 'Failed to update direct access: ' . $e->getMessage()], 500);
            }

            return redirect()->back()->with('error', 'Failed to update direct access: ' . $e->getMessage());
        }
    }
}
