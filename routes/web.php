<?php

use App\Http\Controllers\GroupController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\RoleSelectionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\DepartmentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OvertimeRequestController;

Route::get('/', [LandingPageController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Common dashboard route (redirected in login controller based on role)
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Regular user routes with app prefix
    Route::prefix('app')->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('app.dashboard');

     
        // Add other regular user routes here
    });

    // Role selection routes
    Route::post('selections/{value}', [RoleSelectionController::class, 'select'])
        ->name('roles.select');
    Route::post('selections/clear', [RoleSelectionController::class, 'clear'])
        ->name('roles.clear');

});

Route::middleware(['auth'])->group(function () {
    Route::resource('attendances', AttendanceController::class);
    Route::patch('attendance-records/{record}', [AttendanceController::class, 'updateRecord'])->name('attendance-records.update');
    Route::get('/attendances', [AttendanceController::class, 'index'])->name('attendances.index');
    Route::get('/attendances/create', [AttendanceController::class, 'create'])->name('attendances.create');
    Route::post('/attendances', [AttendanceController::class, 'store'])->name('attendances.store');
    Route::get('/attendances/{attendance}', [AttendanceController::class, 'show'])->name('attendances.show');
    Route::get('/api/attendances/members', [AttendanceController::class, 'getMembers'])->name('attendances.members');

    // Overtime Request Routes
    Route::get('/overtime-requests', [OvertimeRequestController::class, 'index'])->name('overtime-requests.index');
    Route::get('/overtime-requests/my-requests', [OvertimeRequestController::class, 'myRequests'])->name('overtime-requests.my-requests');
    Route::get('/overtime-requests/pending-approvals', [OvertimeRequestController::class, 'pendingApprovals'])->name('overtime-requests.pending-approvals');
    Route::get('/overtime-requests/create', [OvertimeRequestController::class, 'create'])->name('overtime-requests.create');
    Route::post('/overtime-requests', [OvertimeRequestController::class, 'store'])->name('overtime-requests.store');
    Route::get('/overtime-requests/{overtimeRequest}', [OvertimeRequestController::class, 'show'])->name('overtime-requests.show');
    Route::get('/overtime-requests/{overtimeRequest}/edit', [OvertimeRequestController::class, 'edit'])->name('overtime-requests.edit');
    Route::put('/overtime-requests/{overtimeRequest}', [OvertimeRequestController::class, 'update'])->name('overtime-requests.update');
    Route::delete('/overtime-requests/{overtimeRequest}', [OvertimeRequestController::class, 'destroy'])->name('overtime-requests.destroy');
    Route::post('/overtime-requests/{overtimeRequest}/approve', [OvertimeRequestController::class, 'approve'])->name('overtime-requests.approve');
    Route::post('/overtime-requests/{overtimeRequest}/reject', [OvertimeRequestController::class, 'reject'])->name('overtime-requests.reject');
    Route::post('/overtime-requests/{overtimeRequest}/cancel', [OvertimeRequestController::class, 'cancel'])->name('overtime-requests.cancel');
});

require __DIR__.'/admin.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
