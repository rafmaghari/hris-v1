<?php

namespace App\Queries;

use App\Models\User;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class UserRolePermissionQuery
{
    /**
     * Get users with their roles, filtered and paginated
     */
    public static function getUsersWithRoles()
    {
        return QueryBuilder::for(User::class)
            ->allowedFilters([
                AllowedFilter::callback('search', function ($query, $value) {
                    $query->where('first_name', 'like', "%{$value}%")
                        ->orWhere('last_name', 'like', "%{$value}%")
                        ->orWhere('email', 'like', "%{$value}%");
                }),
            ])
            ->with(['roles', 'manager'])
            ->select(['users.*'])
            ->selectRaw("CONCAT(users.first_name, ' ', users.last_name) as name")
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'name' => $user->name,
                    'manager' => $user->manager ? [
                        'id' => $user->manager->id,
                        'name' => $user->manager->first_name . ' ' . $user->manager->last_name,
                    ] : null,
                    'roles' => $user->roles->map(function ($role) {
                        return [
                            'id' => $role->id,
                            'name' => $role->name,
                        ];
                    }),
                ];
            })
            ->withQueryString();
    }

    /**
     * Get user's roles grouped by platform-company
     */
    public static function getUserPlatformCompanyRoles(User $user): array
    {
        return $user->platformCompanyUserRoles()
            ->get(['platform_id', 'company_id', 'role_id'])
            ->groupBy(function ($item) {
                return $item->platform_id.'-'.$item->company_id;
            })
            ->map(function ($items) {
                return $items->pluck('role_id')->map(function ($id) {
                    return (int) $id;
                })->toArray();
            })
            ->sortKeysDesc()
            ->toArray();
    }

    /**
     * Get user's permissions grouped by platform-company
     */
    public static function getUserPlatformCompanyPermissions(User $user): array
    {
        return $user->platformCompanyUserPermissions()
            ->get(['platform_id', 'company_id', 'permission_id'])
            ->groupBy(function ($item) {
                return $item->platform_id.'-'.$item->company_id;
            })
            ->map(function ($items) {
                return $items->pluck('permission_id')->map(function ($id) {
                    return (int) $id;
                })->toArray();
            })
            ->toArray();
    }

    /**
     * Get all platform-company access for a user
     */
    public static function getAllPlatformCompanyAccess(User $user): array
    {
        return [
            'roles' => self::getUserPlatformCompanyRoles($user),
            'permissions' => self::getUserPlatformCompanyPermissions($user),
        ];
    }
}
