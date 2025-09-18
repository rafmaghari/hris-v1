<?php
namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\EmploymentType;
use App\Enums\Status;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements HasMedia, JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasRoles, InteractsWithMedia, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'system_user_id',
        'selected_platform_id',
        'selected_company_id',
        'position_id',
        'department_id',
        'manager_id',
        'date_hired',
        'employment_type',
        'status',
        'end_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'date_hired'        => 'date',
            'end_at'            => 'date',
            'employment_type'   => EmploymentType::class,
            'status'            => Status::class,
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (empty($user->system_user_id)) {
                $user->system_user_id = 'system|' . Str::random(20);
            }
        });
    }

    /**
     * Get the user's full name.
     *
     * @return string
     */
    public function getNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Register media collections for the model.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')
            ->singleFile()
            ->registerMediaConversions(function (Media $media) {
                $this->addMediaConversion('thumb')
                    ->width(100)
                    ->height(100)
                    ->nonQueued();

                $this->addMediaConversion('medium')
                    ->width(300)
                    ->height(300)
                    ->nonQueued();
            });
    }

    /**
     * Get user avatar URL.
     */
    public function getAvatarUrlAttribute(): string
    {
        return $this->getFirstMediaUrl('avatar') ?: 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&color=7F9CF5&background=EBF4FF';
    }

    /**
     * Get user avatar thumbnail URL.
     */
    public function getAvatarThumbUrlAttribute(): string
    {
        return $this->getFirstMediaUrl('avatar', 'thumb') ?: 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&color=7F9CF5&background=EBF4FF&size=100';
    }

    /**
     * The platforms associated with this user.
     */
    public function platforms(): BelongsToMany
    {
        return $this->belongsToMany(Platform::class, 'platform_company_user_role')
            ->withPivot(['company_id', 'role_id'])
            ->withTimestamps()
            ->distinct();
    }

    /**
     * The companies associated with this user.
     */
    public function companies(): BelongsToMany
    {
        return $this->belongsToMany(Company::class, 'platform_company_user_role')
            ->withPivot(['platform_id', 'role_id'])
            ->withTimestamps()
            ->distinct();
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
     * Get selected platform relationship
     */
    public function selectedPlatform()
    {
        return $this->belongsTo(Platform::class, 'selected_platform_id');
    }

    /**
     * Get selected company relationship
     */
    public function selectedCompany()
    {
        return $this->belongsTo(Company::class, 'selected_company_id');
    }

    /**
     * Get roles for a specific platform and company.
     */
    public function getPlatformCompanyRoles(int $platformId, int $companyId)
    {
        return Role::whereHas('platformCompanyUserRoles', function ($query) use ($platformId, $companyId) {
            $query->where('platform_id', $platformId)
                ->where('company_id', $companyId)
                ->where('user_id', $this->id);
        })->get();
    }

    /**
     * Get permissions for a specific platform and company.
     */
    public function getPlatformCompanyPermissions(int $platformId, int $companyId)
    {
        return Permission::whereHas('platformCompanyUserPermissions', function ($query) use ($platformId, $companyId) {
            $query->where('platform_id', $platformId)
                ->where('company_id', $companyId)
                ->where('user_id', $this->id);
        })->get();
    }

    /**
     * Get the position that owns the user.
     */
    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    /**
     * Get the department that owns the user.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the manager that owns the user.
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get the users managed by this user.
     */
    public function managedUsers()
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    /**
     * Get the users managed by this user.
     */
    public function subordinates(): HasMany
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    /**
     * Get the leave settings for this user.
     */
    public function leaveSettings(): HasMany
    {
        return $this->hasMany(UserLeaveSetting::class);
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }
}
