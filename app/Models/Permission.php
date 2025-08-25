<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Permission\Models\Permission as SpatiePermission;

class Permission extends SpatiePermission
{
    /**
     * Get all platform-company-user-permission combinations.
     */
    public function platformCompanyUserPermissions()
    {
        return $this->hasMany(PlatformCompanyUserPermission::class);
    }

    /**
     * Get users with this permission for a specific platform and company.
     */
    public function getUsersForPlatformCompany(int $platformId, int $companyId)
    {
        return User::whereHas('platformCompanyUserPermissions', function ($query) use ($platformId, $companyId) {
            $query->where('platform_id', $platformId)
                ->where('company_id', $companyId)
                ->where('permission_id', $this->id);
        })->get();
    }

    /**
     * Get the menus associated with the permission.
     */
    public function menus(): BelongsToMany
    {
        return $this->belongsToMany(Menu::class);
    }
}
