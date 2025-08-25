<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Company extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Company type constants
     */
    const TYPE_DEALER = 'DEALER';

    const TYPE_MANUFACTURER = 'MANUFACTURER';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'type',
        'domain',
        'description',
        'caravea_company_id',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($company) {
            if (empty($company->caravea_company_id)) {
                $company->caravea_company_id = 'caraveacomp|'.Str::random(20);
            }

            if (empty($company->slug)) {
                $company->slug = Str::slug($company->name);
            }
        });
    }

    /**
     * The platforms associated with the company.
     */
    public function platforms(): BelongsToMany
    {
        return $this->belongsToMany(Platform::class, 'platform_company')
            ->withTimestamps();
    }

    /**
     * The users associated with the company through platform_company_user.
     */
    public function basicUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'platform_company_user')
            ->withPivot(['platform_id'])
            ->withTimestamps()
            ->distinct();
    }

    /**
     * The users associated with the company through roles.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'platform_company_user_role')
            ->withPivot(['platform_id', 'role_id'])
            ->withTimestamps()
            ->distinct();
    }

    /**
     * Get all platform-company-user combinations.
     */
    public function platformCompanyUsers()
    {
        return $this->hasMany(PlatformCompanyUser::class);
    }

    /**
     * Get all platform-company-user-role combinations.
     */
    public function platformCompanyUserRoles()
    {
        return $this->hasMany(PlatformCompanyUserRole::class);
    }

    /**
     * Get all platform-company-user-permission combinations.
     */
    public function platformCompanyUserPermissions()
    {
        return $this->hasMany(PlatformCompanyUserPermission::class);
    }

    /**
     * Get users who have this company selected
     */
    public function selectedByUsers()
    {
        return $this->hasMany(User::class, 'selected_company_id');
    }
}
