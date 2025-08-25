<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Platform extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'url',
        'is_active',
        'secret_key',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($platform) {
            if (empty($platform->secret_key)) {
                $platform->secret_key = 'platform_key_'.Str::random(40);
            }
        });
    }

    /**
     * The companies associated with the platform.
     */
    public function companies(): BelongsToMany
    {
        return $this->belongsToMany(Company::class, 'platform_company')
            ->withTimestamps();
    }

    /**
     * The users associated with the platform through platform_company_user.
     */
    public function basicUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'platform_company_user')
            ->withPivot(['company_id'])
            ->withTimestamps()
            ->distinct();
    }

    /**
     * The users associated with the platform through roles.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'platform_company_user_role')
            ->withPivot(['company_id', 'role_id'])
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
     * Get all menus associated with the platform.
     */
    public function menus(): HasMany
    {
        return $this->hasMany(Menu::class);
    }

    /**
     * Get all root menus associated with the platform.
     */
    public function rootMenus()
    {
        return $this->menus()->whereNull('parent_id')->ordered();
    }

    /**
     * Get users who have this platform selected
     */
    public function selectedByUsers()
    {
        return $this->hasMany(User::class, 'selected_platform_id');
    }
}
