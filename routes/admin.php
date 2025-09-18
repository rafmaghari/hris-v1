<?php

use App\Http\Controllers\CompanyController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\LeaveSettingsTemplateController;
use App\Http\Controllers\LeaveTypeController;
use App\Http\Controllers\MenuBuilderController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PlatformController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Admin routes with caravea_admin role
Route::prefix('admin')->middleware(['auth', 'verified', 'role:super_admin'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('admin.dashboard');

    // Platform Menu Routes
    Route::get('/platforms/{platform}/menus', [MenuController::class, 'index'])
        ->name('platforms.menus.index');
    Route::post('/platforms/{platform}/menus', [MenuController::class, 'store'])
        ->name('platforms.menus.store');
    Route::get('/platforms/{platform}/menus/{menu}', [MenuController::class, 'show'])
        ->name('platforms.menus.show');
    Route::put('/platforms/{platform}/menus/{menu}', [MenuController::class, 'update'])
        ->name('platforms.menus.update');
    Route::delete('/platforms/{platform}/menus/{menu}', [MenuController::class, 'destroy'])
        ->name('platforms.menus.destroy');
    Route::post('/platforms/{platform}/menus/order', [MenuController::class, 'updateOrder'])
        ->name('platforms.menus.update-order');
    Route::resource('platforms', PlatformController::class);
    Route::resource('companies', CompanyController::class);
    Route::resource('roles', RoleController::class);
    Route::resource('permissions', PermissionController::class);
    Route::resource('positions', PositionController::class);
    Route::resource('departments', DepartmentController::class);
    Route::resource('leave-types', LeaveTypeController::class);
    Route::resource('users', UserController::class);

    // Menu Builder routes
    Route::get('menu-builder', [MenuBuilderController::class, 'index'])
        ->name('menu-builder.index');
    Route::get('menu-builder/{platform}', [MenuBuilderController::class, 'edit'])
        ->name('menu-builder.edit');

    // User platform-company access management
    Route::get('users/{user}/platform-company-access', [UserController::class, 'getPlatformCompanyAccess'])
        ->name('users.platform-company.access');
    Route::post('users/{user}/platforms/{platform}/companies/{company}/access', [UserController::class, 'updatePlatformCompanyAccess'])
        ->name('users.platform-company.access');
    Route::post('users/{user}/platforms/{platform}/companies/{company}/roles', [UserController::class, 'updatePlatformCompanyRoles'])
        ->name('users.platform-company.roles');
    Route::post('users/{user}/platforms/{platform}/companies/{company}/permissions', [UserController::class, 'updatePlatformCompanyPermissions'])
        ->name('users.platform-company.permissions');

    // Add regenerate secret key route
    Route::post('/platforms/{platform}/regenerate-key', [PlatformController::class, 'regenerateSecretKey'])
        ->name('platforms.regenerate-key');

    // Direct access route
    Route::post('users/{user}/direct-access', [UserController::class, 'updateDirectAccess'])
        ->name('users.direct-access');

    // Leave Request Routes
    Route::resource('leave-settings-templates', LeaveSettingsTemplateController::class);
});
