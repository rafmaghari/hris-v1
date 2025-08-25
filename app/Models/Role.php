<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    /**
     * Get all platform-company-user-role combinations.
     */
    public function platformCompanyUserRoles()
    {
        return $this->hasMany(PlatformCompanyUserRole::class);
    }

    /**
     * Get users with this role for a specific platform and company.
     */
    public function getUsersForPlatformCompany(int $platformId, int $companyId)
    {
        return User::whereHas('platformCompanyUserRoles', function ($query) use ($platformId, $companyId) {
            $query->where('platform_id', $platformId)
                ->where('company_id', $companyId)
                ->where('role_id', $this->id);
        })->get();
    }
}
