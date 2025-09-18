<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\OvertimeRequestController;
use App\Http\Controllers\RoleSelectionController;
use Illuminate\Support\Facades\Route;

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
    Route::resource('overtime-requests', OvertimeRequestController::class);
    Route::get('/overtime-requests-my-requests', [OvertimeRequestController::class, 'myRequests'])->name('overtime-requests.my-requests');
    Route::get('/overtime-requests-pending-approvals', [OvertimeRequestController::class, 'pendingApprovals'])->name('overtime-requests.pending-approvals');
    Route::post('/overtime-requests/{overtimeRequest}/approve', [OvertimeRequestController::class, 'approve'])->name('overtime-requests.approve');
    Route::post('/overtime-requests/{overtimeRequest}/reject', [OvertimeRequestController::class, 'reject'])->name('overtime-requests.reject');
    Route::post('/overtime-requests/{overtimeRequest}/cancel', [OvertimeRequestController::class, 'cancel'])->name('overtime-requests.cancel');

    // Leave Request Routes
    Route::resource('leave-requests', LeaveRequestController::class);
    Route::get('/leave-requests-my-requests', [LeaveRequestController::class, 'myRequests'])->name('leave-requests.my-requests');
    Route::get('/leave-requests-pending-approvals', [LeaveRequestController::class, 'pendingApprovals'])->name('leave-requests.pending-approvals');
    Route::post('/leave-requests/{leaveRequest}/approve', [LeaveRequestController::class, 'approve'])->name('leave-requests.approve');
    Route::post('/leave-requests/{leaveRequest}/reject', [LeaveRequestController::class, 'reject'])->name('leave-requests.reject');
    Route::post('/leave-requests/{leaveRequest}/cancel', [LeaveRequestController::class, 'cancel'])->name('leave-requests.cancel');
});

require __DIR__ . '/admin.php';
require __DIR__ . '/user-leave-settings.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
