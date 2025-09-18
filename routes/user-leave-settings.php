<?php

use App\Http\Controllers\UserLeaveSettingController;
use Illuminate\Support\Facades\Route;

// User Leave Settings routes with admin role
Route::prefix('admin')->middleware(['auth', 'verified', 'role:super_admin'])->group(function () {
    Route::resource('user-leave-settings', UserLeaveSettingController::class);
});
